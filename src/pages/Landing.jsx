import ServiceCard from '../components/beds/ServiceCard'
import { SERVICES } from '../data/hierarchy'

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
        {SERVICES.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  )
}
