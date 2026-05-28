import { useState } from 'react'
import { ChevronDown, ChevronRight, Pencil, Trash2, Plus, Check, X, BedDouble, Search } from 'lucide-react'
import Button from '../components/ui/Button'
import TeamBedList from '../components/beds/TeamBedList'
import { SERVICES } from '../data/hierarchy'
import useVisiStore from '../store/useVisiStore'

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

      <div className="flex flex-col gap-4">
        {SERVICES.map(service => (
          <ServicePanel key={service.id} service={service} searchQuery={searchQuery} />
        ))}
      </div>
    </div>
  )
}
