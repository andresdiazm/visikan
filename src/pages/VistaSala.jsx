import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BedDouble, Home, Layers, ChevronRight, X } from 'lucide-react'
import useVisiStore from '../store/useVisiStore'
import { SERVICES, TASK_TYPES, STATUS_META } from '../data/hierarchy'

function salaFromLabel(label) {
  if (!label) return '—'
  const idx = label.indexOf('-')
  return idx > 0 ? label.slice(0, idx) : label
}

// ── Chip de tarea individual ──────────────────────────────────────────────────
function TaskChip({ task, onClick }) {
  const typeMeta   = TASK_TYPES.find(t => t.id === task.type)
  const statusMeta = STATUS_META[task.status]
  const ageMs      = Date.now() - new Date(task.createdAt).getTime()
  const old        = ageMs > 24 * 3600 * 1000
  const urgent     = task.priority === 'urgente'

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-opacity hover:opacity-75 ${
        urgent ? 'border-red-300 bg-red-50 text-red-700' :
        old    ? 'border-orange-300 bg-orange-50 text-orange-700' :
                 'border-gray-200 bg-gray-50 text-gray-600'
      }`}
      title={`${typeMeta?.label ?? task.type} · ${statusMeta?.label ?? task.status}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusMeta?.dot ?? 'bg-gray-300'}`} />
      <span>{typeMeta?.label ?? task.type}</span>
      {urgent && <span className="text-red-500 font-bold">!</span>}
    </button>
  )
}

// ── Fila de cama ──────────────────────────────────────────────────────────────
function BedRow({ bed, patient, patientTasks, teamLabel, navigate }) {
  const hasUrgent = patientTasks.some(t => t.priority === 'urgente')
  const hasOld    = patientTasks.some(t => (Date.now() - new Date(t.createdAt).getTime()) > 24 * 3600 * 1000)
  const activeTasks = patientTasks.filter(t => t.status !== 'terminada')

  return (
    <div className={`flex items-start gap-2 px-3 py-2 border-b border-gray-100 last:border-0 ${
      hasUrgent ? 'bg-red-50' : hasOld ? 'bg-orange-50' : ''
    }`}>
      {/* Cama */}
      <div className="flex items-center gap-1 w-14 shrink-0 pt-0.5">
        {patient?.isHomeCare
          ? <Home size={11} className="text-purple-400 shrink-0" />
          : <BedDouble size={11} className={patient ? 'text-teal-500 shrink-0' : 'text-gray-200 shrink-0'} />
        }
        <span className="text-xs font-bold text-gray-700">{bed.label}</span>
      </div>

      {/* Paciente + sector */}
      <div className="w-36 shrink-0 pt-0.5">
        {patient ? (
          <>
            <p className="text-xs font-medium text-gray-800 truncate leading-tight">
              {patient.name || <span className="italic text-gray-400">Sin nombre</span>}
            </p>
            {teamLabel && (
              <p className="text-[10px] text-gray-400 truncate">{teamLabel}</p>
            )}
          </>
        ) : (
          <p className="text-xs text-gray-300 italic">Vacía</p>
        )}
      </div>

      {/* Chips de tareas activas */}
      <div className="flex flex-wrap gap-1 flex-1">
        {activeTasks.length === 0 ? (
          <span className="text-[10px] text-gray-300 pt-0.5">
            {patientTasks.length > 0 ? 'Todo terminado' : 'Sin tareas'}
          </span>
        ) : (
          activeTasks.map(task => (
            <TaskChip
              key={task.id}
              task={task}
              onClick={() => navigate(`/service/${task.serviceId}/team/${task.teamId}`)}
            />
          ))
        )}
      </div>

      {/* Ir al kanban */}
      {patient && (
        <button
          onClick={() => navigate(`/service/${patient.serviceId}/team/${patient.teamId}`)}
          className="shrink-0 text-gray-200 hover:text-teal-500 transition-colors self-center"
          title="Ir al tablero"
        >
          <ChevronRight size={13} />
        </button>
      )}
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function VistaSala() {
  const beds            = useVisiStore(s => s.beds)
  const patients        = useVisiStore(s => s.patients)
  const tasks           = useVisiStore(s => s.tasks)
  const teams           = useVisiStore(s => s.teams)
  const teamAssignments = useVisiStore(s => s.teamAssignments)

  const [filterService, setFilterService] = useState('')
  const navigate = useNavigate()

  // Camas asignadas a algún sector
  const assignedBedIds = useMemo(
    () => new Set(Object.values(teamAssignments).flat()),
    [teamAssignments]
  )

  // Paciente por cama (lookup inverso)
  const patientByBed = useMemo(() => {
    const map = {}
    Object.values(patients).forEach(p => { if (p.bedId) map[p.bedId] = p })
    return map
  }, [patients])

  // Tareas por paciente (todas, incluyendo terminadas para el indicador visual)
  const tasksByPatient = useMemo(() => {
    const map = {}
    Object.values(tasks).forEach(t => {
      if (!map[t.patientId]) map[t.patientId] = []
      map[t.patientId].push(t)
    })
    return map
  }, [tasks])

  // Camas visibles (asignadas + filtro de servicio)
  const visibleBeds = useMemo(() =>
    beds.filter(b => assignedBedIds.has(b.id) && (!filterService || b.serviceId === filterService)),
    [beds, assignedBedIds, filterService]
  )

  // Agrupar por (serviceId, sala) y ordenar
  const salaGroups = useMemo(() => {
    const map = {}
    visibleBeds.forEach(bed => {
      const sala = salaFromLabel(bed.label)
      const key  = `${bed.serviceId}::${sala}`
      if (!map[key]) map[key] = { sala, serviceId: bed.serviceId, beds: [] }
      map[key].beds.push(bed)
    })
    return Object.values(map)
      .map(g => ({
        ...g,
        beds: [...g.beds].sort((a, b) =>
          a.label.localeCompare(b.label, 'es', { numeric: true, sensitivity: 'base' })
        ),
      }))
      .sort((a, b) => {
        const si = SERVICES.findIndex(s => s.id === a.serviceId)
        const sj = SERVICES.findIndex(s => s.id === b.serviceId)
        if (si !== sj) return si - sj
        return a.sala.localeCompare(b.sala, 'es', { numeric: true, sensitivity: 'base' })
      })
  }, [visibleBeds])

  // Servicios activos (con camas asignadas)
  const activeServices = useMemo(() => {
    const ids = new Set(beds.filter(b => assignedBedIds.has(b.id)).map(b => b.serviceId))
    return SERVICES.filter(s => ids.has(s.id))
  }, [beds, assignedBedIds])

  // Totales para el subtítulo
  const totalBeds   = visibleBeds.length
  const totalActive = visibleBeds.filter(b => patientByBed[b.id]).length

  return (
    <div className="py-2">
      {/* Encabezado */}
      <div className="mb-3">
        <h1 className="text-xl font-display font-bold text-bay-blue flex items-center gap-2">
          <Layers size={20} className="text-teal-500" />
          Vista por Sala
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {totalActive} cama{totalActive !== 1 ? 's' : ''} ocupada{totalActive !== 1 ? 's' : ''} de {totalBeds} asignada{totalBeds !== 1 ? 's' : ''}
          {filterService && ` · ${SERVICES.find(s => s.id === filterService)?.label}`}
        </p>
      </div>

      {/* Filtro de servicio */}
      {activeServices.length > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <button
            onClick={() => setFilterService('')}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
              !filterService
                ? 'bg-bay-blue text-white border-transparent'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            Todos
          </button>
          {activeServices.map(s => (
            <button
              key={s.id}
              onClick={() => setFilterService(prev => prev === s.id ? '' : s.id)}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                filterService === s.id
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
              style={filterService === s.id ? { backgroundColor: s.color } : {}}
            >
              {s.label}
              {filterService === s.id && <X size={9} className="opacity-70" />}
            </button>
          ))}
        </div>
      )}

      {/* Grupos de sala */}
      {salaGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Layers size={32} className="mb-3 opacity-30" />
          <p className="text-sm">No hay salas configuradas.</p>
          <p className="text-xs mt-1">
            Ve a <a href="/sectores" className="text-teal-600 hover:underline">Sectores</a> para asignar camas.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {salaGroups.map(group => {
            const service = SERVICES.find(s => s.id === group.serviceId)
            const occupiedCount = group.beds.filter(b => patientByBed[b.id]).length

            return (
              <div
                key={`${group.serviceId}::${group.sala}`}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Header de sala */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                  {service && (
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: service.color }} />
                  )}
                  <span className="font-bold text-sm text-gray-800">Sala {group.sala}</span>
                  {!filterService && service && (
                    <span className="text-xs text-gray-400">{service.label}</span>
                  )}
                  <span className="ml-auto text-xs text-gray-400">
                    {occupiedCount}/{group.beds.length} ocupada{group.beds.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Encabezado columnas */}
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-50/40 border-b border-gray-100">
                  <span className="w-14 text-[9px] uppercase tracking-wide text-gray-300 font-medium shrink-0">Cama</span>
                  <span className="w-36 text-[9px] uppercase tracking-wide text-gray-300 font-medium shrink-0">Paciente / Sector</span>
                  <span className="flex-1 text-[9px] uppercase tracking-wide text-gray-300 font-medium">Tareas activas</span>
                  <span className="w-4 shrink-0" />
                </div>

                {/* Filas de camas */}
                {group.beds.map(bed => {
                  const patient     = patientByBed[bed.id] ?? null
                  const ptasks      = patient ? (tasksByPatient[patient.id] ?? []) : []
                  const teamLabel   = patient
                    ? teams[patient.serviceId]?.find(t => t.id === patient.teamId)?.label ?? ''
                    : ''
                  return (
                    <BedRow
                      key={bed.id}
                      bed={bed}
                      patient={patient}
                      patientTasks={ptasks}
                      teamLabel={teamLabel}
                      navigate={navigate}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
