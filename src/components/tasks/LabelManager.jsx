import { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { LABEL_COLORS } from '../../data/hierarchy'
import useVisiStore from '../../store/useVisiStore'

export default function LabelManager({ onClose }) {
  const labels = useVisiStore(s => s.labels)
  const createLabel = useVisiStore(s => s.createLabel)
  const deleteLabel = useVisiStore(s => s.deleteLabel)

  const [name, setName] = useState('')
  const [color, setColor] = useState(LABEL_COLORS[0])

  function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    createLabel(name.trim(), color)
    setName('')
  }

  return (
    <Modal title="Gestionar Etiquetas" onClose={onClose} size="sm">
      <div className="flex flex-col gap-5">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva etiqueta</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre de la etiqueta"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {LABEL_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <Button type="submit" variant="primary" disabled={!name.trim()}>
            <Plus size={14} /> Crear etiqueta
          </Button>
        </form>

        {labels.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Etiquetas existentes</p>
            <ul className="flex flex-col gap-1">
              {labels.map(lbl => (
                <li key={lbl.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: lbl.color }} />
                  <span className="flex-1 text-sm text-gray-700">{lbl.name}</span>
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
