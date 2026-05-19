import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, AlertCircle } from 'lucide-react'
import { TypeBadge } from '../ui/Badge'
import LabelChip from '../ui/LabelChip'
import useVisiStore from '../../store/useVisiStore'

export function TaskCardContent({ task, labels, onDelete }) {
  const taskLabels = labels.filter(l => task.labels.includes(l.id))

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 group cursor-grab active:cursor-grabbing select-none">
      <div className="flex items-start gap-2 mb-1.5">
        <TypeBadge type={task.type} />
        {task.priority === 'urgente' && (
          <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
        )}
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={onDelete}
          className="ml-auto opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
          title="Eliminar tarea"
        >
          <Trash2 size={13} />
        </button>
      </div>
      <p className="text-sm text-gray-700 line-clamp-2 mb-2">{task.description}</p>
      {taskLabels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {taskLabels.map(lbl => <LabelChip key={lbl.id} label={lbl} />)}
        </div>
      )}
    </div>
  )
}

export default function TaskCard({ task }) {
  const labels = useVisiStore(s => s.labels)
  const deleteTask = useVisiStore(s => s.deleteTask)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 1 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCardContent task={task} labels={labels} onDelete={() => deleteTask(task.id)} />
    </div>
  )
}
