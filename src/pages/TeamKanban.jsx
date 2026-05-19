import { useState, useRef, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Tags, Trash2, Plus, ChevronDown } from 'lucide-react'
import Breadcrumb from '../components/layout/Breadcrumb'
import KanbanBoard from '../components/kanban/KanbanBoard'
import LabelManager from '../components/tasks/LabelManager'
import TaskCreateModal from '../components/tasks/TaskCreateModal'
import Button from '../components/ui/Button'
import { SERVICES, TEAMS } from '../data/hierarchy'
import useVisiStore from '../store/useVisiStore'
import { selectPatientsByTeam } from '../store/selectors'

export default function TeamKanban() {
  const { serviceId, teamId } = useParams()
  const [showLabels, setShowLabels] = useState(false)
  const [creatingForPatient, setCreatingForPatient] = useState(null)
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowPatientDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const service = SERVICES.find(s => s.id === serviceId)
  const teams = TEAMS[serviceId] || []
  const team = teams.find(t => t.id === teamId)

  const patients = useVisiStore(selectPatientsByTeam(teamId))
  const clearCompleted = useVisiStore(s => s.clearCompletedTasks)
  const completedCount = useVisiStore(s =>
    Object.values(s.tasks).filter(t => t.teamId === teamId && t.status === 'terminada').length
  )

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
          {patients.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPatientDropdown(v => !v)}
              >
                <Plus size={14} /> Nueva tarea <ChevronDown size={12} />
              </Button>
              {showPatientDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[200px]">
                  <p className="px-3 pt-2 pb-1 text-xs font-medium text-gray-400 uppercase tracking-wide">Seleccionar paciente</p>
                  {patients.map(p => (
                    <button
                      key={p.id}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-xl"
                      onClick={() => { setCreatingForPatient(p); setShowPatientDropdown(false) }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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

      {patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <p className="text-base">No hay pacientes asignados a este equipo.</p>
          <p className="text-sm mt-1">
            Ve a <a href="/" className="text-teal-600 hover:underline">Inicio</a> para asignar camas y pacientes.
          </p>
        </div>
      ) : (
        <KanbanBoard teamId={teamId} />
      )}

      {showLabels && <LabelManager onClose={() => setShowLabels(false)} />}
      {creatingForPatient && (
        <TaskCreateModal patient={creatingForPatient} onClose={() => setCreatingForPatient(null)} />
      )}
    </div>
  )
}
