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
