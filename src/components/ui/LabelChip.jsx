import { X } from 'lucide-react'

export default function LabelChip({ label, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: label.color }}
    >
      {label.name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-75"
          aria-label={`Quitar etiqueta ${label.name}`}
        >
          <X size={10} />
        </button>
      )}
    </span>
  )
}
