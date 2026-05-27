import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { TASK_TYPES, SERVICES } from '../../data/hierarchy'
import { parseNotesMeta, buildNotesMeta } from '../../lib/taskMeta'
import useVisiStore from '../../store/useVisiStore'

export default function TaskEditModal({ task, onClose }) {
  const updateTask = useVisiStore(s => s.updateTask)
  const labels     = useVisiStore(s => s.labels)

  // Parsear metadatos existentes en notes
  const { destino: initDestino, fechaAlta: initFechaAlta, userNotes: initNotes } =
    parseNotesMeta(task.notes)

  const [type,           setType]           = useState(task.type)
  const [description,    setDescription]    = useState(task.description)
  const [notes,          setNotes]          = useState(initNotes)
  const [priority,       setPriority]       = useState(task.priority || 'normal')
  const [selectedLabels, setSelectedLabels] = useState(task.labels || [])

  const [destino,   setDestino]   = useState(initDestino)
  const [fechaAlta, setFechaAlta] = useState(initFechaAlta)

  function handleTypeChange(newType) {
    if (newType !== type) {
      setDestino('')
      setFechaAlta('')
    }
    setType(newType)
  }

  const canSubmit = description.trim() &&
    (type !== 'solicitud_traslado' || destino)

  function toggleLabel(id) {
    setSelectedLabels(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    const fullNotes = buildNotesMeta(destino, fechaAlta, notes)
    updateTask(task.id, {
      type,
      description: description.trim(),
      notes: fullNotes,
      priority,
      labels: selectedLabels,
    })
    onClose()
  }

  return (
    <Modal title="Editar tarea" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* ── Tipo de tarea ─────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de tarea</label>
          <div className="grid grid-cols-3 sm:grid-cols-2 gap-2">
            {TASK_TYPES.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTypeChange(t.id)}
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

        {/* ── Destino (solo traslado) ───────────────────────────────────── */}
        {type === 'solicitud_traslado' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servicio destino <span className="text-red-500">*</span>
            </label>
            <select
              value={destino}
              onChange={e => setDestino(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
            >
              <option value="">Seleccionar destino…</option>
              {SERVICES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* ── Fecha probable de alta ────────────────────────────────────── */}
        {type === 'alta_probable' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha probable de alta{' '}
              <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              type="date"
              value={fechaAlta}
              onChange={e => setFechaAlta(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        )}

        {/* ── Descripción ───────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
            autoFocus
            required
          />
        </div>

        {/* ── Notas ─────────────────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas adicionales{' '}
            <span className="font-normal text-gray-400">(opcional)</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Observaciones, detalles de seguimiento..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>

        {/* ── Prioridad ─────────────────────────────────────────────────── */}
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

        {/* ── Etiquetas ─────────────────────────────────────────────────── */}
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
                    selectedLabels.includes(lbl.id)
                      ? 'opacity-100 ring-2 ring-offset-1 ring-gray-400'
                      : 'opacity-50 hover:opacity-75'
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
          <Button type="submit" variant="primary" className="flex-1" disabled={!canSubmit}>
            Guardar cambios
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
