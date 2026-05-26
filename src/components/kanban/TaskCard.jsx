import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, AlertCircle, Pencil, ChevronRight, ChevronLeft, FileText, Clock } from 'lucide-react'
import { TypeBadge } from '../ui/Badge'
import LabelChip from '../ui/LabelChip'
import TaskEditModal from '../tasks/TaskEditModal'
import useVisiStore from '../../store/useVisiStore'
import { TASK_STATUSES } from '../../data/hierarchy'

// ── Helper: tiempo relativo ───────────────────────────────────────────────────
function timeAgo(isoString) {
  if (!isoString) return ''
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'Hace un momento'
  if (mins < 60) return `Hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `Hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `Hace ${days}d`
}

function isOlderThan24h(isoString, status) {
  if (!isoString || status === 'terminada') return false
  return (Date.now() - new Date(isoString).getTime()) > 24 * 60 * 60 * 1000
}

// ── TaskCardContent ───────────────────────────────────────────────────────────
export function TaskCardContent({ task, labels, onDelete, onEdit, onMove }) {
  const taskLabels = labels.filter(l => task.labels.includes(l.id))
  const currentIdx = TASK_STATUSES.indexOf(task.status)
  const prevStatus = currentIdx > 0 ? TASK_STATUSES[currentIdx - 1] : null
  const nextStatus = currentIdx < TASK_STATUSES.length - 1 ? TASK_STATUSES[currentIdx + 1] : null

  const statusLabel = { iniciada: 'Iniciada', en_proceso: 'En Proceso', terminada: 'Terminada' }

  const old = isOlderThan24h(task.createdAt, task.status)

  // Labels: mostrar máx 2, luego chip "+N"
  const visibleLabels = taskLabels.slice(0, 2)
  const extraCount = taskLabels.length - visibleLabels.length

  return (
    <div className={`rounded-lg border shadow-sm p-2 group cursor-grab active:cursor-grabbing select-none transition-colors ${
      old
        ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-300'
        : 'bg-white border-gray-200'
    }`}>
      {/* Fila superior: badge + prioridad + acciones */}
      <div className="flex items-start gap-1.5 mb-1">
        <TypeBadge type={task.type} />
        {task.priority === 'urgente' && (
          <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
        )}
        <div className="ml-auto flex items-center gap-1">
          {onEdit && (
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={onEdit}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-teal-500 transition-all"
              title="Editar tarea"
            >
              <Pencil size={12} />
            </button>
          )}
          {onDelete && (
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
              title="Eliminar tarea"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Descripción compacta */}
      <p className="text-xs text-gray-700 line-clamp-1 mb-1">{task.description}</p>

      {/* Notas: solo si existen, colapsadas */}
      {task.notes && (
        <div className="flex items-start gap-1 mb-1 bg-amber-50 rounded px-1.5 py-0.5">
          <FileText size={10} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700 line-clamp-1">{task.notes}</p>
        </div>
      )}

      {/* Labels: máx 2 + chip "+N" */}
      {taskLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {visibleLabels.map(lbl => <LabelChip key={lbl.id} label={lbl} />)}
          {extraCount > 0 && (
            <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5 font-medium">
              +{extraCount}
            </span>
          )}
        </div>
      )}

      {/* Fila inferior: timestamp + botones movimiento */}
      <div className="flex items-center justify-between mt-1.5">
        {/* Timestamp */}
        <div className={`flex items-center gap-0.5 ${old ? 'text-orange-500' : 'text-gray-400'}`}>
          <Clock size={10} />
          <span className="text-[10px]">{timeAgo(task.createdAt)}</span>
        </div>

        {/* Botones movimiento */}
        {onMove && (prevStatus || nextStatus) && (
          <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            {prevStatus && (
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={() => onMove(prevStatus)}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                title={`Mover a ${statusLabel[prevStatus]}`}
              >
                <ChevronLeft size={10} /> {statusLabel[prevStatus]}
              </button>
            )}
            {nextStatus && (
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={() => onMove(nextStatus)}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-100 hover:bg-teal-200 text-teal-700 transition-colors"
                title={`Mover a ${statusLabel[nextStatus]}`}
              >
                {statusLabel[nextStatus]} <ChevronRight size={10} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── TaskCard (con DnD) ────────────────────────────────────────────────────────
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
