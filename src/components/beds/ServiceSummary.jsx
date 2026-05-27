import { Users, ClipboardList, AlertTriangle } from 'lucide-react'
import useVisiStore from '../../store/useVisiStore'
import { selectServiceSummary } from '../../store/selectors'
import { TASK_TYPES } from '../../data/hierarchy'

export default function ServiceSummary({ serviceId }) {
  const { totalPatients, totalTasks, activeTasks, byType, oldCount, oldPct } =
    useVisiStore(selectServiceSummary(serviceId))

  const activeTypes = TASK_TYPES.filter(t => {
    const c = byType[t.id]
    return c && (c.iniciada + c.en_proceso) > 0
  })

  return (
    <div className="border-t border-gray-200 bg-gray-50 px-5 py-3">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Resumen del servicio
      </p>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        <StatPill icon={Users}         label="Pacientes"      value={totalPatients} />
        <StatPill icon={ClipboardList} label="Tareas totales" value={totalTasks} />
        <StatPill icon={ClipboardList} label="Activas"        value={activeTasks} accent />
      </div>

      {/* Tasks by type table */}
      {activeTypes.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-2">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left font-medium text-gray-500 px-3 py-1.5">Tipo de tarea</th>
                <th className="text-center font-medium text-amber-600 px-2 py-1.5 w-20">Iniciada</th>
                <th className="text-center font-medium text-blue-600 px-2 py-1.5 w-24">En Proceso</th>
              </tr>
            </thead>
            <tbody>
              {activeTypes.map((t, i) => (
                <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                  <td className="px-3 py-1 text-gray-700">{t.label}</td>
                  <td className="text-center px-2 py-1 font-semibold text-amber-700">
                    {byType[t.id]?.iniciada || 0}
                  </td>
                  <td className="text-center px-2 py-1 font-semibold text-blue-700">
                    {byType[t.id]?.en_proceso || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic mb-2">Sin tareas activas</p>
      )}

      {/* >24h warning */}
      {oldCount > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
          <AlertTriangle size={12} className="shrink-0" />
          <span>
            <span className="font-semibold">{oldCount}</span> tarea{oldCount !== 1 ? 's' : ''} con más de 24 h
            <span className="ml-1 text-amber-500">({oldPct}% de las activas)</span>
          </span>
        </div>
      )}
    </div>
  )
}

function StatPill({ icon: Icon, label, value, accent }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs
      ${accent ? 'bg-teal-50 border-teal-200' : 'bg-white border-gray-200'}`}>
      <Icon size={11} className={accent ? 'text-teal-500' : 'text-gray-400'} />
      <span className="text-gray-500">{label}:</span>
      <span className={`font-semibold ${accent ? 'text-teal-700' : 'text-gray-800'}`}>{value}</span>
    </div>
  )
}
