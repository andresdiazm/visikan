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
      <div className="flex items-center gap-1">
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
  const createBed      = useVisiStore(s => s.createBed)
  const moveBedToTeam  = useVisiStore(s => s.moveBedToTeam)
  const [sala,      setSala]      = useState('')
  const [cama,      setCama]      = useState('')
  const [salaName,  setSalaName]  = useState('')
  const [salaCount, setSalaCount] = useState(3)
  const [bedSearch, setBedSearch] = useState('')
  const [tab, setTab] = useState('existente') // default: asignar del banco

  // Todas las camas sin asignar a ningún equipo (banco global)
  const allBeds    = useVisiStore(s => s.beds)
  const assignedIds = new Set(useVisiStore(s => Object.values(s.teamAssignments).flat()))
  const unassigned = useMemo(
    () => [...allBeds.filter(b => !assignedIds.has(b.id))]
      .sort((a, b) => a.label.localeCompare(b.label, 'es', { numeric: true, sensitivity: 'base' })),
    [allBeds, assignedIds]
  )
  const filteredUnassigned = useMemo(() => {
    const q = bedSearch.trim().toLowerCase()
    return q ? unassigned.filter(b => b.label.toLowerCase().includes(q)) : unassigned
  }, [unassigned, bedSearch])

  // Salas existentes globales (para detectar duplicados al crear)
  const existingSalas = useMemo(() => {
    const names = new Set()
    allBeds.forEach(b => {
      const idx = b.label.indexOf('-')
      if (idx > 0) names.add(b.label.slice(0, idx).toLowerCase())
    })
    return names
  }, [allBeds])

  const canCreate = sala.trim() !== '' && cama.toString().trim() !== ''
  const composedLabel = canCreate ? `${sala.trim()}-${cama.toString().trim()}` : ''

  const salaExists = salaName.trim() !== '' && existingSalas.has(salaName.trim().toLowerCase())
  const canCreateSala = salaName.trim() !== '' && !salaExists && salaCount >= 1 && salaCount <= 6

  function handleCreate(e) {
    e.preventDefault()
    if (!canCreate) return
    createBed({ label: composedLabel, serviceId, teamId })
    setSala('')
    setCama('')
    onClose()
  }

  async function handleCreateSala(e) {
    e.preventDefault()
    if (!canCreateSala) return
    for (let i = 1; i <= salaCount; i++) {
      await createBed({ label: `${salaName.trim()}-${i}`, serviceId, teamId })
    }
    setSalaName('')
    setSalaCount(3)
    onClose()
  }

  function handleAssign(bedId) {
    if (bedId) {
      moveBedToTeam(bedId, serviceId, teamId)
      onClose()
    }
  }

  const TABS = [
    { id: 'existente', label: `Asignar${unassigned.length ? ` (${unassigned.length})` : ''}` },
    { id: 'nueva',     label: '+ Cama' },
    { id: 'sala',      label: '+ Sala' },
  ]

  return (
    <div className="px-3 pb-3 pt-2 border-t border-gray-100 bg-gray-50">
      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${
              tab === t.id
                ? 'bg-white text-teal-700 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'nueva' && (
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
      )}

      {tab === 'sala' && (
        <form onSubmit={handleCreateSala} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5 block">Nombre de sala</label>
              <input
                type="text"
                value={salaName}
                onChange={e => setSalaName(e.target.value)}
                placeholder="Ej: 601, Norte, A"
                className={`w-full text-xs px-2 py-1.5 rounded border focus:outline-none focus:ring-1 bg-white ${
                  salaExists
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-gray-300 focus:ring-teal-400'
                }`}
                autoFocus
              />
            </div>
            <div className="w-20 shrink-0">
              <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5 block">Camas (1–6)</label>
              <input
                type="number"
                min="1"
                max="6"
                value={salaCount}
                onChange={e => setSalaCount(Math.min(6, Math.max(1, Number(e.target.value))))}
                className="w-full text-xs px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-white"
              />
            </div>
          </div>

          {salaExists && (
            <p className="text-[10px] text-red-500 font-medium">
              ⚠ Ya existe una sala con el nombre "{salaName.trim()}" en este servicio.
            </p>
          )}

          {canCreateSala && (
            <p className="text-[10px] text-gray-400">
              Se crearán:{' '}
              <span className="font-semibold text-gray-600">
                {Array.from({ length: salaCount }, (_, i) => `${salaName.trim()}-${i + 1}`).join(', ')}
              </span>
            </p>
          )}

          <div className="flex gap-2">
            <Button size="sm" variant="primary" type="submit" disabled={!canCreateSala} className="flex-1">
              Crear sala ({salaCount} cama{salaCount !== 1 ? 's' : ''})
            </Button>
            <Button size="sm" variant="ghost" type="button" onClick={onClose}>
              <X size={13} />
            </Button>
          </div>
        </form>
      )}

      {tab === 'existente' && (
        <div className="flex flex-col gap-2">
          {unassigned.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-1">
              No hay camas sin asignar en el banco.
            </p>
          ) : (
            <>
              <div className="relative">
                <input
                  type="text"
                  value={bedSearch}
                  onChange={e => setBedSearch(e.target.value)}
                  placeholder="Buscar cama..."
                  autoFocus
                  className="w-full text-xs px-2 py-1.5 pr-6 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-white"
                />
                {bedSearch && (
                  <button onClick={() => setBedSearch('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={11} />
                  </button>
                )}
              </div>
              {filteredUnassigned.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-1">Sin resultados.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto flex flex-col gap-0.5">
                  {filteredUnassigned.map(b => (
                    <button
                      key={b.id}
                      onClick={() => handleAssign(b.id)}
                      className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-teal-50 hover:text-teal-700 text-gray-700 transition-colors"
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              )}
              <Button size="sm" variant="ghost" type="button" onClick={onClose} className="self-end">
                Cancelar
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
