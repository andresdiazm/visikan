import { useState } from 'react'
import { ChevronDown, ChevronRight, LayoutDashboard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import TeamBedList from './TeamBedList'
import ServiceSummary from './ServiceSummary'
import Button from '../ui/Button'
import { TEAMS } from '../../data/hierarchy'

export default function ServiceCard({ service }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const teams = TEAMS[service.id] || []

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => e.key === 'Enter' && setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: service.color }}
        />
        <span className="flex-1 text-left font-semibold text-gray-900">{service.label}</span>
        <Button
          size="sm"
          variant="ghost-teal"
          onClick={e => { e.stopPropagation(); navigate(`/service/${service.id}`) }}
          className="mr-2"
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

      {open && (
        <>
          <div className="border-t border-gray-100 px-5 py-4">
            {teams.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Sin equipos definidos</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {teams.map(team => (
                  <TeamBedList key={team.id} serviceId={service.id} team={team} />
                ))}
              </div>
            )}
          </div>
          <ServiceSummary serviceId={service.id} />
        </>
      )}
    </div>
  )
}
