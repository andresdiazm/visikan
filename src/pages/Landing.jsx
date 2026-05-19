import { useState } from 'react'
import { Home, UserPlus, Trash2 } from 'lucide-react'
import ServiceCard from '../components/beds/ServiceCard'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { SERVICES } from '../data/hierarchy'
import useVisiStore from '../store/useVisiStore'

function HosDomSection() {
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [rut, setRut] = useState('')
  const patients = useVisiStore(s => Object.values(s.patients).filter(p => p.isHomeCare))
  const addHomeCarePatient = useVisiStore(s => s.addHomeCarePatient)
  const removePatient = useVisiStore(s => s.removePatient)

  function handleAdd(e) {
    e.preventDefault()
    if (!name.trim()) return
    addHomeCarePatient(name.trim(), rut.trim())
    setName('')
    setRut('')
    setShowModal(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className="w-3 h-3 rounded-full shrink-0 bg-purple-700" />
        <span className="flex-1 font-semibold text-gray-900">HosDom</span>
        <span className="text-xs text-gray-500 mr-2">{patients.length} paciente{patients.length !== 1 ? 's' : ''}</span>
        <Button size="sm" variant="ghost-teal" onClick={() => setShowModal(true)}>
          <UserPlus size={13} />
          Agregar paciente
        </Button>
      </div>

      <div className="px-5 py-3">
        {patients.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-2">Sin pacientes domiciliarios. Agrega uno con el botón de arriba.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {patients.map(p => (
              <li key={p.id} className="flex items-center gap-2 py-2 group">
                <Home size={14} className="text-purple-400 shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-gray-800 font-medium">{p.name}</span>
                  {p.rut && <span className="text-xs text-gray-400 ml-2">{p.rut}</span>}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50"
                  onClick={() => removePatient(p.id)}
                  title="Dar de alta"
                >
                  <Trash2 size={13} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showModal && (
        <Modal title="Agregar paciente domiciliario" onClose={() => setShowModal(false)}>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nombre completo"
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
                placeholder="12345678-9"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" className="flex-1">Agregar</Button>
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

const NON_HOSDOM = SERVICES.filter(s => s.id !== 'hosdom')

export default function Landing() {
  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-bay-blue">Asignación de Camas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Asigna salas a equipos y registra el paciente de cada cama. Los cambios se guardan automáticamente.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {NON_HOSDOM.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
        <HosDomSection />
      </div>
    </div>
  )
}
