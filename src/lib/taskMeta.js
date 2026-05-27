// ── Helpers para metadatos estructurados en el campo "notes" ─────────────────
// Formato: líneas prefijadas con "#clave:valor" al inicio de notes;
// el resto del texto son notas libres del usuario.

/**
 * Extrae metadatos y notas limpias desde el string raw de notes.
 * @returns {{ destino, fechaAlta, socialEstado, userNotes }}
 */
export function parseNotesMeta(notes = '') {
  let destino = '', fechaAlta = '', socialEstado = ''
  const kept = []
  for (const line of (notes || '').split('\n')) {
    if      (line.startsWith('#destino:'))       destino      = line.slice('#destino:'.length)
    else if (line.startsWith('#fecha_alta:'))    fechaAlta    = line.slice('#fecha_alta:'.length)
    else if (line.startsWith('#social_estado:')) socialEstado = line.slice('#social_estado:'.length)
    else kept.push(line)
  }
  return { destino, fechaAlta, socialEstado, userNotes: kept.join('\n').replace(/^\n+|\n+$/g, '') }
}

/**
 * Combina metadatos + notas del usuario en el string que se guarda en DB.
 * @param {string} destino        – serviceId destino (solicitud_traslado)
 * @param {string} fechaAlta      – YYYY-MM-DD (alta_probable)
 * @param {string} userNotes      – texto libre del usuario
 * @param {string} socialEstado   – 'con_alta' | 'sin_alta' (trabajo_social)
 */
export function buildNotesMeta(destino = '', fechaAlta = '', userNotes = '', socialEstado = '') {
  const parts = []
  if (destino)      parts.push(`#destino:${destino}`)
  if (fechaAlta)    parts.push(`#fecha_alta:${fechaAlta}`)
  if (socialEstado) parts.push(`#social_estado:${socialEstado}`)
  const clean = (userNotes || '').trim()
  if (clean) parts.push(clean)
  return parts.join('\n')
}

/**
 * Formatea una fecha ISO "YYYY-MM-DD" como "DD/MM/YYYY".
 */
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
