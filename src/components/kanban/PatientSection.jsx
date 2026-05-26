import { useState, memo } from 'react'
import { Plus, BedDouble, Home } from 'lucide-react'
import TaskCard from './TaskCard'
import TaskCreateModal from '../tasks/TaskCreateModal'
import Button from '../ui/Button'
import useVisiStore from '../../store/useVisiStore'

const PatientSection = memo(function PatientSection({ patient, tasks }) {
  const [creating, setCreating] = useState(false)
  const bed = useVisiStore(s => patient.bedId ? s.beds.find(b => b.id === patient.bedId) : null)

  // Con camas dinámicas el label es bed.label; fallback a patient.name para HosDom/sin cama
  const bedLabel = patient.isHomeCare ? null : (bed?.label ?? null)
  const subLabel = bedLabel ? patient.name : null

  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 mb-1">
        {patient.isHomeCare
          ? <Home size={12} className="text-purple-400 shrink-0" />
          : <BedDouble size={12} className="text-gray-400 shrink-0" />
        }
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-gray-700 truncate block">
            {bedLabel ?? patient.name}
          </span>
          {subLabel && (
            <span className="text-[10px] text-gray-400 truncate block">{subLabel}</span>
          )}
        </div>
        <Button size="icon" variant="ghost" onClick={() => setCreating(true)} title="Nueva tarea">
          <Plus size={12} className="text-teal-500" />
        </Button>
      </div>

      <div className="flex flex-col gap-1.5 pl-3">
        {tasks.map(task => <TaskCard key={task.id} task={task} />)}
      </div>

      {creating && (
        <TaskCreateModal patient={patient} onClose={() => setCreating(false)} />
      )}
    </div>
  )
})

export default PatientSection
