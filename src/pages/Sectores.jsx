import { useState } from 'react'
import { ChevronDown, ChevronRight, LayoutDashboard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import TeamBedList from '../components/beds/TeamBedList'
import Button from '../components/ui/Button'
import { SERVICES, TEAMS } from '../data/hierarchy'

function ServicePanel({ service }) {
  const [open, setOpen] = useState(true)   // expandido por defecto
  const navigate = useNavigate()
  const teams = TEAMS[service.id] || []

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header del servicio */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => e.key === 'Enter' && setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer select-none"
      >
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: service.color }} />
        <span className="flex-1 text-left font-semibold text-gray-900">{service.label}</span>
        <span className="text-xs text-gray-400 mr-2">
          {teams.length} sector{teams.length !== 1 ? 'es' : ''}
        </span>
        <Button
          size="sm"
          variant="ghost-teal"
          onClick={e => { e.stopPropagation(); navigate(`/service/${service.id}`) }}
          title="Ver dashboard del servicio"
        >
          <LayoutDashboard size={14} />
          <span className="hidden sm:inline">Dashboard</span>
        </Button>
        {open
          ? <ChevronDown size={16} className="text-gray-400" />
          : <ChevronRight size={16} className="text-gray-400" />
        }
      </div>

      {/* Listado de sectores/equipos */}
      {open && (
        <div className="border-t border-gray-100 px-5 py-4">
          {teams.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Sin sectores definidos para este servicio.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map(team => (
                <TeamBedList key={team.id} serviceId={service.id} team={team} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Sectores() {
  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-bay-blue">Gestión de Sectores</h1>
        <p className="text-sm text-gray-500 mt-1">
          Administra los sectores de cada servicio: crea camas, asigna pacientes y organiza los equipos.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {SERVICES.map(service => (
          <ServicePanel key={service.id} service={service} />
        ))}
      </div>
    </div>
  )
}
