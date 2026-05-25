import { useParams, Navigate } from 'react-router-dom'
import Breadcrumb from '../components/layout/Breadcrumb'
import StatCard from '../components/ui/StatCard'
import { SERVICES } from '../data/hierarchy'
import useVisiStore from '../store/useVisiStore'
import { selectTeamTaskCounts, selectPatientsByTeam } from '../store/selectors'

function TeamStatCard({ serviceId, team }) {
  const counts = useVisiStore(selectTeamTaskCounts(team.id))
  const patients = useVisiStore(selectPatientsByTeam(team.id))
  return (
    <div className="relative">
      <StatCard serviceId={serviceId} team={team} counts={counts} />
      <div className="mt-1 text-xs text-gray-400 px-1">
        {patients.length} paciente{patients.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

export default function ServiceDashboard() {
  const { serviceId } = useParams()
  const service = SERVICES.find(s => s.id === serviceId)
  const teams = useVisiStore(s => s.teams[serviceId] || [])
  if (!service) return <Navigate to="/" replace />

  return (
    <div className="py-2">
      <Breadcrumb items={[
        { label: 'Inicio', href: '/' },
        { label: service.label },
      ]} />

      <div className="mt-2 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: service.color }} />
          <h1 className="text-2xl font-display font-bold text-bay-blue">{service.label}</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1 ml-7">
          Resumen de tareas por equipo. Haz clic en un equipo para ver su tablero Kanban.
        </p>
      </div>

      {teams.length === 0 ? (
        <p className="text-gray-500 italic">No hay equipos definidos para este servicio.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map(team => (
            <TeamStatCard key={team.id} serviceId={serviceId} team={team} />
          ))}
        </div>
      )}
    </div>
  )
}
