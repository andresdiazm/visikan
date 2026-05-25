import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// ── Conversores DB → store ────────────────────────────────────────────────────
const toBed     = r => ({ id: r.id, label: r.label, serviceId: r.service_id })
const toPatient = r => ({
  id: r.id, name: r.name, rut: r.rut || '',
  bedId: r.bed_id, serviceId: r.service_id,
  teamId: r.team_id, isHomeCare: r.is_home_care,
})
const toTask = r => ({
  id: r.id, patientId: r.patient_id,
  teamId: r.team_id, serviceId: r.service_id,
  type: r.type, description: r.description,
  priority: r.priority || 'normal',
  labels: r.labels || [],
  notes: r.notes || '',
  status: r.status || 'iniciada',
  createdAt: r.created_at,
})

// ── Carga completa desde Supabase ─────────────────────────────────────────────
async function fetchAll() {
  const [bedsR, assignR, patientsR, tasksR, labelsR] = await Promise.all([
    supabase.from('beds').select('*'),
    supabase.from('team_assignments').select('*'),
    supabase.from('patients').select('*'),
    supabase.from('tasks').select('*').order('created_at'),
    supabase.from('labels').select('*'),
  ])

  const beds = (bedsR.data || []).map(toBed)

  const teamAssignments = {}
  ;(assignR.data || []).forEach(a => {
    const key = `${a.service_id}__${a.team_id}`
    teamAssignments[key] = [...(teamAssignments[key] || []), a.bed_id]
  })

  const patients = {}
  ;(patientsR.data || []).forEach(p => { patients[p.id] = toPatient(p) })

  const tasks = {}
  ;(tasksR.data || []).forEach(t => { tasks[t.id] = toTask(t) })

  const labels = (labelsR.data || []).map(l => ({ id: l.id, name: l.name, color: l.color }))

  return { beds, teamAssignments, patients, tasks, labels }
}

