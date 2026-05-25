import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import useVisiStore from '../../store/useVisiStore'
import { selectPatientByBed } from '../../store/selectors'

export default function PatientAssignModal({ bed, onClose }) {
  const existingPatient = useVisiStore(selectPatientByBed(bed.id))
  const assignPatientToBed = useVisiStore(s => s.assignPatientToBed)
  const removePatient = useVisiStore(s => s.removePatient)

  const [name, setName] = useState(existingPatient?.name || '')
  const [rut, setRut] = useState(existingPatient?.rut || '')

  function formatRut(value) {
    const clean = value.replace(/[^0-9kK]/g, '')
    if (clean.length <= 1) return clean
    return clean.slice(0, -1) + '-' + clean.slice(-1)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    assignPatientToBed(bed.id, name.trim(), rut.trim())
    onClose()
  }

  function handleRemove() {
    if (existingPatient) {
      removePatient(existingPatient.id)
    }
    onClose()
  }

  return (
    <Modal title={`Asignar paciente — ${bed.label}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del paciente</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: Juan Pérez González"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            autoFocus
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
          <input
            type="text"
            value={rut}
            onChange={e => setRut(e.target.value)}
            onBlur={e => setRut(formatRut(e.target.value))}
            placeholder="12345678-9"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <Button type="submit" variant="primary" className="flex-1">
            {existingPatient ? 'Actualizar' : 'Asignar'}
          </Button>
          {existingPatient && (
            <Button type="button" variant="danger" onClick={handleRemove}>
              Dar de alta
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
