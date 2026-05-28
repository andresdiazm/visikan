import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, AlertCircle, Pencil, ChevronRight, ChevronLeft, FileText, Clock } from 'lucide-react'
import { TypeBadge } from '../ui/Badge'
import TaskEditModal from '../tasks/TaskEditModal'
import useVisiStore from '../../store/useVisiStore'
import { TASK_STATUSES, SERVICES } from '../../data/hierarchy'
import { parseNotesMeta, formatFechaAlta, SOCIAL_ESTADO_META, getPrestacionTipo } from '../../lib/taskMeta'
import { PRESTACION_TIPOS } from '../../data/hierarchy'

// ── Helpers ───────────────────────────────────────────────────────────────────
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

  // Metadatos estructurados en notes
  const { destino, fechaAlta, socialEstado, userNotes } = parseNotesMeta(task.notes)
  const destinoLabel   = destino ? SERVICES.find(s => s.id === destino)?.label ?? destino : null
  const socialMeta     = socialEstado ? SOCIAL_ESTADO_META[socialEstado] : null
  const prestacionTipo = getPrestacionTipo(task)
  const prestacionMeta = prestacionTipo ? PRESTACION_TIPOS.find(p => p.id === prestacionTipo) : null

  return (
    <div className={`rounded-lg border shadow-sm px-2 py-1.5 group cursor-grab active:cursor-grabbing select-none transition-colors ${
      old ? 'bg-orange-50 border-orange-300 ring-1 ring-orange-300' : 'bg-white border-gray-200'
    }`}>

      {/* Fila 1: tipo + urgente + hora + acciones */}
      <div className="flex items-center gap-1 mb-1">
        <TypeBadge type={task.type} />
        {task.priority === 'urgente' && (
          <AlertCircle size={11} className="text-red-500 shrink-0" />
        )}

        {/* Timestamp arriba a la derecha */}
        <div className={`ml-auto flex items-center gap-0.5 ${old ? 'text-orange-500' : 'text-gray-400'}`}>
          <Clock size={9} />
          <span className="text-[10px]">{timeAgo(task.createdAt)}</span>
        </div>

        {onEdit && (
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-teal-500 transition-all"
            title="Editar tarea"
          >
            <Pencil size={11} />
          </button>
        )}
        {onDelete && (
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
            title="Eliminar tarea"
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>

      {/* Fila 2: pills de contexto — subtipo prestación */}
      {prestacionMeta && (
        <div className="flex items-center gap-1 mb-1">
          <span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 ${prestacionMeta.color}`}>
            {prestacionMeta.label}
          </span>
        </div>
      )}

      {/* Estado social */}
      {task.type === 'trabajo_social' && socialMeta && (
        <div className="flex items-center gap-1 mb-1">
          <span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 ${socialMeta.color}`}>
            {socialMeta.label}
          </span>
        </div>
      )}

      {/* Destino traslado */}
      {task.type === 'solicitud_traslado' && destinoLabel && (
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5">
            → {destinoLabel}
          </span>
        </div>
      )}

      {/* Fecha probable de alta */}
      {task.type === 'alta_probable' && fechaAlta && (
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[10px] font-semibold text-lime-700 bg-lime-50 border border-lime-200 rounded px-1.5 py-0.5">
            Alta: {formatFechaAlta(fechaAlta)}
          </span>
        </div>
      )}

      {/* Etiquetas — texto completo, debajo del tipo */}
      {taskLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {taskLabels.map(lbl => (
            <span
              key={lbl.id}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded text-white leading-tight"
              style={{ backgroundColor: lbl.color }}
            >
              {lbl.name}
            </span>
          ))}
        </div>
      )}

      {/* Descripción */}
      {task.description && (
        <p className="text-xs text-gray-700 line-clamp-1 leading-tight mb-1">{task.description}</p>
      )}

      {/* Notas del usuario */}
      {userNotes && (
        <div className="flex items-center gap-1 mb-1 bg-amber-50 rounded px-1.5 py-0.5">
          <FileText size={9} className="text-amber-400 shrink-0" />
          <p className="text-[10px] text-amber-700 line-clamp-1">{userNotes}</p>
        </div>
      )}

      {/* Botones de movimiento */}
      {onMove && (prevStatus || nextStatus) && (
        <div className="flex justify-end gap-1 mt-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {prevStatus && (
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={() => onMove(prevStatus)}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-600"
              title={`← ${statusLabel[prevStatus]}`}
            >
              <ChevronLeft size={9} />
            </button>
          )}
          {nextStatus && (
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={() => onMove(nextStatus)}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-100 hover:bg-teal-200 text-teal-700"
              title={`${statusLabel[nextStatus]} →`}
            >
              <ChevronRight size={9} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── TaskCard (con DnD) ────────────────────────────────────────────────────────
export default function TaskCard({ task }) {
  const labels     = useVisiStore(s => s.labels)
  const deleteTask = useVisiStore(s => s.deleteTask)
  const moveTask   = useVisiStore(s => s.moveTask)
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
