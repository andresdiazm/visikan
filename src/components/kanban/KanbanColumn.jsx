import { useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import PatientSection from './PatientSection'
import { STATUS_META } from '../../data/hierarchy'
import useVisiStore from '../../store/useVisiStore'

// Extrae la sala del label de cama (formato "{sala}-{cama}")
function salaFromLabel(label) {
  if (!label) return '—'
  const idx = label.indexOf('-')
  return idx > 0 ? label.slice(0, idx) : label
}

export default function KanbanColumn({ status, tasks, patients, filtered = false }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const meta = STATUS_META[status]
  const beds = useVisiStore(s => s.beds)

  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks])

  // Construir lista de pacientes con sus tareas
  const patientsWithTasks = useMemo(() => {
    return patients
      .map(p => {
        const bed = p.bedId ? beds.find(b => b.id === p.bedId) : null
        return {
          patient: p,
          tasks: tasks.filter(t => t.patientId === p.id),
          sala: bed ? salaFromLabel(bed.label) : '—',
        }
      })
      .filter(({ tasks: t }) => (status === 'iniciada' && !filtered) ? true : t.length > 0)
  }, [patients, tasks, beds, status, filtered])

  // Agrupar por sala, ordenar grupos alfanumérico
  const groupedBySala = useMemo(() => {
    const map = {}
    patientsWithTasks.forEach(item => {
      if (!map[item.sala]) map[item.sala] = []
      map[item.sala].push(item)
    })
    return Object.entries(map).sort(([a], [b]) =>
      a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' })
    )
  }, [patientsWithTasks])

  return (
    <div className={`flex flex-col flex-1 min-w-[270px] max-w-sm rounded-xl border-2 transition-colors ${meta.border} ${isOver ? 'ring-2 ring-teal-400 ring-offset-1' : ''}`}>
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
            groupedBySala.map(([sala, items], groupIdx) => (
              <div key={sala}>
                {/* Header de sala */}
                <div className={`flex items-center gap-1 px-1 mb-0.5 ${groupIdx > 0 ? 'mt-2' : 'mt-0'}`}>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Sala {sala}
                  </span>
                  <div className="flex-1 h-px bg-gray-200 ml-1" />
                </div>
                {items.map(({ patient, tasks: ptasks }) => (
                  <PatientSection key={patient.id} patient={patient} tasks={ptasks} />
                ))}
              </div>
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
