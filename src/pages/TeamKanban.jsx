import { useState, useRef, useEffect, useMemo } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Tags, Trash2, Plus, Search, BedDouble, Home } from 'lucide-react'
import Breadcrumb from '../components/layout/Breadcrumb'
import KanbanBoard from '../components/kanban/KanbanBoard'
import LabelManager from '../components/tasks/LabelManager'
import TaskCreateModal from '../components/tasks/TaskCreateModal'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { SERVICES } from '../data/hierarchy'
import useVisiStore from '../store/useVisiStore'
import { selectPatientsByTeam } from '../store/selectors'

export default function TeamKanban() {
  const { serviceId, teamId } = useParams()
  const [showLabels, setShowLabels] = useState(false)
  const [creatingForPatient, setCreatingForPatient] = useState(null)
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [search, setSearch] = useState('')
  const searchRef = useRef(null)

  const service = SERVICES.find(s => s.id === serviceId)
  const team = useVisiStore(s => (s.teams[serviceId] || []).find(t => t.id === teamId))

  const patients = useVisiStore(selectPatientsByTeam(teamId))
  const beds     = useVisiStore(s => s.beds)

  // Camas asignadas al equipo que NO tienen paciente (para mostrar en dropdown)
  const unassignedBeds = useVisiStore(s => {
    const key = `${serviceId}__${teamId}`
    const teamBedIds = s.teamAssignments[key] || []
    const assignedBedIds = new Set(
      Object.values(s.patients).filter(p => p.bedId).map(p => p.bedId)
    )
    return teamBedIds
      .filter(bid => !assignedBedIds.has(bid))
      .map(bid => s.beds.find(b => b.id === bid))
      .filter(Boolean)
  })
  const clearCompleted = useVisiStore(s => s.clearCompletedTasks)
  const completedCount = useVisiStore(s =>
    Object.values(s.tasks).filter(t => t.teamId === teamId && t.status === 'terminada').length
  )
  const assignPatientToBed = useVisiStore(s => s.assignPatientToBed)

  // Enriquecer con bedLabel y filtrar/ordenar para el dropdown
  // Incluye pacientes reales + camas sin paciente asignado
  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase()

    const withPatient = patients.map(p => ({
      ...p,
      bedLabel: p.bedId ? beds.find(b => b.id === p.bedId)?.label ?? null : null,
    }))

    const withoutPatient = unassignedBeds.map(bed => ({
      id: `__virtual__${bed.id}`,
      name: '',
      bedId: bed.id,
      bedLabel: bed.label,
      serviceId: bed.serviceId,
      teamId,
      isHomeCare: false,
      _isVirtual: true,
    }))

    return [...withPatient, ...withoutPatient]
      .filter(p => {
        if (!q) return true
        return (p.bedLabel ?? p.name ?? '').toLowerCase().includes(q)
      })
      .sort((a, b) =>
        (a.bedLabel ?? a.name ?? '').localeCompare(b.bedLabel ?? b.name ?? '', 'es', { numeric: true, sensitivity: 'base' })
      )
  }, [patients, beds, unassignedBeds, search, teamId])

  if (!service || !team) return <Navigate to="/" replace />

  return (
    <div className="py-2">
      <Breadcrumb items={[
        { label: 'Inicio', href: '/' },
        { label: service.label, href: `/service/${serviceId}` },
        { label: team.label },
      ]} />

      <div className="flex items-center gap-3 mt-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: service.color }} />
          <h1 className="text-xl font-display font-bold text-bay-blue">{team.label}</h1>
          <span className="text-sm text-gray-500">
            · {patients.length} paciente{patients.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">

          {completedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm(`¿Limpiar ${completedCount} tarea${completedCount !== 1 ? 's' : ''} terminada${completedCount !== 1 ? 's' : ''}?`)) {
                  clearCompleted(teamId)
                }
              }}
              className="text-gray-500"
            >
              <Trash2 size={14} />
              Limpiar terminadas ({completedCount})
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => setShowLabels(true)}>
            <Tags size={14} /> Etiquetas
          </Button>
        </div>
      </div>

      {patients.length === 0 && unassignedBeds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <p className="text-base">No hay camas asignadas a este sector.</p>
          <p className="text-sm mt-1">
            Ve a <a href="/sectores" className="text-teal-600 hover:underline">Sectores</a> para asignar camas.
          </p>
        </div>
      ) : (
        <KanbanBoard teamId={teamId} serviceId={serviceId} />
      )}

      {/* FAB — botón + fijo arriba a la derecha */}
      {(patients.length > 0 || unassignedBeds.length > 0) && (
        <button
          onClick={() => { setShowPatientDropdown(true); setSearch('') }}
          className="fixed top-16 right-4 z-30 bg-teal text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-teal-600 active:scale-95 transition-all"
          title="Nueva tarea"
        >
          <Plus size={22} />
        </button>
      )}

      {/* Modal selector de cama */}
      {showPatientDropdown && (
        <Modal
          title="Nueva tarea"
          onClose={() => { setShowPatientDropdown(false); setSearch('') }}
          size="sm"
        >
          <div className="flex flex-col gap-3">
            {/* Buscador */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar sala o cama..."
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
                autoFocus
              />
            </div>

            {/* Lista de camas / pacientes */}
            <div className="flex flex-col divide-y divide-gray-100">
              {filteredPatients.length === 0 ? (
                <p className="py-6 text-sm text-gray-400 italic text-center">Sin resultados</p>
              ) : (
                filteredPatients.map(p => (
                  <button
                    key={p.id}
                    className="flex items-center gap-3 py-3 text-left hover:bg-gray-50 rounded-lg px-1 transition-colors"
                    onClick={async () => {
                      setShowPatientDropdown(false)
                      setSearch('')
                      if (p._isVirtual) {
                        const newPat = await assignPatientToBed(p.bedId, '', '')
                        if (newPat) setCreatingForPatient(newPat)
                      } else {
                        setCreatingForPatient(p)
                      }
                    }}
                  >
                    {p.isHomeCare
                      ? <Home size={15} className="text-purple-400 shrink-0" />
                      : <BedDouble size={15} className="text-gray-400 shrink-0" />
                    }
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {p.bedLabel ?? p.name}
                      </p>
                      {p.bedLabel && p.name && (
                        <p className="text-xs text-gray-400 truncate">{p.name}</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </Modal>
      )}

      {showLabels && <LabelManager onClose={() => setShowLabels(false)} />}
      {creatingForPatient && (
        <TaskCreateModal patient={creatingForPatient} onClose={() => setCreatingForPatient(null)} />
      )}
    </div>
  )
}
