import { useState, useRef, useEffect, useMemo } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Tags, Trash2, Plus, ChevronDown, Search, BedDouble, Home } from 'lucide-react'
import Breadcrumb from '../components/layout/Breadcrumb'
import KanbanBoard from '../components/kanban/KanbanBoard'
import LabelManager from '../components/tasks/LabelManager'
import TaskCreateModal from '../components/tasks/TaskCreateModal'
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
  const dropdownRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowPatientDropdown(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Enfocar buscador al abrir dropdown
  useEffect(() => {
    if (showPatientDropdown && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [showPatientDropdown])

  const service = SERVICES.find(s => s.id === serviceId)
  const team = useVisiStore(s => (s.teams[serviceId] || []).find(t => t.id === teamId))

  const patients = useVisiStore(selectPatientsByTeam(teamId))
  const beds     = useVisiStore(s => s.beds)
  const clearCompleted = useVisiStore(s => s.clearCompletedTasks)
  const completedCount = useVisiStore(s =>
    Object.values(s.tasks).filter(t => t.teamId === teamId && t.status === 'terminada').length
  )

  // Enriquecer con bedLabel y filtrar/ordenar para el dropdown
  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase()
    return patients
      .map(p => ({
        ...p,
        bedLabel: p.bedId ? beds.find(b => b.id === p.bedId)?.label ?? null : null,
      }))
      .filter(p => {
        if (!q) return true
        return (p.bedLabel ?? p.name).toLowerCase().includes(q)
      })
      .sort((a, b) =>
        (a.bedLabel ?? a.name).localeCompare(b.bedLabel ?? b.name, 'es', { numeric: true, sensitivity: 'base' })
      )
  }, [patients, beds, search])

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
                onClick={() => { setShowPatientDropdown(v => !v); setSearch('') }}
              >
                <Plus size={14} /> Nueva tarea <ChevronDown size={12} />
              </Button>

              {showPatientDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-64">
                  {/* Buscador */}
                  <div className="px-2 pt-2 pb-1">
                    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                      <Search size={12} className="text-gray-400 shrink-0" />
                      <input
                        ref={searchRef}
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar sala o cama..."
                        className="flex-1 text-xs bg-transparent outline-none text-gray-700 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  {/* Lista */}
                  <div className="max-h-64 overflow-y-auto pb-1">
                    {filteredPatients.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-gray-400 italic text-center">Sin resultados</p>
                    ) : (
                      filteredPatients.map(p => (
                        <button
                          key={p.id}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 last:rounded-b-xl transition-colors"
                          onClick={() => {
                            setCreatingForPatient(p)
                            setShowPatientDropdown(false)
                            setSearch('')
                          }}
                        >
                          {p.isHomeCare
                            ? <Home size={13} className="text-purple-400 shrink-0" />
                            : <BedDouble size={13} className="text-gray-400 shrink-0" />
                          }
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">
                              {p.bedLabel ?? p.name}
                            </p>
                            {p.bedLabel && (
                              <p className="text-[10px] text-gray-400 truncate">{p.name}</p>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
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
