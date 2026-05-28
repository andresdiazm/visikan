import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { SERVICES } from '../../data/hierarchy'
import useVisiStore from '../../store/useVisiStore'

export default function MoveBedModal({ bed, onClose }) {
  const teams        = useVisiStore(s => s.teams)
  const moveBedToTeam = useVisiStore(s => s.moveBedToTeam)

  const [toService, setToService] = useState('')
  const [toTeam,    setToTeam]    = useState('')

  const availableTeams = toService ? (teams[toService] || []) : []
  const canSubmit = !!toService

  function handleServiceChange(svcId) {
    setToService(svcId)
    setToTeam('')   // reset sector al cambiar servicio
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    await moveBedToTeam(bed.id, toService, toTeam || null)
    onClose()
  }

  const footer = (
    <div className="flex gap-2">
      <Button type="submit" form="move-bed-form" variant="primary" className="flex-1" disabled={!canSubmit}>
        Mover cama
      </Button>
      <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
    </div>
  )

  return (
    <Modal title={`Mover cama ${bed.label}`} onClose={onClose} footer={footer} size="sm">
      <form id="move-bed-form" onSubmit={handleSubmit} className="flex flex-col gap-4">

        <p className="text-sm text-gray-500">
          Selecciona el servicio y sector destino. Las tareas vinculadas a esta cama se mantendrán.
        </p>

        {/* ── Servicio destino ─────────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Servicio destino <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {SERVICES.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleServiceChange(s.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                  toService === s.id
                    ? 'border-teal-400 bg-teal-50 text-teal-800'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Sector destino (opcional) ────────────────────────────────── */}
        {toService && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sector destino{' '}
              <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            {availableTeams.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                Este servicio no tiene sectores creados. La cama quedará sin sector asignado.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {/* Opción "sin sector" */}
                <button
                  type="button"
                  onClick={() => setToTeam('')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                    toTeam === ''
                      ? 'border-gray-400 bg-gray-100 text-gray-700'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Sin sector (solo asignar al servicio)
                </button>
                {availableTeams.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setToTeam(t.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                      toTeam === t.id
                        ? 'border-teal-400 bg-teal-50 text-teal-800'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </form>
    </Modal>
  )
}
