import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, Pencil, Trash2, Plus, Check, X, BedDouble, Search } from 'lucide-react'
import Button from '../components/ui/Button'
import TeamBedList from '../components/beds/TeamBedList'
import MoveBedModal from '../components/beds/MoveBedModal'
import { SERVICES } from '../data/hierarchy'
import useVisiStore from '../store/useVisiStore'

// ── Banco de Camas (camas sin sector asignado) ───────────────────────────────
function BancoCamas() {
  const [search,    setSearch]    = useState('')
  const [open,      setOpen]      = useState(true)
  const [selected,  setSelected]  = useState(new Set()) // Set de bed.id
  const [assigning, setAssigning] = useState(false)

  const unassigned = useVisiStore(s => {
    const assignedIds = new Set(Object.values(s.teamAssignments).flat())
    return s.beds.filter(b => !assignedIds.has(b.id))
  })

  // Agrupa por sala y filtra según búsqueda
  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = unassigned.filter(b => !q || b.label.toLowerCase().includes(q))
    filtered.sort((a, b) => a.label.localeCompare(b.label, 'es', { numeric: true, sensitivity: 'base' }))
    const map = new Map()
    filtered.forEach(b => {
      const sala = b.label.includes('-') ? b.label.slice(0, b.label.indexOf('-')) : b.label
      if (!map.has(sala)) map.set(sala, [])
      map.get(sala).push(b)
    })
    return [...map.entries()].sort(([a], [b]) =>
      a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' })
    )
  }, [unassigned, search])

  const allFilteredIds = useMemo(() => new Set(grouped.flatMap(([, beds]) => beds.map(b => b.id))), [grouped])

  function toggleBed(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSala(bedIds) {
    const allSelected = bedIds.every(id => selected.has(id))
    setSelected(prev => {
      const next = new Set(prev)
      bedIds.forEach(id => allSelected ? next.delete(id) : next.add(id))
      return next
    })
  }

  function toggleAll() {
    if (selected.size === allFilteredIds.size) {
      setSelected(new Set())
    } else {
      setSelected(new Set(allFilteredIds))
    }
  }

  const selectedBeds = unassigned.filter(b => selected.has(b.id))

  if (unassigned.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden mb-4">
      {/* Header */}
      <div
        role="button" tabIndex={0}
        onClick={() => setOpen(v => !v)}
        onKeyDown={e => e.key === 'Enter' && setOpen(v => !v)}
        className="flex items-center gap-3 px-5 py-3 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer select-none"
      >
        <BedDouble size={16} className="text-amber-600 shrink-0" />
        <span className="flex-1 font-semibold text-gray-900">Banco de Camas</span>
        <span className="text-xs text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
          {unassigned.length} sin asignar
        </span>
        {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
      </div>

      {open && (
        <div className="px-5 py-4">
          {/* Buscador + seleccionar todo */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar sala o número..."
                className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              onClick={toggleAll}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-colors whitespace-nowrap"
            >
              {selected.size === allFilteredIds.size && allFilteredIds.size > 0 ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </button>
          </div>

          {grouped.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-4">Sin resultados para "{search}"</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
              {grouped.map(([sala, beds]) => {
                const bedIds = beds.map(b => b.id)
                const allSalaSelected = bedIds.every(id => selected.has(id))
                const someSalaSelected = bedIds.some(id => selected.has(id))
                return (
                  <div key={sala}>
                    {/* Cabecera de sala */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <button
                        onClick={() => toggleSala(bedIds)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
                          allSalaSelected
                            ? 'bg-teal-100 text-teal-700 border border-teal-300'
                            : someSalaSelected
                              ? 'bg-teal-50 text-teal-600 border border-teal-200'
                              : 'text-gray-500 border border-gray-200 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50'
                        }`}
                        title={allSalaSelected ? 'Deseleccionar sala' : 'Seleccionar toda la sala'}
                      >
                        SALA {sala}
                        <span className="font-normal text-gray-400 ml-1">{beds.length} cama{beds.length !== 1 ? 's' : ''}</span>
                      </button>
                    </div>
                    {/* Chips de camas */}
                    <div className="flex flex-wrap gap-1.5">
                      {beds.map(bed => {
                        const sel = selected.has(bed.id)
                        return (
                          <button
                            key={bed.id}
                            onClick={() => toggleBed(bed.id)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                              sel
                                ? 'bg-teal-500 border-teal-500 text-white'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700'
                            }`}
                            title={sel ? 'Deseleccionar' : 'Seleccionar'}
                          >
                            <BedDouble size={11} className={sel ? 'text-white' : 'text-gray-300'} />
                            {bed.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Barra de acción flotante */}
          {selected.size > 0 && (
            <div className="mt-4 flex items-center justify-between gap-3 bg-teal-600 text-white rounded-xl px-4 py-2.5">
              <span className="text-sm font-medium">
                {selected.size} cama{selected.size !== 1 ? 's' : ''} seleccionada{selected.size !== 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelected(new Set())}
                  className="text-xs text-teal-200 hover:text-white transition-colors"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => setAssigning(true)}
                  className="text-xs bg-white text-teal-700 font-semibold px-3 py-1 rounded-lg hover:bg-teal-50 transition-colors"
                >
                  Asignar →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {assigning && (
        <MoveBedModal
          beds={selectedBeds}
          onClose={() => { setAssigning(false); setSelected(new Set()) }}
        />
      )}
    </div>
  )
}

// ── Fila de equipo ────────────────────────────────────────────────────────────
function TeamRow({ team, serviceId, searchQuery = '' }) {
  const [editing,  setEditing]  = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [label,    setLabel]    = useState(team.label)

  const updateTeam = useVisiStore(s => s.updateTeam)
  const deleteTeam = useVisiStore(s => s.deleteTeam)

  const bedCount = useVisiStore(s => {
    const key = `${serviceId}__${team.id}`
    return (s.teamAssignments[key] || []).length
  })

  const hasMatchingBeds = useVisiStore(s => {
    if (!searchQuery) return false
    const key = `${serviceId}__${team.id}`
    const ids = new Set(s.teamAssignments[key] || [])
    return s.beds.some(b => ids.has(b.id) && b.label.toLowerCase().includes(searchQuery.toLowerCase()))
  })

  const effectiveExpanded = searchQuery ? hasMatchingBeds : expanded

  function handleSave() {
    if (label.trim() && label.trim() !== team.label) updateTeam(team.id, serviceId, label.trim())
    setEditing(false)
  }

  function handleDelete() {
    if (window.confirm(`¿Eliminar sector "${team.label}"? Las camas quedarán sin equipo.`)) {
      deleteTeam(team.id, serviceId)
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Cabecera del equipo */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white">
        {editing ? (
          <>
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setLabel(team.label); setEditing(false) } }}
              className="flex-1 text-sm px-2 py-1 border border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
              autoFocus
            />
            <Button size="sm" variant="primary" onClick={handleSave}><Check size={13} /></Button>
            <Button size="sm" variant="ghost" onClick={() => { setLabel(team.label); setEditing(false) }}><X size={13} /></Button>
          </>
        ) : (
          <>
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-2 flex-1 text-left"
            >
              {effectiveExpanded
                ? <ChevronDown size={14} className="text-gray-400 shrink-0" />
                : <ChevronRight size={14} className="text-gray-400 shrink-0" />
              }
              <span className="text-sm font-medium text-gray-800">{team.label}</span>
              <span className="text-xs text-gray-400 ml-1">
                {bedCount} cama{bedCount !== 1 ? 's' : ''}
              </span>
            </button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)} title="Renombrar">
              <Pencil size={13} className="text-gray-400" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDelete} title="Eliminar sector"
              className="text-red-400 hover:text-red-600 hover:bg-red-50">
              <Trash2 size={13} />
            </Button>
          </>
        )}
      </div>

      {/* Gestión de camas (expandible) */}
      {effectiveExpanded && (
        <div className="border-t border-gray-100 p-3 bg-gray-50">
          <TeamBedList serviceId={serviceId} team={team} searchQuery={searchQuery} />
        </div>
      )}
    </div>
  )
}

// ── Panel por servicio ────────────────────────────────────────────────────────
function ServicePanel({ service, searchQuery = '' }) {
  const [open,     setOpen]     = useState(true)
  const effectiveOpen = searchQuery ? true : open
  const [adding,   setAdding]   = useState(false)
  const [newLabel, setNewLabel] = useState('')

  const teams      = useVisiStore(s => s.teams[service.id] || [])
  const createTeam = useVisiStore(s => s.createTeam)

  function handleAdd(e) {
    e.preventDefault()
    if (!newLabel.trim()) return
    createTeam(service.id, newLabel.trim())
    setNewLabel('')
    setAdding(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header servicio */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => e.key === 'Enter' && setOpen(o => !o)}
        className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer select-none"
      >
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: service.color }} />
        <span className="flex-1 font-semibold text-gray-900">{service.label}</span>
        <span className="text-xs text-gray-400 mr-2">
          {teams.length} sector{teams.length !== 1 ? 'es' : ''}
        </span>
        {effectiveOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
      </div>

      {/* Lista de equipos */}
      {effectiveOpen && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="flex flex-col gap-2">
            {teams.length === 0 && !adding && (
              <p className="text-sm text-gray-400 italic">Sin sectores. Agrega uno con el botón +.</p>
            )}
            {teams.map(team => (
              <TeamRow key={team.id} team={team} serviceId={service.id} searchQuery={searchQuery} />
            ))}
          </div>

          {/* Formulario agregar sector */}
          {adding ? (
            <form onSubmit={handleAdd} className="flex gap-2 mt-3">
              <input
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Nombre del sector (ej: Sector 6)"
                className="flex-1 text-sm px-3 py-2 border border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                autoFocus
              />
              <Button type="submit" variant="primary" size="sm" disabled={!newLabel.trim()}>
                Crear
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => { setAdding(false); setNewLabel('') }}>
                <X size={13} />
              </Button>
            </form>
          ) : (
            <Button
              variant="ghost-teal"
              size="sm"
              onClick={() => setAdding(true)}
              className="mt-3"
            >
              <Plus size={14} /> Agregar sector
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Sectores() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-bay-blue">Asignación de Camas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Crea sectores por servicio y asigna camas a cada uno.
        </p>
      </div>

      {/* Buscador de camas */}
      <div className="mb-4 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar cama por sala o número..."
          className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 bg-white"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <BancoCamas />

      <div className="flex flex-col gap-4">
        {SERVICES.map(service => (
          <ServicePanel key={service.id} service={service} searchQuery={searchQuery} />
        ))}
      </div>
    </div>
  )
}
