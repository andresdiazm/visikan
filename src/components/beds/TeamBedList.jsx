import { useState, useMemo } from 'react'
import { BedDouble, UserPlus, UserCheck, ArrowRightLeft, Plus, Trash2, X } from 'lucide-react'
import Button from '../ui/Button'
import PatientAssignModal from './PatientAssignModal'
import MoveBedModal from './MoveBedModal'
import useVisiStore from '../../store/useVisiStore'
import { selectBedsByTeam, selectBedsByService, selectPatientByBed } from '../../store/selectors'

// ── Fila individual de cama ───────────────────────────────────────────────────
function BedRow({ bed, serviceId, teamId, onAssignPatient, onMoveBed }) {
  const patient = useVisiStore(selectPatientByBed(bed.id))
  const deleteBed = useVisiStore(s => s.deleteBed)

  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 group">
      <BedDouble size={14} className="text-gray-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-700 truncate block">{bed.label}</span>
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
          onClick={() => onMoveBed(bed)}
          title="Cambiar de equipo"
          className="text-teal-400 hover:text-teal-600 hover:bg-teal-50"
        >
          <ArrowRightLeft size={13} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (window.confirm(`¿Eliminar "${bed.label}"? Se perderá el paciente asignado.`)) {
              deleteBed(bed.id)
            }
          }}
          title="Eliminar cama"
          className="text-red-400 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  )
}

// ── Panel para agregar cama ───────────────────────────────────────────────────
function AddBedPanel({ serviceId, teamId, onClose }) {
  const createBed = useVisiStore(s => s.createBed)
  const assignBedToTeam = useVisiStore(s => s.assignBedToTeam)
  const [sala, setSala] = useState('')
  const [cama, setCama] = useState('')
  const [tab, setTab] = useState('nueva') // 'nueva' | 'existente'

  // Camas del mismo servicio que no están asignadas a ningún equipo
  const allServiceBeds = useVisiStore(selectBedsByService(serviceId))
  const assignedIds = new Set(useVisiStore(s => Object.values(s.teamAssignments).flat()))
  const unassigned = useMemo(
    () => allServiceBeds.filter(b => !assignedIds.has(b.id)),
    [allServiceBeds, assignedIds]
  )

  const canCreate = sala.trim() !== '' && cama.toString().trim() !== ''
  // Label compuesto: "3-5" o "Norte-12"
  const composedLabel = canCreate ? `${sala.trim()}-${cama.toString().trim()}` : ''

  function handleCreate(e) {
    e.preventDefault()
    if (!canCreate) return
    createBed({ label: composedLabel, serviceId, teamId })
    setSala('')
    setCama('')
    onClose()
  }

  function handleMove(bedId) {
    if (bedId) {
      assignBedToTeam(bedId, serviceId, teamId)
      onClose()
    }
  }

  return (
    <div className="px-3 pb-3 pt-2 border-t border-gray-100 bg-gray-50">
      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {['nueva', 'existente'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${
              tab === t
                ? 'bg-white text-teal-700 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'nueva' ? '+ Nueva cama' : `Mover existente${unassigned.length ? ` (${unassigned.length})` : ''}`}
          </button>
        ))}
      </div>

      {tab === 'nueva' ? (
        <form onSubmit={handleCreate} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5 block">Sala</label>
              <input
                type="text"
                value={sala}
                onChange={e => setSala(e.target.value)}
                placeholder="Ej: 3, A, Norte"
                className="w-full text-xs px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-white"
                autoFocus
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5 block">Cama</label>
              <input
                type="number"
                min="1"
                value={cama}
                onChange={e => setCama(e.target.value)}
                placeholder="Ej: 5"
                className="w-full text-xs px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-white"
              />
            </div>
          </div>
          {composedLabel && (
            <p className="text-[10px] text-gray-400">
              Etiqueta: <span className="font-semibold text-gray-600">{composedLabel}</span>
            </p>
          )}
          <div className="flex gap-2">
            <Button size="sm" variant="primary" type="submit" disabled={!canCreate} className="flex-1">
              Crear cama
            </Button>
            <Button size="sm" variant="ghost" type="button" onClick={onClose}>
              <X size={13} />
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex gap-2">
          {unassigned.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-1">
              No hay camas sin equipo en este servicio.
            </p>
          ) : (
            <>
              <select
                className="flex-1 text-xs px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-white"
                onChange={e => handleMove(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Seleccionar cama...</option>
                {unassigned.map(b => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
              <Button size="sm" variant="ghost" type="button" onClick={onClose}>
                <X size={13} />
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function TeamBedList({ serviceId, team, searchQuery = '' }) {
  const [assigningBed, setAssigningBed] = useState(null)
  const [movingBed,    setMovingBed]    = useState(null)
  const [showAdd,      setShowAdd]      = useState(false)

  const teamBeds = useVisiStore(selectBedsByTeam(serviceId, team.id))

  const filteredBeds = searchQuery
    ? teamBeds.filter(b => b.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : teamBeds

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-3 py-2 flex items-center justify-between border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">{team.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{teamBeds.length} cama{teamBeds.length !== 1 ? 's' : ''}</span>
          <Button
            size="sm"
            variant="ghost-teal"
            onClick={() => setShowAdd(v => !v)}
            title="Agregar cama"
          >
            <Plus size={13} />
          </Button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filteredBeds.length === 0 && !showAdd && (
          <p className="text-xs text-gray-400 px-3 py-3 italic">
            {searchQuery ? 'Sin camas que coincidan.' : 'Sin camas. Usa + para crear una.'}
          </p>
        )}
        {filteredBeds.map(bed => (
          <BedRow
            key={bed.id}
            bed={bed}
            serviceId={serviceId}
            teamId={team.id}
            onAssignPatient={setAssigningBed}
            onMoveBed={setMovingBed}
          />
        ))}
      </div>

      {showAdd && (
        <AddBedPanel
          serviceId={serviceId}
          teamId={team.id}
          onClose={() => setShowAdd(false)}
        />
      )}

      {assigningBed && (
        <PatientAssignModal bed={assigningBed} onClose={() => setAssigningBed(null)} />
      )}
      {movingBed && (
        <MoveBedModal bed={movingBed} onClose={() => setMovingBed(null)} />
      )}
    </div>
  )
}
