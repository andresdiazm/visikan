import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, BedDouble, Home, ArrowRight, Share2, X, AlertTriangle } from 'lucide-react'
import useVisiStore from '../store/useVisiStore'
import { SERVICES } from '../data/hierarchy'

// ── Helpers ───────────────────────────────────────────────────────────────────
function getContrastColor(hex) {
  const h = (hex || '#000000').replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#1a1a1a' : '#ffffff'
}

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

// ── Fila individual ───────────────────────────────────────────────────────────
function TaskRow({ task, patient, bed, teamLabel, service, labels }) {
  const navigate  = useNavigate()
  const old       = isOlderThan24h(task.createdAt)
  const taskLabels = labels.filter(l => task.labels.includes(l.id))

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
      old ? 'bg-orange-50 hover:bg-orange-100' : ''
    }`}>

      {/* Cama / Paciente */}
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
      <div className="w-32 shrink-0">
        <p className="text-xs text-gray-700 truncate font-medium">{service?.label ?? '—'}</p>
        <p className="text-[10px] text-gray-400 truncate">{teamLabel ?? '—'}</p>
      </div>

      {/* Etiquetas */}
      <div className="w-32 shrink-0 flex flex-wrap gap-0.5">
        {taskLabels.length > 0 ? (
          <>
            {taskLabels.slice(0, 2).map(lbl => (
              <span
                key={lbl.id}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded leading-tight whitespace-nowrap"
                style={{ backgroundColor: lbl.color, color: getContrastColor(lbl.color) }}
              >
                {lbl.name}
              </span>
            ))}
            {taskLabels.length > 2 && (
              <span className="text-[9px] text-gray-400 self-center">+{taskLabels.length - 2}</span>
            )}
          </>
        ) : (
          <span className="text-[10px] text-gray-300">—</span>
        )}
      </div>

      {/* Descripción */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-600 truncate">{task.description || '—'}</p>
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

// ── Chip de filtro ────────────────────────────────────────────────────────────
function FilterChip({ label, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
        active ? 'text-white border-transparent' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
      }`}
      style={active && color ? { backgroundColor: color, borderColor: color } : (active ? { backgroundColor: '#1A3A6B' } : {})}
    >
      {label}
      {active && <X size={9} className="opacity-70" />}
    </button>
  )
}

