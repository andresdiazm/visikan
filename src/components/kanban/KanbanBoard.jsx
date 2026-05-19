import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import KanbanColumn from './KanbanColumn'
import { TaskCardContent } from './TaskCard'
import { TASK_STATUSES } from '../../data/hierarchy'
import useVisiStore from '../../store/useVisiStore'

const COLUMN_IDS = new Set(TASK_STATUSES)

export default function KanbanBoard({ teamId }) {
  const tasks = useVisiStore(s =>
    Object.values(s.tasks).filter(t => t.teamId === teamId)
  )
  const patients = useVisiStore(s =>
    Object.values(s.patients).filter(p => p.teamId === teamId)
  )
  const labels = useVisiStore(s => s.labels)
  const moveTask = useVisiStore(s => s.moveTask)

  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
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
    tasks.forEach(t => { map[t.id] = t })
    return map
  }, [tasks])

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
      const overTask = tasksById[over.id]
      targetStatus = overTask?.status
    }

    const activeTask = tasksById[active.id]
    if (targetStatus && activeTask && activeTask.status !== targetStatus) {
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
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
        {TASK_STATUSES.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            patients={patients}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-1 shadow-xl opacity-95">
            <TaskCardContent task={activeTask} labels={labels} onDelete={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
