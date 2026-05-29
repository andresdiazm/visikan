import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { LABEL_COLORS } from '../../data/hierarchy'
import useVisiStore from '../../store/useVisiStore'

// Calcula color de texto (blanco/negro) según luminancia del fondo
function getContrastColor(hex) {
  const h = (hex || '#000000').replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#1a1a1a' : '#ffffff'
}

export default function LabelManager({ onClose }) {
  const labels = useVisiStore(s => s.labels)
  const createLabel = useVisiStore(s => s.createLabel)
  const deleteLabel = useVisiStore(s => s.deleteLabel)

  const [name,  setName]  = useState('')
  const [color, setColor] = useState(LABEL_COLORS[0])

  function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    createLabel(name.trim(), color)
    setName('')
  }

  const textColor = getContrastColor(color)

  return (
    <Modal title="Gestionar Etiquetas" onClose={onClose} size="sm">
      <div className="flex flex-col gap-5">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Urgente, Quirúrgico…"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              autoFocus
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>

            {/* Paleta rápida */}
            <div className="flex flex-wrap gap-2 mb-3">
              {LABEL_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>

            {/* Selector RGB personalizado */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 whitespace-nowrap">Color personalizado</label>
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
                  title="Seleccionar color RGB"
                />
              </div>
              <span className="text-xs text-gray-400 font-mono">{color.toUpperCase()}</span>
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Vista previa:</span>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ backgroundColor: color, color: textColor }}
            >
              {name.trim() || 'Etiqueta'}
            </span>
          </div>

          <Button type="submit" variant="primary" disabled={!name.trim()}>
            <Plus size={14} /> Crear etiqueta
          </Button>
        </form>

        {/* Lista existente */}
        {labels.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Etiquetas existentes</p>
            <ul className="flex flex-col gap-1">
              {labels.map(lbl => (
                <li key={lbl.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50">
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: lbl.color, color: getContrastColor(lbl.color) }}
                  >
                    {lbl.name}
                  </span>
                  <span className="flex-1 text-[10px] text-gray-400 font-mono">{lbl.color.toUpperCase()}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteLabel(lbl.id)}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    title="Eliminar etiqueta"
                  >
                    <Trash2 size={13} />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  )
}
