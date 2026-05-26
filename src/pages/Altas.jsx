import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, BedDouble, Home, ArrowRight } from 'lucide-react'
import useVisiStore from '../store/useVisiStore'
import { SERVICES } from '../data/hierarchy'

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

const EGRESO_TYPES = [
  { id: 'alta',               label: 'Altas',                   dotColor: 'bg-emerald-500', headerColor: 'bg-emerald-50 border-emerald-200' },
  { id: 'alta_probable',      label: 'Altas Probables',         dotColor: 'bg-lime-500',    headerColor: 'bg-lime-50 border-lime-200' },
  { id: 'solicitud_traslado', label: 'Solicitudes de Traslado', dotColor: 'bg-rose-500',    headerColor: 'bg-rose-50 border-rose-200' },
]

function TaskRow({ task, patient, bed, teamLabel, service }) {
  const navigate = useNavigate()
  const old = isOlderThan24h(task.createdAt)

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${old ? 'bg-orange-50 hover:bg-orange-100' : ''}`}>
      {/* Cama */}
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

      {/* Descripción */}
      <p className="flex-1 text-xs text-gray-600 truncate">{task.description || '—'}</p>

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

function EgresoSection({ typeConfig, tasks, patients, beds, teams }) {
  const filtered = tasks.filter(t => t.type === typeConfig.id && t.status !== 'terminada')
  if (filtered.length === 0) return null

  const byService = {}
  filtered.forEach(t => {
    if (!byService[t.serviceId]) byService[t.serviceId] = []
    byService[t.serviceId].push(t)
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header sección */}
      <div className={`flex items-center gap-2 px-3 py-2 border-b ${typeConfig.headerColor}`}>
        <div className={`w-2 h-2 rounded-full ${typeConfig.dotColor}`} />
        <span className="font-semibold text-sm text-gray-900">{typeConfig.label}</span>
        <span className="ml-auto text-xs text-gray-500 font-medium">
          {filtered.length} tarea{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Encabezado columnas */}
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border-b border-gray-100">
        <span className="w-24 text-[10px] uppercase tracking-wide text-gray-400 font-medium shrink-0">Cama</span>
        <span className="w-36 text-[10px] uppercase tracking-wide text-gray-400 font-medium shrink-0">Servicio / Sector</span>
        <span className="flex-1 text-[10px] uppercase tracking-wide text-gray-400 font-medium">Descripción</span>
        <span className="w-8 text-[10px] uppercase tracking-wide text-gray-400 font-medium shrink-0">T.</span>
        <span className="w-4 shrink-0" />
      </div>

      {/* Filas por servicio */}
      {Object.entries(byService).map(([serviceId, serviceTasks]) => {
        const service = SERVICES.find(s => s.id === serviceId)
        return (
          <div key={serviceId}>
            <div className="flex items-center gap-1.5 px-3 py-0.5 bg-gray-50/70 border-b border-gray-100">
              {service && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: service.color }} />}
              <span className="text-[11px] font-semibold text-gray-500">{service?.label ?? serviceId}</span>
            </div>
            {serviceTasks.map(task => {
              const patient = patients[task.patientId]
              const bed = patient?.bedId ? beds.find(b => b.id === patient.bedId) : null
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

export default function Altas() {
  const tasks    = useVisiStore(s => Object.values(s.tasks))
  const patients = useVisiStore(s => s.patients)
  const beds     = useVisiStore(s => s.beds)
  const teams    = useVisiStore(s => s.teams)

  const egresoTypes = ['alta', 'alta_probable', 'solicitud_traslado']
  const totalCount = useMemo(
    () => tasks.filter(t => egresoTypes.includes(t.type) && t.status !== 'terminada').length,
    [tasks]
  )

  return (
    <div className="py-2">
      <div className="mb-2">
        <h1 className="text-xl font-display font-bold text-bay-blue">Altas y Traslados</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Vista consolidada de altas, altas probables y solicitudes de traslado activas.
          {totalCount > 0 && <span className="ml-2 font-medium text-gray-700">{totalCount} pendiente{totalCount !== 1 ? 's' : ''}</span>}
        </p>
      </div>

      {totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <p className="text-sm">No hay altas ni traslados pendientes.</p>
          <p className="text-xs mt-1">Las tareas de tipo Alta, Alta Probable y Solicitud de Traslado aparecerán aquí.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {EGRESO_TYPES.map(typeConfig => (
            <EgresoSection key={typeConfig.id} typeConfig={typeConfig} tasks={tasks} patients={patients} beds={beds} teams={teams} />
          ))}
        </div>
      )}
    </div>
  )
}
