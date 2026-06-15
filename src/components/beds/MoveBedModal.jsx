import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { SERVICES } from '../../data/hierarchy'
import useVisiStore from '../../store/useVisiStore'

// Acepta beds (array) o bed (objeto singular, retrocompat)
export default function MoveBedModal({ beds, bed, onClose }) {
  const bedList = beds ?? (bed ? [bed] : [])
  const teams        = useVisiStore(s => s.teams)
  const moveBedToTeam = useVisiStore(s => s.moveBedToTeam)

  const [toService, setToService] = useState('')
  const [toTeam,    setToTeam]    = useState('')

  const availableTeams = toService ? (teams[toService] || []) : []
  const canSubmit = !!toService

  function handleServiceChange(svcId) {
    setToService(svcId)
    setToTeam('')
  }

  async function handleSubmit() {
    if (!canSubmit) return
    await Promise.all(bedList.map(b => moveBedToTeam(b.id, toService, toTeam || null)))
    onClose()
  }

  const title = bedList.length === 1
    ? `Asignar cama ${bedList[0]?.label}`
    : `Asignar ${bedList.length} camas`

  const footer = (
    <div className="flex gap-2">
      <Button type="button" variant="primary" className="flex-1" disabled={!canSubmit} onClick={handleSubmit}>
        {bedList.length === 1 ? 'Asignar cama' : `Asignar ${bedList.length} camas`}
      </Button>
      <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
    </div>
  )

  return (
    <Modal title={title} onClose={onClose} footer={footer} size="sm">
      <div className="flex flex-col gap-4">

        {bedList.length > 1 && (
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
            {bedList.map(b => (
              <span key={b.id} className="text-[11px] px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-700 rounded-full font-medium">
                {b.label}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-500">
          Selecciona el servicio y sector destino.
        </p>

        {/* Servicio destino */}
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

        {/* Sector destino */}
        {toService && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sector destino{' '}
              <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            {availableTeams.length === 0 ? (
              <p className="text-xs text-gray-400 italic">
                Este servicio no tiene sectores. La cama quedará sin sector asignado.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
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

      </div>
    </Modal>
  )
}
