import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, ClipboardList, BedDouble } from 'lucide-react'
import { SERVICES } from '../data/hierarchy'
import useVisiStore from '../store/useVisiStore'

function ServiceSummaryCard({ service }) {
  const navigate = useNavigate()
  const teams    = useVisiStore(s => s.teams[service.id] || [])
  const patients = useVisiStore(s =>
    Object.values(s.patients).filter(p => p.serviceId === service.id)
  )
  const activeTasks = useVisiStore(s =>
    Object.values(s.tasks).filter(t => t.serviceId === service.id && t.status !== 'terminada')
  )
  const beds = useVisiStore(s => s.beds.filter(b => b.serviceId === service.id))

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header servicio */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: service.color }} />
        <span className="flex-1 font-semibold text-gray-900">{service.label}</span>
        <button
          onClick={() => navigate(`/service/${service.id}`)}
          className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-medium px-2 py-1 rounded-lg hover:bg-teal-50 transition-colors"
        >
          <LayoutDashboard size={13} />
          Dashboard
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-100">
        <div className="flex flex-col items-center py-3 px-2">
          <div className="flex items-center gap-1 text-gray-400 mb-1">
            <BedDouble size={13} />
            <span className="text-[10px] uppercase tracking-wide font-medium">Camas</span>
          </div>
          <span className="text-xl font-bold text-gray-800">{beds.length}</span>
        </div>
        <div className="flex flex-col items-center py-3 px-2">
          <div className="flex items-center gap-1 text-gray-400 mb-1">
            <Users size={13} />
            <span className="text-[10px] uppercase tracking-wide font-medium">Pacientes</span>
          </div>
          <span className="text-xl font-bold text-gray-800">{patients.length}</span>
        </div>
        <div className="flex flex-col items-center py-3 px-2">
          <div className="flex items-center gap-1 text-gray-400 mb-1">
            <ClipboardList size={13} />
            <span className="text-[10px] uppercase tracking-wide font-medium">Tareas</span>
          </div>
          <span className={`text-xl font-bold ${activeTasks.length > 0 ? 'text-amber-600' : 'text-gray-800'}`}>
            {activeTasks.length}
          </span>
        </div>
      </div>

      {/* Equipos con acceso rápido al kanban */}
      {teams.length > 0 && (
        <div className="px-4 pb-3 pt-1 border-t border-gray-100 flex flex-wrap gap-1.5">
          {teams.map(team => {
            const teamPatients = patients.filter(p => p.teamId === team.id).length
            const teamTasks    = activeTasks.filter(t => t.teamId === team.id).length
            return (
              <button
                key={team.id}
                onClick={() => navigate(`/service/${service.id}/team/${team.id}`)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-gray-600 hover:text-teal-700 transition-colors"
              >
                <span className="font-medium">{team.label}</span>
                {teamPatients > 0 && (
                  <span className="bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                    {teamPatients}p
                  </span>
                )}
                {teamTasks > 0 && (
                  <span className="bg-amber-100 text-amber-600 rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                    {teamTasks}t
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Landing() {
  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-bay-blue">Inicio</h1>
        <p className="text-sm text-gray-500 mt-1">
          Vista general por servicio. Haz clic en un equipo para ir a su tablero de tareas.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map(service => (
          <ServiceSummaryCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  )
}
