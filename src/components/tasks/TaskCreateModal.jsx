import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import LabelChip from '../ui/LabelChip'
import { TASK_TYPES } from '../../data/hierarchy'
import useVisiStore from '../../store/useVisiStore'

export default function TaskCreateModal({ patient, onClose }) {
  const createTask = useVisiStore(s => s.createTask)
  const labels = useVisiStore(s => s.labels)

  const [type, setType] = useState(TASK_TYPES[0].id)
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState('normal')
  const [selectedLabels, setSelectedLabels] = useState([])

  function toggleLabel(id) {
    setSelectedLabels(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) return
    createTask({ patientId: patient.id, type, description: description.trim(), priority, labels: selectedLabels, notes: notes.trim() })
    onClose()
  }

  return (
    <Modal title={`Nueva tarea — ${patient.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de tarea</label>
          <div className="grid grid-cols-3 sm:grid-cols-2 gap-2">
            {TASK_TYPES.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-colors ${
                  type === t.id
                    ? 'border-teal bg-teal-50 text-teal-800'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe el pendiente..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
            autoFocus
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales <span className="font-normal text-gray-400">(opcional)</span></label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Observaciones, detalles de seguimiento..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
          <div className="flex gap-2">
            {['normal', 'urgente'].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  priority === p
                    ? p === 'urgente'
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-teal bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {p === 'urgente' ? '🔴 Urgente' : '✅ Normal'}
              </button>
            ))}
          </div>
        </div>

        {labels.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Etiquetas</label>
            <div className="flex flex-wrap gap-2">
              {labels.map(lbl => (
                <button
                  key={lbl.id}
                  type="button"
                  onClick={() => toggleLabel(lbl.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium text-white transition-opacity ${
                    selectedLabels.includes(lbl.id) ? 'opacity-100 ring-2 ring-offset-1 ring-gray-400' : 'opacity-50 hover:opacity-75'
                  }`}
                  style={{ backgroundColor: lbl.color }}
                >
                  {lbl.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button type="submit" variant="primary" className="flex-1" disabled={!description.trim()}>
            Crear tarea
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