// ── Sección por servicio ──────────────────────────────────────────────────────
function ServiceSection({ service, tasks, patients, beds, teams, labels }) {
  if (tasks.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Cabecera servicio */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50 border-gray-200">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: service.color }} />
        <span className="font-semibold text-sm text-gray-900">{service.label}</span>
        <span className="ml-auto text-xs text-gray-500 font-medium">
          {tasks.length} tarea{tasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Encabezado columnas */}
      <div className="flex items-center gap-2 px-3 py-1 bg-gray-50/60 border-b border-gray-100">
        <span className="w-24 text-[10px] uppercase tracking-wide text-gray-400 font-medium shrink-0">Cama</span>
        <span className="w-32 text-[10px] uppercase tracking-wide text-gray-400 font-medium shrink-0">Servicio / Sector</span>
        <span className="w-32 text-[10px] uppercase tracking-wide text-gray-400 font-medium shrink-0">Etiqueta</span>
        <span className="flex-1 text-[10px] uppercase tracking-wide text-gray-400 font-medium">Descripción</span>
        <span className="w-8 text-[10px] uppercase tracking-wide text-gray-400 font-medium shrink-0">T.</span>
        <span className="w-4 shrink-0" />
      </div>

      {/* Filas */}
      {tasks.map(task => {
        const patient   = patients[task.patientId]
        const bed       = patient?.bedId ? beds.find(b => b.id === patient.bedId) : null
        const teamLabel = teams[service.id]?.find(t => t.id === task.teamId)?.label
        return (
          <TaskRow
            key={task.id}
            task={task}
            patient={patient}
            bed={bed}
            teamLabel={teamLabel}
            service={service}
            labels={labels}
          />
        )
      })}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Interconsultas() {
  const allTasks = useVisiStore(s =>
    Object.values(s.tasks).filter(t => t.type === 'interequipo' && t.status !== 'terminada')
  )
  const patients = useVisiStore(s => s.patients)
  const beds     = useVisiStore(s => s.beds)
  const teams    = useVisiStore(s => s.teams)
  const labels   = useVisiStore(s => s.labels)

  // Filtros
  const [filterLabels,  setFilterLabels]  = useState(new Set())
  const [filterService, setFilterService] = useState('')
  const [filterSector,  setFilterSector]  = useState('')
  const [filter48h,     setFilter48h]     = useState(false)

  const MS_48H = 48 * 60 * 60 * 1000

  const activeServices = useMemo(() => {
    const ids = new Set(allTasks.map(t => t.serviceId))
    return SERVICES.filter(s => ids.has(s.id))
  }, [allTasks])

  const activeSectors = useMemo(() => {
    const serviceTeams = filterService ? (teams[filterService] || []) : Object.values(teams).flat()
    const teamIds = new Set(allTasks.map(t => t.teamId))
    return serviceTeams.filter(t => teamIds.has(t.id))
  }, [allTasks, teams, filterService])

  const activeLabels = useMemo(() => {
    const usedIds = new Set(allTasks.flatMap(t => t.labels))
    return labels.filter(l => usedIds.has(l.id))
  }, [allTasks, labels])

  const filtered = useMemo(() => allTasks.filter(t => {
    if (filterService && t.serviceId !== filterService) return false
    if (filterSector  && t.teamId    !== filterSector)  return false
    if (filterLabels.size > 0 && !t.labels.some(l => filterLabels.has(l))) return false
    if (filter48h && (Date.now() - new Date(t.createdAt).getTime()) <= MS_48H) return false
    return true
  }), [allTasks, filterService, filterSector, filterLabels, filter48h])

  // Agrupar por servicio (orden del array SERVICES)
  const byService = useMemo(() => {
    const map = {}
    filtered.forEach(t => {
      if (!map[t.serviceId]) map[t.serviceId] = []
      map[t.serviceId].push(t)
    })
    return map
  }, [filtered])

  const totalCount = filtered.length
  const hasFilters = filterService || filterSector || filterLabels.size > 0 || filter48h

  function toggleLabel(id) {
    setFilterLabels(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function clearFilters() {
    setFilterService('')
    setFilterSector('')
    setFilterLabels(new Set())
    setFilter48h(false)
  }

  return (
    <div className="py-2">
      {/* Encabezado */}
      <div className="mb-3">
        <h1 className="text-xl font-display font-bold text-bay-blue flex items-center gap-2">
          <Share2 size={20} className="text-yellow-500" />
          Interconsultas
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Interconsultas pendientes entre equipos en todos los servicios.
          {totalCount > 0 && (
            <span className="ml-2 font-medium text-gray-700">
              {totalCount} pendiente{totalCount !== 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      {/* ── Filtros ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 mb-3 flex flex-col gap-2">

        {/* > 48h */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide shrink-0 w-16">Estado:</span>
          <button
            onClick={() => setFilter48h(v => !v)}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
              filter48h
                ? 'bg-orange-500 text-white border-transparent'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            <AlertTriangle size={10} className={filter48h ? 'opacity-90' : 'text-orange-400'} />
            Más de 48h pendiente
            {filter48h && <X size={9} className="opacity-70 ml-0.5" />}
          </button>
        </div>

        {/* Etiquetas */}
        {activeLabels.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide shrink-0 w-16">Etiqueta:</span>
            {activeLabels.map(lbl => (
              <FilterChip
                key={lbl.id}
                label={lbl.name}
                active={filterLabels.has(lbl.id)}
                color={lbl.color}
                onClick={() => toggleLabel(lbl.id)}
              />
            ))}
          </div>
        )}

        {/* Servicio */}
        {activeServices.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide shrink-0 w-16">Servicio:</span>
            {activeServices.map(s => (
              <FilterChip
                key={s.id}
                label={s.label}
                active={filterService === s.id}
                color={s.color}
                onClick={() => {
                  setFilterService(prev => prev === s.id ? '' : s.id)
                  setFilterSector('')
                }}
              />
            ))}
          </div>
        )}

        {/* Sector */}
        {activeSectors.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide shrink-0 w-16">Sector:</span>
            {activeSectors.map(team => (
              <FilterChip
                key={team.id}
                label={team.label}
                active={filterSector === team.id}
                onClick={() => setFilterSector(prev => prev === team.id ? '' : team.id)}
              />
            ))}
          </div>
        )}

        {hasFilters && (
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="text-[11px] text-gray-400 hover:text-gray-600 underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* ── Contenido ───────────────────────────────────────────────────── */}
      {totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Share2 size={32} className="mb-3 opacity-30" />
          <p className="text-sm">
            {hasFilters
              ? 'Sin resultados con los filtros aplicados.'
              : 'No hay interconsultas pendientes.'}
          </p>
          {!hasFilters && (
            <p className="text-xs mt-1">
              Las tareas de tipo Interconsulta aparecerán aquí.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {SERVICES.filter(s => byService[s.id]).map(service => (
            <ServiceSection
              key={service.id}
              service={service}
              tasks={byService[service.id]}
              patients={patients}
              beds={beds}
              teams={teams}
              labels={labels}
            />
          ))}
        </div>
      )}
    </div>
  )
}