// ── Store ─────────────────────────────────────────────────────────────────────
const useVisiStore = create((set, get) => ({
  loaded: false,
  beds: [],
  teamAssignments: {},
  patients: {},
  tasks: {},
  labels: [],

  // ── Inicialización ──────────────────────────────────────────────────────────
  async init() {
    const data = await fetchAll()
    set({ ...data, loaded: true })

    // Sincronización en tiempo real: cualquier cambio en DB recarga el estado
    supabase
      .channel('visikan-realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, async () => {
        const fresh = await fetchAll()
        set(fresh)
      })
      .subscribe()
  },

  // ── CAMAS ───────────────────────────────────────────────────────────────────
  async createBed({ label, serviceId, teamId }) {
    const id   = `bed-${Date.now()}`
    const lbl  = label.trim()
    const key  = `${serviceId}__${teamId}`

    // Optimista
    set(s => ({
      beds: [...s.beds, { id, label: lbl, serviceId }],
      teamAssignments: { ...s.teamAssignments, [key]: [...(s.teamAssignments[key] || []), id] },
    }))

    await supabase.from('beds').insert({ id, label: lbl, service_id: serviceId })
    await supabase.from('team_assignments').insert({ bed_id: id, service_id: serviceId, team_id: teamId })
  },

  async deleteBed(bedId) {
    const s = get()
    const affectedIds = new Set(Object.values(s.patients).filter(p => p.bedId === bedId).map(p => p.id))
    const ta = {}
    Object.entries(s.teamAssignments).forEach(([k, ids]) => { ta[k] = ids.filter(i => i !== bedId) })

    set({
      beds: s.beds.filter(b => b.id !== bedId),
      teamAssignments: ta,
      patients: Object.fromEntries(Object.entries(s.patients).filter(([id]) => !affectedIds.has(id))),
      tasks:    Object.fromEntries(Object.entries(s.tasks).filter(([, t]) => !affectedIds.has(t.patientId))),
    })

    // La FK con ON DELETE CASCADE elimina team_assignments, patients y tasks en cascada
    await supabase.from('beds').delete().eq('id', bedId)
  },

  // ── ASIGNACIONES DE EQUIPOS ─────────────────────────────────────────────────
  async assignBedToTeam(bedId, serviceId, teamId) {
    const s = get()
    const key = `${serviceId}__${teamId}`
    if ((s.teamAssignments[key] || []).includes(bedId)) return

    const updated = { ...s.teamAssignments }
    Object.keys(updated).forEach(k => {
      if (k.startsWith(`${serviceId}__`)) updated[k] = updated[k].filter(i => i !== bedId)
    })
    updated[key] = [...(updated[key] || []), bedId]
    set({ teamAssignments: updated })

    await supabase.from('team_assignments')
      .upsert({ bed_id: bedId, service_id: serviceId, team_id: teamId })
  },

  async removeBedFromTeam(bedId, serviceId, teamId) {
    const key = `${serviceId}__${teamId}`
    set(s => ({ teamAssignments: { ...s.teamAssignments, [key]: (s.teamAssignments[key] || []).filter(i => i !== bedId) } }))
    await supabase.from('team_assignments').delete().eq('bed_id', bedId)
  },

  // ── PACIENTES ───────────────────────────────────────────────────────────────
  async assignPatientToBed(bedId, name, rut) {
    const s    = get()
    const bed  = s.beds.find(b => b.id === bedId)
    if (!bed) return

    const entry  = Object.entries(s.teamAssignments).find(([, ids]) => ids.includes(bedId))
    const teamId = entry ? entry[0].split('__')[1] : null
    const existing = Object.values(s.patients).find(p => p.bedId === bedId)

    const id = `pat-${Date.now()}`
    const newPat = { id, name, rut, bedId, serviceId: bed.serviceId, teamId, isHomeCare: false }

    set(s => ({
      patients: { ...Object.fromEntries(Object.entries(s.patients).filter(([, p]) => p.bedId !== bedId)), [id]: newPat },
      tasks: existing
        ? Object.fromEntries(Object.entries(s.tasks).filter(([, t]) => t.patientId !== existing.id))
        : s.tasks,
    }))

    if (existing) await supabase.from('patients').delete().eq('id', existing.id)
    await supabase.from('patients').insert({ id, name, rut: rut || '', bed_id: bedId, service_id: bed.serviceId, team_id: teamId, is_home_care: false })
  },

  async removePatient(patientId) {
    set(s => {
      const { [patientId]: _, ...patients } = s.patients
      return { patients, tasks: Object.fromEntries(Object.entries(s.tasks).filter(([, t]) => t.patientId !== patientId)) }
    })
    await supabase.from('patients').delete().eq('id', patientId)
  },

  // ── TAREAS ──────────────────────────────────────────────────────────────────
  async createTask({ patientId, type, description, priority, labels, notes }) {
    const patient = get().patients[patientId]
    if (!patient) return
    const id = `task-${Date.now()}`
    const task = {
      id, patientId, teamId: patient.teamId, serviceId: patient.serviceId,
      type, description, priority: priority || 'normal',
      labels: labels || [], notes: notes || '',
      status: 'iniciada', createdAt: new Date().toISOString(),
    }
    set(s => ({ tasks: { ...s.tasks, [id]: task } }))
    await supabase.from('tasks').insert({
      id, patient_id: patientId, team_id: patient.teamId, service_id: patient.serviceId,
      type, description, priority: priority || 'normal',
      labels: labels || [], notes: notes || '', status: 'iniciada',
    })
  },

  async moveTask(taskId, newStatus) {
    set(s => ({ tasks: { ...s.tasks, [taskId]: { ...s.tasks[taskId], status: newStatus } } }))
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
  },

  async updateTask(taskId, updates) {
    set(s => ({ tasks: { ...s.tasks, [taskId]: { ...s.tasks[taskId], ...updates } } }))
    const db = {}
    if (updates.type        !== undefined) db.type        = updates.type
    if (updates.description !== undefined) db.description = updates.description
    if (updates.priority    !== undefined) db.priority    = updates.priority
    if (updates.labels      !== undefined) db.labels      = updates.labels
    if (updates.notes       !== undefined) db.notes       = updates.notes
    if (updates.status      !== undefined) db.status      = updates.status
    await supabase.from('tasks').update(db).eq('id', taskId)
  },

  async deleteTask(taskId) {
    set(s => { const { [taskId]: _, ...tasks } = s.tasks; return { tasks } })
    await supabase.from('tasks').delete().eq('id', taskId)
  },

  async clearCompletedTasks(teamId) {
    const ids = Object.values(get().tasks)
      .filter(t => t.teamId === teamId && t.status === 'terminada')
      .map(t => t.id)
    set(s => ({ tasks: Object.fromEntries(Object.entries(s.tasks).filter(([, t]) => !(t.teamId === teamId && t.status === 'terminada'))) }))
    if (ids.length) await supabase.from('tasks').delete().in('id', ids)
  },

  // ── ETIQUETAS ───────────────────────────────────────────────────────────────
  async createLabel(name, color) {
    const id = `lbl-${Date.now()}`
    set(s => ({ labels: [...s.labels, { id, name, color }] }))
    await supabase.from('labels').insert({ id, name, color })
  },

  async deleteLabel(labelId) {
    const affected = Object.values(get().tasks).filter(t => t.labels.includes(labelId))
    set(s => ({
      labels: s.labels.filter(l => l.id !== labelId),
      tasks: Object.fromEntries(Object.entries(s.tasks).map(([id, t]) => [id, { ...t, labels: t.labels.filter(l => l !== labelId) }])),
    }))
    await supabase.from('labels').delete().eq('id', labelId)
    for (const t of affected) {
      await supabase.from('tasks').update({ labels: t.labels.filter(l => l !== labelId) }).eq('id', t.id)
    }
  },
}))

export default useVisiStore
