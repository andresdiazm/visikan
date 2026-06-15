import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { TASK_TYPES, SERVICES, PRESTACION_TIPOS, COORDINACION_TIPOS, IMAGEN_TIPOS } from '../../data/hierarchy'
import { buildNotesMeta } from '../../lib/taskMeta'
import useVisiStore from '../../store/useVisiStore'

export default function TaskCreateModal({ patient, onClose }) {
  const createTask = useVisiStore(s => s.createTask)
  const labels     = useVisiStore(s => s.labels)

  const [type,        setType]        = useState('')
  const [description, setDescription] = useState('')
  const [priority,    setPriority]    = useState('normal')
  const [selectedLabels, setSelectedLabels] = useState([])

  // Campos extra según tipo
  const [destino,          setDestino]          = useState('')   // solicitud_traslado
  const [fechaAlta,        setFechaAlta]        = useState('')   // alta_probable
  const [socialEstado,     setSocialEstado]     = useState('')   // trabajo_social
  const [prestacionTipo,   setPrestacionTipo]   = useState('')   // solicitud_prestacion
  const [coordinacionTipo, setCoordinacionTipo] = useState('')   // coordinacion_externa
  const [imagenTipo,       setImagenTipo]       = useState('')   // solicitud_imagen

  // Resetear campos extra al cambiar tipo
  useEffect(() => {
    setDestino('')
    setFechaAlta('')
    setSocialEstado('')
    setPrestacionTipo('')
    setCoordinacionTipo('')
    setImagenTipo('')
  }, [type])

  const canSubmit =
    !!type &&
    (type !== 'solicitud_traslado'   || destino) &&
    (type !== 'trabajo_social'       || socialEstado) &&
    (type !== 'solicitud_prestacion' || prestacionTipo) &&
    (type !== 'coordinacion_externa' || coordinacionTipo) &&
    (type !== 'solicitud_imagen'     || imagenTipo)

  function toggleLabel(id) {
    setSelectedLabels(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    const fullNotes = buildNotesMeta(destino, fechaAlta, '', socialEstado, prestacionTipo, coordinacionTipo, imagenTipo)
    createTask({
      patientId: patient.id,
      type,
      description: description.trim(),
      priority,
      labels: selectedLabels,
      notes: fullNotes,
    })
    onClose()
  }

  const footer = (
    <div className="flex gap-2">
      <Button type="submit" form="task-create-form" variant="primary" className="flex-1" disabled={!canSubmit}>
        Crear tarea
      </Button>
      <Button type="button" variant="secondary" onClick={onClose}>
        Cancelar
      </Button>
    </div>
  )

  return (
    <Modal title={`Nueva tarea — ${patient.name || 'Cama'}`} onClose={onClose} footer={footer}>
      <form id="task-create-form" onSubmit={handleSubmit} className="flex flex-col gap-3">

        {/* ── Tipo de tarea ─────────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de tarea</label>
          <div className="grid grid-cols-3 gap-1.5">
            {TASK_TYPES.filter(t => !t.hidden).map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left border transition-colors ${
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

        {/* ── Subtipo de prestación ────────────────────────────────────── */}
        {type === 'solicitud_prestacion' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Prestación <span className="text-red-500">*</span>
            </label>
            <select
              value={prestacionTipo}
              onChange={e => setPrestacionTipo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
              autoFocus
            >
              <option value="">Seleccionar prestación…</option>
              {PRESTACION_TIPOS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* ── Subtipo de imagen ───────────────────────────────────────── */}
        {type === 'solicitud_imagen' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tipo de imagen <span className="text-red-500">*</span>
            </label>
            <select
              value={imagenTipo}
              onChange={e => setImagenTipo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
              autoFocus
            >
              <option value="">Seleccionar imagen…</option>
              {IMAGEN_TIPOS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* ── Subtipo de coordinación externa ─────────────────────────── */}
        {type === 'coordinacion_externa' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Coordinación <span className="text-red-500">*</span>
            </label>
            <select
              value={coordinacionTipo}
              onChange={e => setCoordinacionTipo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
              autoFocus
            >
              <option value="">Seleccionar coordinación…</option>
              {COORDINACION_TIPOS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* ── Estado social (solo trabajo_social) ──────────────────────── */}
        {type === 'trabajo_social' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Estado alta médica <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'con_alta', label: 'Con alta médica',  cls: 'border-emerald-400 bg-emerald-50 text-emerald-800' },
                { id: 'sin_alta', label: 'Sin alta médica',  cls: 'border-amber-400 bg-amber-50 text-amber-800' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSocialEstado(opt.id)}
                  className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    socialEstado === opt.id
                      ? opt.cls
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

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

        {/* ── Etiquetas ─────────────────────────────────────────────────── */}
        {labels.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Etiquetas</label>
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

        {/* ── Observación (opcional) ───────────────────────────────────── */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Observación <span className="font-normal text-gray-400">(opcional)</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Observaciones, detalles de seguimiento..."
            rows={2}
            className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
            autoFocus
          />
        </div>

        {/* ── Prioridad ─────────────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Prioridad</label>
          <div className="grid grid-cols-2 gap-1.5">
            {['normal', 'urgente'].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
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

      </form>
    </Modal>
  )
}
