import { useState, memo } from 'react'
import { Plus, BedDouble, Home } from 'lucide-react'
import TaskCard from './TaskCard'
import TaskCreateModal from '../tasks/TaskCreateModal'
import Button from '../ui/Button'

const PatientSection = memo(function PatientSection({ patient, tasks }) {
  const [creating, setCreating] = useState(false)

  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        {patient.isHomeCare
          ? <Home size={12} className="text-purple-400 shrink-0" />
          : <BedDouble size={12} className="text-gray-400 shrink-0" />
        }
        <span className="text-xs font-semibold text-gray-600 truncate flex-1">{patient.name}</span>
        {!patient.isHomeCare && patient.bedId && (
          <span className="text-[10px] text-gray-400 shrink-0">{patient.sala}</span>
        )}
        <Button size="icon" variant="ghost" onClick={() => setCreating(true)} title="Nueva tarea">
          <Plus size={12} className="text-teal-500" />
        </Button>
      </div>

      <div className="flex flex-col gap-2 pl-4">
        {tasks.map(task => <TaskCard key={task.id} task={task} />)}
      </div>

      {creating && (
        <TaskCreateModal patient={patient} onClose={() => setCreating(false)} />
      )}
    </div>
  )
})

export default PatientSection
