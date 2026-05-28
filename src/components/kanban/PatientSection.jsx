import { useState, memo } from 'react'
import { Plus, BedDouble, Home } from 'lucide-react'
import TaskCard from './TaskCard'
import TaskCreateModal from '../tasks/TaskCreateModal'
import Button from '../ui/Button'
import useVisiStore from '../../store/useVisiStore'

const PatientSection = memo(function PatientSection({ patient, tasks }) {
  const [creating, setCreating] = useState(false)
  // Para pacientes virtuales: se guarda el nuevo paciente una vez creado
  const [realPatient, setRealPatient] = useState(null)

  const bed = useVisiStore(s => patient.bedId ? s.beds.find(b => b.id === patient.bedId) : null)
  const assignPatientToBed = useVisiStore(s => s.assignPatientToBed)

  const bedLabel = patient.isHomeCare ? null : (bed?.label ?? null)
  const subLabel = bedLabel && patient.name ? patient.name : null

  // El paciente real a usar en el modal (puede ser el virtual ya materializado)
  const modalPatient = realPatient || patient

  async function handlePlusClick() {
    if (patient._isVirtual) {
      // Crear paciente anónimo para la cama y luego abrir el modal
      const newPat = await assignPatientToBed(patient.bedId, '', '')
      if (newPat) {
        setRealPatient(newPat)
        setCreating(true)
      }
    } else {
      setCreating(true)
    }
  }

  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 mb-1">
        {patient.isHomeCare
          ? <Home size={12} className="text-purple-400 shrink-0" />
          : <BedDouble size={12} className={patient._isVirtual ? 'text-gray-300 shrink-0' : 'text-gray-400 shrink-0'} />
        }
        <div className="flex-1 min-w-0">
          <span className={`text-xs font-semibold truncate block ${patient._isVirtual ? 'text-gray-400' : 'text-gray-700'}`}>
            {bedLabel ?? patient.name}
          </span>
          {subLabel && (
            <span className="text-[10px] text-gray-400 truncate block">{subLabel}</span>
          )}
        </div>
        <Button size="icon" variant="ghost" onClick={handlePlusClick} title="Nueva tarea">
          <Plus size={12} className="text-teal-500" />
        </Button>
      </div>

      <div className="flex flex-col gap-1.5 pl-3">
        {tasks.map(task => <TaskCard key={task.id} task={task} />)}
      </div>

      {creating && !modalPatient._isVirtual && (
        <TaskCreateModal
          patient={modalPatient}
          onClose={() => { setCreating(false); setRealPatient(null) }}
        />
      )}
    </div>
  )
})

export default PatientSection
