export const selectPatientsByTeam = (teamId) => (state) =>
  Object.values(state.patients).filter(p => p.teamId === teamId)

export const selectTasksByTeam = (teamId) => (state) =>
  Object.values(state.tasks).filter(t => t.teamId === teamId)

export const selectTasksByTeamAndStatus = (teamId, status) => (state) =>
  Object.values(state.tasks).filter(t => t.teamId === teamId && t.status === status)

export const selectTeamTaskCounts = (teamId) => (state) => {
  const tasks = Object.values(state.tasks).filter(t => t.teamId === teamId)
  return {
    iniciada:   tasks.filter(t => t.status === 'iniciada').length,
    en_proceso: tasks.filter(t => t.status === 'en_proceso').length,
    terminada:  tasks.filter(t => t.status === 'terminada').length,
    total:      tasks.length,
  }
}

export const selectBedsByService = (serviceId) => (state) =>
  state.beds.filter(b => b.serviceId === serviceId)

export const selectBedsByTeam = (serviceId, teamId) => (state) => {
  const key = `${serviceId}__${teamId}`
  const bedIds = state.teamAssignments[key] || []
  return state.beds.filter(b => bedIds.includes(b.id))
}

export const selectUnassignedBedsByService = (serviceId) => (state) => {
  const assignedIds = new Set(
    Object.values(state.teamAssignments).flat()
  )
  return state.beds.filter(b => b.serviceId === serviceId && !assignedIds.has(b.id))
}

export const selectPatientByBed = (bedId) => (state) =>
  Object.values(state.patients).find(p => p.bedId === bedId)

export const selectTasksByPatient = (patientId) => (state) =>
  Object.values(state.tasks).filter(t => t.patientId === patientId)

export const selectTasksByPatientAndStatus = (patientId, status) => (state) =>
  Object.values(state.tasks).filter(t => t.patientId === patientId && t.status === status)

export const selectServiceSummary = (serviceId) => (state) => {
  const totalPatients = Object.values(state.patients).filter(p => p.serviceId === serviceId).length
  const allTasks = Object.values(state.tasks).filter(t => t.serviceId === serviceId)
  const activeTasks = allTasks.filter(t => t.status !== 'terminada')

  const MS_24H = 24 * 60 * 60 * 1000
  const now = Date.now()
  const oldCount = activeTasks.filter(t => now - new Date(t.createdAt).getTime() > MS_24H).length

  const byType = {}
  activeTasks.forEach(t => {
    if (!byType[t.type]) byType[t.type] = { iniciada: 0, en_proceso: 0 }
    if (t.status === 'iniciada') byType[t.type].iniciada++
    else if (t.status === 'en_proceso') byType[t.type].en_proceso++
  })

  return {
    totalPatients,
    totalTasks: allTasks.length,
    activeTasks: activeTasks.length,
    byType,
    oldCount,
    oldPct: activeTasks.length > 0 ? Math.round(oldCount / activeTasks.length * 100) : 0,
  }
}
