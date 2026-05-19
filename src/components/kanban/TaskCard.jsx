import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, AlertCircle, Pencil, ChevronRight, ChevronLeft, FileText } from 'lucide-react'
import { TypeBadge } from '../ui/Badge'
import LabelChip from '../ui/LabelChip'
import TaskEditModal from '../tasks/TaskEditModal'
import useVisiStore from '../../store/useVisiStore'
import { TASK_STATUSES } from '../../data/hierarchy'

export function TaskCardContent({ task, labels, onDelete, onEdit, onMove }) {
  const taskLabels = labels.filter(l => task.labels.includes(l.id))
  const currentIdx = TASK_STATUSES.indexOf(task.status)
  const prevStatus = currentIdx > 0 ? TASK_STATUSES[currentIdx - 1] : null
  const nextStatus = currentIdx < TASK_STATUSES.length - 1 ? TASK_STATUSES[currentIdx + 1] : null

  const statusLabel = { iniciada: 'Iniciada', en_proceso: 'En Proceso', terminada: 'Terminada' }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 group cursor-grab active:cursor-grabbing select-none">
      <div className="flex items-start gap-2 mb-1.5">
        <TypeBadge type={task.type} />
        {task.priority === 'urgente' && (
          <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
        )}
        <div className="ml-auto flex items-center gap-1">
          {onEdit && (
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={onEdit}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-teal-500 transition-all"
              title="Editar tarea"
            >
              <Pencil size={13} />
            </button>
          )}
          {onDelete && (
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
              title="Eliminar tarea"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-700 line-clamp-2 mb-1">{task.description}</p>

      {task.notes && (
        <div className="flex items-start gap-1 mb-1.5 bg-amber-50 rounded px-2 py-1">
          <FileText size={11} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 line-clamp-2">{task.notes}</p>
        </div>
      )}

      {taskLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {taskLabels.map(lbl => <LabelChip key={lbl.id} label={lbl} />)}
        </div>
      )}

      {/* Botones de movimiento — siempre visibles en móvil, hover en desktop */}
      {onMove && (prevStatus || nextStatus) && (
        <div className="flex gap-1 justify-end mt-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {prevStatus && (
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={() => onMove(prevStatus)}
              className="flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              title={`Mover a ${statusLabel[prevStatus]}`}
            >
              <ChevronLeft size={11} /> {statusLabel[prevStatus]}
            </button>
          )}
          {nextStatus && (
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={() => onMove(nextStatus)}
              className="flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-teal-100 hover:bg-teal-200 text-teal-700 transition-colors"
              title={`Mover a ${statusLabel[nextStatus]}`}
            >
              {statusLabel[nextStatus]} <ChevronRight size={11} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function TaskCard({ task }) {
  const labels = useVisiStore(s => s.labels)
  const deleteTask = useVisiStore(s => s.deleteTask)
  const moveTask = useVisiStore(s => s.moveTask)
  const [editing, setEditing] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 1 : 'auto',
  }

  return (
    <>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <TaskCardContent
          task={task}
          labels={labels}
          onDelete={() => deleteTask(task.id)}
          onEdit={() => setEditing(true)}
          onMove={status => moveTask(task.id, status)}
        />
      </div>
      {editing && <TaskEditModal task={task} onClose={() => setEditing(false)} />}
    </>
  )
}
