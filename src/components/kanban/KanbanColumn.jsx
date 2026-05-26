import { useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import PatientSection from './PatientSection'
import { STATUS_META } from '../../data/hierarchy'

export default function KanbanColumn({ status, tasks, patients, filtered = false }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const meta = STATUS_META[status]

  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks])

  // In the "iniciada" column show ALL patients (so they can add their first task).
  // In other columns show only patients who have tasks there.
  const patientsWithTasks = useMemo(() => {
    return patients
      .map(p => ({
        patient: p,
        tasks: tasks.filter(t => t.patientId === p.id),
      }))
      // Con filtro activo: solo mostrar pacientes con tareas (aunque sea "iniciada")
      // Sin filtro: "iniciada" muestra todos los pacientes para crear su primera tarea
      .filter(({ tasks: t }) => (status === 'iniciada' && !filtered) ? true : t.length > 0)
  }, [patients, tasks, status])

  return (
    <div className={`flex flex-col flex-1 min-w-[280px] max-w-sm rounded-xl border-2 transition-colors ${meta.border} ${isOver ? 'ring-2 ring-teal-400 ring-offset-1' : ''}`}>
      <div className={`${meta.header} rounded-t-xl px-3 py-2 flex items-center gap-2 border-b ${meta.border}`}>
        <div className={`w-2 h-2 rounded-full ${meta.dot}`} />
        <span className="font-semibold text-sm text-gray-800">{meta.label}</span>
        <span className="ml-auto bg-white/70 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 p-2 min-h-[120px] ${meta.bg} rounded-b-xl overflow-y-auto`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {patientsWithTasks.length === 0 ? (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg min-h-[80px]">
              <p className="text-xs text-gray-400">Arrastra tareas aquí</p>
            </div>
          ) : (
            patientsWithTasks.map(({ patient, tasks: ptasks }) => (
              <PatientSection key={patient.id} patient={patient} tasks={ptasks} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
