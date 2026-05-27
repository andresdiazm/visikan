// ── Helpers para metadatos estructurados en el campo "notes" ─────────────────
// Formato: líneas prefijadas con "#clave:valor" al inicio de notes;
// el resto del texto son notas libres del usuario.

/**
 * Extrae metadatos y notas limpias desde el string raw de notes.
 * @param {string} notes
 * @returns {{ destino: string, fechaAlta: string, userNotes: string }}
 */
export function parseNotesMeta(notes = '') {
  let destino = '', fechaAlta = ''
  const kept = []
  for (const line of (notes || '').split('\n')) {
    if (line.startsWith('#destino:'))    destino   = line.slice('#destino:'.length)
    else if (line.startsWith('#fecha_alta:')) fechaAlta = line.slice('#fecha_alta:'.length)
    else kept.push(line)
  }
  return { destino, fechaAlta, userNotes: kept.join('\n').replace(/^\n+|\n+$/g, '') }
}

/**
 * Combina metadatos + notas del usuario en el string que se guarda en DB.
 */
export function buildNotesMeta(destino = '', fechaAlta = '', userNotes = '') {
  const parts = []
  if (destino)   parts.push(`#destino:${destino}`)
  if (fechaAlta) parts.push(`#fecha_alta:${fechaAlta}`)
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
