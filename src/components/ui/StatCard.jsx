import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function StatCard({ serviceId, team, counts }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/service/${serviceId}/team/${team.id}`)}
      className="w-full text-left bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all p-4 group"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 group-hover:text-teal-700">{team.label}</h3>
        <ChevronRight size={16} className="text-gray-400 group-hover:text-teal-500" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-amber-50">
          <div className="text-xl font-bold text-amber-600">{counts.iniciada}</div>
          <div className="text-xs text-amber-700 mt-0.5">Iniciadas</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-blue-50">
          <div className="text-xl font-bold text-blue-600">{counts.en_proceso}</div>
          <div className="text-xs text-blue-700 mt-0.5">En Proceso</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-green-50">
          <div className="text-xl font-bold text-green-600">{counts.terminada}</div>
          <div className="text-xs text-green-700 mt-0.5">Terminadas</div>
        </div>
      </div>
      {counts.total > 0 && (
        <div className="mt-2 text-xs text-gray-500">{counts.total} tarea{counts.total !== 1 ? 's' : ''} en total</div>
      )}
    </button>
  )
}
