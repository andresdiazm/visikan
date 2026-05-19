import { TASK_TYPES } from '../../data/hierarchy'

export function TypeBadge({ type }) {
  const taskType = TASK_TYPES.find(t => t.id === type)
  if (!taskType) return null
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${taskType.color}`}>
      {taskType.label}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  if (priority !== 'urgente') return null
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
      Urgente
    </span>
  )
}

export function StatusBadge({ status }) {
  const map = {
    iniciada:   'bg-amber-100 text-amber-800',
    en_proceso: 'bg-blue-100 text-blue-800',
    terminada:  'bg-green-100 text-green-800',
  }
  const labels = { iniciada: 'Iniciada', en_proceso: 'En Proceso', terminada: 'Terminada' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-700'}`}>
      {labels[status] || status}
    </span>
  )
}

export function CountBadge({ count, className = '' }) {
  return (
    <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold ${className}`}>
      {count}
    </span>
  )
}
