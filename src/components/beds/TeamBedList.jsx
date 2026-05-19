import { useState, useMemo } from 'react'
import { BedDouble, UserPlus, UserCheck, X } from 'lucide-react'
import Button from '../ui/Button'
import PatientAssignModal from './PatientAssignModal'
import useVisiStore from '../../store/useVisiStore'
import { selectBedsByTeam, selectBedsByService, selectPatientByBed } from '../../store/selectors'

function BedRow({ bed, serviceId, teamId, onAssignPatient }) {
  const patient = useVisiStore(selectPatientByBed(bed.id))
  const removeBedFromTeam = useVisiStore(s => s.removeBedFromTeam)

  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 group">
      <BedDouble size={14} className="text-gray-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-700 truncate block">{bed.sala} · {bed.cama}</span>
        {patient && (
          <span className="text-xs text-teal-700 font-medium">{patient.name}</span>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant={patient ? 'ghost-teal' : 'ghost'}
          onClick={() => onAssignPatient(bed)}
          title={patient ? 'Editar paciente' : 'Asignar paciente'}
        >
          {patient ? <UserCheck size={13} /> : <UserPlus size={13} />}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => removeBedFromTeam(bed.id, serviceId, teamId)}
          title="Quitar cama de este equipo"
          className="text-red-400 hover:text-red-600 hover:bg-red-50"
        >
          <X size={13} />
        </Button>
      </div>
    </div>
  )
}

export default function TeamBedList({ serviceId, team }) {
  const [assigningBed, setAssigningBed] = useState(null)
  const [showAddBed, setShowAddBed] = useState(false)
  const assignBedToTeam = useVisiStore(s => s.assignBedToTeam)

  const teamBeds = useVisiStore(selectBedsByTeam(serviceId, team.id))
  const allServiceBeds = useVisiStore(selectBedsByService(serviceId))
  const assignedIds = new Set(useVisiStore(s =>
    Object.values(s.teamAssignments).flat()
  ))

  const availableBeds = useMemo(
    () => allServiceBeds.filter(b => !assignedIds.has(b.id)),
    [allServiceBeds, assignedIds]
  )

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-3 py-2 flex items-center justify-between border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">{team.label}</span>
        <span className="text-xs text-gray-500">{teamBeds.length} cama{teamBeds.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="divide-y divide-gray-100">
        {teamBeds.length === 0 && (
          <p className="text-xs text-gray-400 px-3 py-3 italic">Sin camas asignadas</p>
        )}
        {teamBeds.map(bed => (
          <BedRow
            key={bed.id}
            bed={bed}
            serviceId={serviceId}
            teamId={team.id}
            onAssignPatient={setAssigningBed}
          />
        ))}
      </div>

      {availableBeds.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
          {showAddBed ? (
            <div className="flex gap-2">
              <select
                className="flex-1 text-xs px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-400"
                onChange={e => {
                  if (e.target.value) {
                    assignBedToTeam(e.target.value, serviceId, team.id)
                    setShowAddBed(false)
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>Seleccionar sala/cama...</option>
                {availableBeds.map(b => (
                  <option key={b.id} value={b.id}>{b.sala} · {b.cama}</option>
                ))}
              </select>
              <Button size="sm" variant="ghost" onClick={() => setShowAddBed(false)}>
                <X size={13} />
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="ghost-teal" onClick={() => setShowAddBed(true)}>
              + Agregar cama
            </Button>
          )}
        </div>
      )}

      {assigningBed && (
        <PatientAssignModal bed={assigningBed} onClose={() => setAssigningBed(null)} />
      )}
    </div>
  )
}
