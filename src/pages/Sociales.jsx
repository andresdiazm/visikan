import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, BedDouble, Home, ArrowRight, Users } from 'lucide-react'
import useVisiStore from '../store/useVisiStore'
import { SERVICES } from '../data/hierarchy'
import { parseNotesMeta, SOCIAL_ESTADO_META } from '../lib/taskMeta'

function timeAgo(isoString) {
  if (!isoString) return ''
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'ahora'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function isOlderThan24h(isoString) {
  if (!isoString) return false
  return (Date.now() - new Date(isoString).getTime()) > 24 * 60 * 60 * 1000
}

// ── Fila individual ──────────────────────────────────────────────────────────
function TaskRow({ task, patient, bed, teamLabel, service }) {
  const navigate = useNavigate()
  const old = isOlderThan24h(task.createdAt)
  const { socialEstado, userNotes } = parseNotesMeta(task.notes)
  const socialMeta = socialEstado ? SOCIAL_ESTADO_META[socialEstado] : null

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${old ? 'bg-orange-50 hover:bg-orange-100' : ''}`}>
      {/* Cama / paciente */}
      <div className="flex items-center gap-1 w-24 shrink-0">
        {patient?.isHomeCare
          ? <Home size={11} className="text-purple-400 shrink-0" />
          : <BedDouble size={11} className="text-gray-400 shrink-0" />
        }
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">
            {bed?.label ?? patient?.name ?? '—'}
          </p>
          {bed && <p className="text-[10px] text-gray-400 truncate">{patient?.name}</p>}
        </div>
      </div>

      {/* Servicio + Sector */}
      <div className="w-36 shrink-0">
        <p className="text-xs text-gray-700 truncate font-medium">{service?.label ?? '—'}</p>
        <p className="text-[10px] text-gray-400 truncate">{teamLabel ?? '—'}</p>
      </div>

      {/* Estado alta médica */}
      <div className="w-32 shrink-0">
        {socialMeta ? (
          <span className={`inline-block text-[10px] font-semibold border rounded px-1.5 py-0.5 ${socialMeta.color}`}>
            {socialMeta.label}
          </span>
        ) : (
          <span className="text-[10px] text-gray-300 italic">Sin estado</span>
        )}
      </div>

      {/* Descripción */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-600 truncate">{task.description || '—'}</p>
        {userNotes && (
          <p className="text-[10px] text-gray-400 truncate">{userNotes}</p>
        )}
      </div>

      {/* Timestamp */}
      <div className={`flex items-center gap-0.5 shrink-0 ${old ? 'text-orange-500' : 'text-gray-400'}`}>
        <Clock size={10} />
        <span className="text-[10px] whitespace-nowrap">{timeAgo(task.createdAt)}</span>
      </div>

      {/* Ir al kanban */}
      <button
        onClick={() => navigate(`/service/${task.serviceId}/team/${task.teamId}`)}
        className="shrink-0 text-gray-300 hover:text-teal-500 transition-colors"
        title="Ir al tablero"
      >
        <ArrowRight size={13} />
      </button>
    </div>
  )
}

// ── Sección por estado ───────────────────────────────────────────────────────
const ESTADO_SECTIONS = [
  { id: 'con_alta', label: 'Con alta médica',  dotColor: 'bg-emerald-500', headerColor: 'bg-emerald-50 border-emerald-200' },
  { id: 'sin_alta', label: 'Sin alta médica',  dotColor: 'bg-amber-500',   headerColor: 'bg-amber-50 border-amber-200' },
  { id: '',         label: 'Sin estado',       dotColor: 'bg-gray-400',    headerColor: 'bg-gray-50 border-gray-200' },
]

function EstadoSection({ estadoConfig, tasks, patients, beds, teams, selectedService }) {
  const filtered = tasks.filter(t => {
    const { socialEstado } = parseNotesMeta(t.notes)
    const matchEstado   = socialEstado === estadoConfig.id
    const matchService  = !selectedService || t.serviceId === selectedService
    return matchEstado && matchService && t.status !== 'terminada'
  })
  if (filtered.length === 0) return null

  const byService = {}
  filtered.forEach(t => {
    if (!byService[t.serviceId]) byService[t.serviceId] = []
    byService[t.serviceId].push(t)
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className={`flex items-center gap-2 px-3 py-2 border-b ${estadoConfig.headerColor}`}>
        <div className={`w-2 h-2 rounded-full ${estadoConfig.dotColor}`} />
        <span className="font-semibold text-sm text-gray-900">{estadoConfig.label}</span>
        <span className="ml-auto text-xs text-gray-500 font-medium">
          {filtered.length} caso{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Encabezado columnas */}
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border-b border-gray-100">
        <span className="w-24 text-[10px] uppercase tracking-wide text-gray-400 font-medium shrink-0">Cama</span>
        <span className="w-36 text-[10px] uppercase tracking-wide text-gray-400 font-medium shrink-0">Servicio / Sector</span>
        <span className="w-32 text-[10px] uppercase tracking-wide text-gray-400 font-medium shrink-0">Alta médica</span>
        <span className="flex-1 text-[10px] uppercase tracking-wide text-gray-400 font-medium">Descripción</span>
        <span className="w-8 text-[10px] uppercase tracking-wide text-gray-400 font-medium shrink-0">T.</span>
        <span className="w-4 shrink-0" />
      </div>

      {Object.entries(byService).map(([serviceId, serviceTasks]) => {
        const service = SERVICES.find(s => s.id === serviceId)
        return (
          <div key={serviceId}>
            <div className="flex items-center gap-1.5 px-3 py-0.5 bg-gray-50/70 border-b border-gray-100">
              {service && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: service.color }} />}
              <span className="text-[11px] font-semibold text-gray-500">{service?.label ?? serviceId}</span>
            </div>
            {serviceTasks.map(task => {
              const patient  = patients[task.patientId]
              const bed      = patient?.bedId ? beds.find(b => b.id === patient.bedId) : null
              const teamLabel = teams[serviceId]?.find(t => t.id === task.teamId)?.label
              return (
                <TaskRow key={task.id} task={task} patient={patient} bed={bed} teamLabel={teamLabel} service={service} />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Sociales() {
  const tasks    = useVisiStore(s => Object.values(s.tasks).filter(t => t.type === 'trabajo_social'))
  const patients = useVisiStore(s => s.patients)
  const beds     = useVisiStore(s => s.beds)
  const teams    = useVisiStore(s => s.teams)

  const [selectedService, setSelectedService] = useState('')

  // Servicios que tienen tareas sociales activas
  const activeServiceIds = useMemo(() => {
    const ids = new Set(tasks.filter(t => t.status !== 'terminada').map(t => t.serviceId))
    return SERVICES.filter(s => ids.has(s.id))
  }, [tasks])

  const totalCount = useMemo(
    () => tasks.filter(t => t.status !== 'terminada' && (!selectedService || t.serviceId === selectedService)).length,
    [tasks, selectedService]
  )

  return (
    <div className="py-2">
      {/* Encabezado */}
      <div className="mb-3">
        <h1 className="text-xl font-display font-bold text-bay-blue flex items-center gap-2">
          <Users size={20} className="text-orange-500" />
          Trabajo Social
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Casos de trabajo social activos en todos los servicios.
          {totalCount > 0 && <span className="ml-2 font-medium text-gray-700">{totalCount} pendiente{totalCount !== 1 ? 's' : ''}</span>}
        </p>
      </div>

      {/* Filtro de servicios */}
      {activeServiceIds.length > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide shrink-0">Servicio:</span>
          <button
            onClick={() => setSelectedService('')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
              !selectedService
                ? 'bg-bay-blue text-white border-transparent'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            Todos
          </button>
          {activeServiceIds.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedService(prev => prev === s.id ? '' : s.id)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                selectedService === s.id
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
              style={selectedService === s.id ? { backgroundColor: s.color, borderColor: s.color } : {}}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Users size={32} className="mb-3 opacity-30" />
          <p className="text-sm">No hay casos de trabajo social pendientes.</p>
          <p className="text-xs mt-1">Los casos aparecerán aquí al crear tareas de tipo Social.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {ESTADO_SECTIONS.map(sec => (
            <EstadoSection
              key={sec.id}
              estadoConfig={sec}
              tasks={tasks}
              patients={patients}
              beds={beds}
              teams={teams}
              selectedService={selectedService}
            />
          ))}
        </div>
      )}
    </div>
  )
}
