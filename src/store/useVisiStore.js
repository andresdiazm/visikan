import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BEDS } from '../data/beds'

function seedTeamAssignments(beds) {
  const assignments = {}
  beds.forEach(b => {
    if (b.teamId) {
      const key = `${b.serviceId}__${b.teamId}`
      assignments[key] = [...(assignments[key] || []), b.id]
    }
  })
  return assignments
}

const useVisiStore = create(
  persist(
    (set, get) => ({
      // ── BEDS (static, never regenerated) ──────────────────────────────
      beds: BEDS,

      // ── TEAM ASSIGNMENTS ──────────────────────────────────────────────
      teamAssignments: seedTeamAssignments(BEDS),

      assignBedToTeam(bedId, serviceId, teamId) {
        set(state => {
          const key = `${serviceId}__${teamId}`
          const prev = state.teamAssignments[key] || []
          if (prev.includes(bedId)) return state
          // Remove from any other team in same service first
          const updated = { ...state.teamAssignments }
          Object.keys(updated).forEach(k => {
            if (k.startsWith(`${serviceId}__`)) {
              updated[k] = updated[k].filter(id => id !== bedId)
            }
          })
          updated[key] = [...(updated[key] || []), bedId]
          return { teamAssignments: updated }
        })
      },

      removeBedFromTeam(bedId, serviceId, teamId) {
        set(state => {
          const key = `${serviceId}__${teamId}`
          return {
            teamAssignments: {
              ...state.teamAssignments,
              [key]: (state.teamAssignments[key] || []).filter(id => id !== bedId),
            },
          }
        })
      },

      // ── PATIENTS ──────────────────────────────────────────────────────
      patients: {},

      assignPatientToBed(bedId, name, rut) {
        set(state => {
          const bed = state.beds.find(b => b.id === bedId)
          if (!bed) return state

          // Resolve teamId: pre-set on bed (UCI/UTI) or looked up in teamAssignments
          let teamId = bed.teamId
          if (!teamId) {
            const entry = Object.entries(state.teamAssignments).find(([, ids]) => ids.includes(bedId))
            if (entry) teamId = entry[0].split('__')[1]
          }

          // Remove existing patient in this bed
          const filtered = Object.fromEntries(
            Object.entries(state.patients).filter(([, p]) => p.bedId !== bedId)
          )
          const id = `pat-${Date.now()}`
          return {
            patients: {
              ...filtered,
              [id]: { id, name, rut, bedId, serviceId: bed.serviceId, teamId, isHomeCare: false },
            },
          }
        })
      },

      addHomeCarePatient(name, rut) {
        set(state => {
          const id = `pat-${Date.now()}`
          return {
            patients: {
              ...state.patients,
              [id]: { id, name, rut, bedId: null, serviceId: 'hosdom', teamId: 'hosdom_main', isHomeCare: true },
            },
          }
        })
      },

      removePatient(patientId) {
        set(state => {
          const { [patientId]: _, ...patients } = state.patients
          const tasks = Object.fromEntries(
            Object.entries(state.tasks).filter(([, t]) => t.patientId !== patientId)
          )
          return { patients, tasks }
        })
      },

      // Update the teamId on a patient when their bed's team assignment changes
      updatePatientTeam(patientId, teamId) {
        set(state => ({
          patients: {
            ...state.patients,
            [patientId]: { ...state.patients[patientId], teamId },
          },
        }))
      },

      // ── TASKS ─────────────────────────────────────────────────────────
      tasks: {},

      createTask({ patientId, type, description, priority, labels, notes }) {
        set(state => {
          const patient = state.patients[patientId]
          if (!patient) return state
          const id = `task-${Date.now()}`
          return {
            tasks: {
              ...state.tasks,
              [id]: {
                id,
                patientId,
                teamId: patient.teamId,
                serviceId: patient.serviceId,
                type,
                description,
                priority: priority || 'normal',
                labels: labels || [],
                notes: notes || '',
                status: 'iniciada',
                createdAt: new Date().toISOString(),
              },
            },
          }
        })
      },

      moveTask(taskId, newStatus) {
        set(state => ({
          tasks: {
            ...state.tasks,
            [taskId]: { ...state.tasks[taskId], status: newStatus },
          },
        }))
      },

      updateTask(taskId, updates) {
        set(state => ({
          tasks: {
            ...state.tasks,
            [taskId]: { ...state.tasks[taskId], ...updates },
          },
        }))
      },

      deleteTask(taskId) {
        set(state => {
          const { [taskId]: _, ...tasks } = state.tasks
          return { tasks }
        })
      },

      clearCompletedTasks(teamId) {
        set(state => ({
          tasks: Object.fromEntries(
            Object.entries(state.tasks).filter(
              ([, t]) => !(t.teamId === teamId && t.status === 'terminada')
            )
          ),
        }))
      },

      // ── LABELS ────────────────────────────────────────────────────────
      labels: [],

      createLabel(name, color) {
        set(state => ({
          labels: [...state.labels, { id: `lbl-${Date.now()}`, name, color }],
        }))
      },

      deleteLabel(labelId) {
        set(state => ({
          labels: state.labels.filter(l => l.id !== labelId),
          tasks: Object.fromEntries(
            Object.entries(state.tasks).map(([id, t]) => [
              id,
              { ...t, labels: t.labels.filter(l => l !== labelId) },
            ])
          ),
        }))
      },
    }),
    { name: 'visikan-store' }
  )
)

export default useVisiStore
