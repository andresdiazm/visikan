// ── Helpers para metadatos estructurados en el campo "notes" ─────────────────
// Formato: líneas prefijadas con "#clave:valor" al inicio de notes;
// el resto del texto son notas libres del usuario.

/**
 * Extrae metadatos y notas limpias desde el string raw de notes.
 * @returns {{ destino, fechaAlta, socialEstado, prestacionTipo, userNotes }}
 */
export function parseNotesMeta(notes = '') {
  let destino = '', fechaAlta = '', socialEstado = '', prestacionTipo = ''
  const kept = []
  for (const line of (notes || '').split('\n')) {
    if      (line.startsWith('#destino:'))       destino       = line.slice('#destino:'.length)
    else if (line.startsWith('#fecha_alta:'))    fechaAlta     = line.slice('#fecha_alta:'.length)
    else if (line.startsWith('#social_estado:')) socialEstado  = line.slice('#social_estado:'.length)
    else if (line.startsWith('#prestacion:'))    prestacionTipo = line.slice('#prestacion:'.length)
    else kept.push(line)
  }
  return { destino, fechaAlta, socialEstado, prestacionTipo, userNotes: kept.join('\n').replace(/^\n+|\n+$/g, '') }
}

/**
 * Combina metadatos + notas del usuario en el string que se guarda en DB.
 */
export function buildNotesMeta(destino = '', fechaAlta = '', userNotes = '', socialEstado = '', prestacionTipo = '') {
  const parts = []
  if (destino)        parts.push(`#destino:${destino}`)
  if (fechaAlta)      parts.push(`#fecha_alta:${fechaAlta}`)
  if (socialEstado)   parts.push(`#social_estado:${socialEstado}`)
  if (prestacionTipo) parts.push(`#prestacion:${prestacionTipo}`)
  const clean = (userNotes || '').trim()
  if (clean) parts.push(clean)
  return parts.join('\n')
}

/** Formatea fecha ISO "YYYY-MM-DD" → "DD/MM/YYYY" */
export function formatFechaAlta(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

/** Label y color para el estado de social */
export const SOCIAL_ESTADO_META = {
  con_alta: { label: 'Con alta médica',  color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  sin_alta: { label: 'Sin alta médica',  color: 'bg-amber-100 text-amber-800 border-amber-200' },
}

/**
 * Devuelve el subtipo de prestación de una tarea (para tipos legacy y nuevo).
 * @param {{ type: string, notes: string }} task
 * @returns {string}  'examenes' | 'imagenes' | 'procedimiento' | ''
 */
export function getPrestacionTipo(task) {
  if (task.type === 'solicitud_prestacion') {
    return parseNotesMeta(task.notes).prestacionTipo || ''
  }
  // Tipos legacy mapean directo
  if (task.type === 'examenes')    return 'examenes'
  if (task.type === 'imagenes')    return 'imagenes'
  if (task.type === 'procedimiento') return 'procedimiento'
  return ''
}

/** IDs que componen el universo de "prestaciones" (nuevo + legacy) */
export const PRESTACION_TYPE_IDS = new Set(['solicitud_prestacion', 'examenes', 'imagenes', 'procedimiento'])
