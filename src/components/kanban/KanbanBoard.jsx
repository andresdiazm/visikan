import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import KanbanColumn from './KanbanColumn'
import { TaskCardContent } from './TaskCard'
import { TASK_STATUSES, TASK_TYPES } from '../../data/hierarchy'
import useVisiStore from '../../store/useVisiStore'

const COLUMN_IDS = new Set(TASK_STATUSES)

// ── Filtro por tipo ───────────────────────────────────────────────────────────
function TypeFilter({ selected, onChange }) {
  function toggle(id) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(next)
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap mb-3">
      <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide shrink-0">Filtrar:</span>
      {TASK_TYPES.map(t => {
        const active = selected.has(t.id)
        return (
          <button
            key={t.id}
            onClick={() => toggle(t.id)}
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
              active
                ? `${t.color} border-transparent shadow-sm`
                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
            }`}
          >
            {t.label}
          </button>
        )
      })}
      {selected.size > 0 && (
        <button
          onClick={() => onChange(new Set())}
          className="text-[11px] text-gray-400 hover:text-gray-600 underline ml-1"
        >
          Limpiar
        </button>
      )}
    </div>
  )
}

// ── Board ─────────────────────────────────────────────────────────────────────
export default function KanbanBoard({ teamId, serviceId }) {
  const [selectedTypes, setSelectedTypes] = useState(new Set())

  const allTasks = useVisiStore(s =>
    Object.values(s.tasks).filter(t => t.teamId === teamId)
  )
  const patients = useVisiStore(s => {
    const beds = s.beds
    const realPatients = Object.values(s.patients).filter(p => p.teamId === teamId)
    const assignedBedIds = new Set(realPatients.filter(p => p.bedId).map(p => p.bedId))

    // Camas del equipo que NO tienen paciente → entradas virtuales
    const teamKey   = serviceId ? `${serviceId}__${teamId}` : null
    const teamBedIds = teamKey ? (s.teamAssignments[teamKey] || []) : []
    const virtualPatients = teamBedIds
      .filter(bid => !assignedBedIds.has(bid))
      .map(bid => {
        const bed = beds.find(b => b.id === bid)
        if (!bed) return null
        return {
          id: `__virtual__${bid}`,
          name: '',
          rut: '',
          bedId: bid,
          serviceId: bed.serviceId,
          teamId,
          isHomeCare: false,
          _isVirtual: true,
        }
      })
      .filter(Boolean)

    return [...realPatients, ...virtualPatients].sort((a, b) => {
      const labelA = (a.bedId ? beds.find(bed => bed.id === a.bedId)?.label : null) ?? a.name
      const labelB = (b.bedId ? beds.find(bed => bed.id === b.bedId)?.label : null) ?? b.name
      return labelA.localeCompare(labelB, 'es', { numeric: true, sensitivity: 'base' })
    })
  })
  const labels   = useVisiStore(s => s.labels)
  const moveTask = useVisiStore(s => s.moveTask)

  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  // Aplicar filtro de tipos (si hay alguno seleccionado)
  const tasks = useMemo(() =>
    selectedTypes.size === 0
      ? allTasks
      : allTasks.filter(t => selectedTypes.has(t.type)),
    [allTasks, selectedTypes]
  )

  const tasksByStatus = useMemo(() => {
    const grouped = {}
    TASK_STATUSES.forEach(s => { grouped[s] = [] })
    tasks.forEach(t => {
      if (grouped[t.status]) grouped[t.status].push(t)
    })
    Object.values(grouped).forEach(arr =>
      arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    )
    return grouped
  }, [tasks])

  const tasksById = useMemo(() => {
    const map = {}
    allTasks.forEach(t => { map[t.id] = t })
    return map
  }, [allTasks])

  function handleDragStart({ active }) {
    setActiveTask(tasksById[active.id] || null)
  }

  function handleDragEnd({ active, over }) {
    setActiveTask(null)
    if (!over) return
    let targetStatus
    if (COLUMN_IDS.has(over.id)) {
      targetStatus = over.id
    } else {
      targetStatus = tasksById[over.id]?.status
    }
    const active_ = tasksById[active.id]
    if (targetStatus && active_ && active_.status !== targetStatus) {
      moveTask(active.id, targetStatus)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <TypeFilter selected={selectedTypes} onChange={setSelectedTypes} />

      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[calc(100vh-220px)]">
        {TASK_STATUSES.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            patients={patients}
            filtered={selectedTypes.size > 0}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-1 shadow-xl opacity-95">
            <TaskCardContent task={activeTask} labels={labels} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
