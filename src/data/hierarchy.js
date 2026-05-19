export const SERVICES = [
  { id: 'medicina',  label: 'Medicina',       color: '#1565C0', icon: '🏥' },
  { id: 'cirugia',   label: 'Cirugía',        color: '#00695C', icon: '🔪' },
  { id: 'uci',       label: 'UCI',            color: '#AD1457', icon: '❤️' },
  { id: 'uti',       label: 'UTI',            color: '#E65100', icon: '⚡' },
  { id: 'ucor',      label: 'U. Coronaria',   color: '#C62828', icon: '💓' },
  { id: 'trauma',    label: 'Traumatología',  color: '#4E342E', icon: '🦴' },
  { id: 'urologia',  label: 'Urología',       color: '#1B5E20', icon: '🫀' },
  { id: 'hosdom',    label: 'HosDom',         color: '#4527A0', icon: '🏠' },
]

export const TEAMS = {
  medicina: [
    { id: 'sector1', label: 'Sector 1' },
    { id: 'sector2', label: 'Sector 2' },
    { id: 'sector3', label: 'Sector 3' },
    { id: 'sector4', label: 'Sector 4' },
    { id: 'sector5', label: 'Sector 5' },
  ],
  cirugia: [
    { id: 'coloprocto',   label: 'Coloprocto' },
    { id: 'general',      label: 'General' },
    { id: 'vascular',     label: 'Vascular' },
    { id: 'plastica',     label: 'Plástica' },
    { id: 'neurocx',      label: 'NeuroCx' },
    { id: 'maxilofacial', label: 'Maxilofacial' },
  ],
  uci: [
    { id: 'uci_norte',     label: 'UCI Norte' },
    { id: 'uci_centrosur', label: 'UCI Centro Sur' },
  ],
  uti:      [{ id: 'uti_main',      label: 'UTI' }],
  ucor:     [{ id: 'ucor_main',     label: 'U. Coronaria' }],
  trauma:   [{ id: 'trauma_main',   label: 'Traumatología' }],
  urologia: [{ id: 'urologia_main', label: 'Urología' }],
  hosdom:   [{ id: 'hosdom_main',   label: 'HosDom' }],
}

export const TASK_TYPES = [
  { id: 'examenes',       label: 'Solicitud Exámenes',      color: 'bg-blue-100 text-blue-800' },
  { id: 'imagenes',       label: 'Solicitud Imágenes',      color: 'bg-purple-100 text-purple-800' },
  { id: 'interequipo',    label: 'Coordinación Interequipo', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'pabellon',       label: 'Pabellón',                color: 'bg-green-100 text-green-800' },
  { id: 'trabajo_social', label: 'Trabajo Social',          color: 'bg-orange-100 text-orange-800' },
  { id: 'otro',           label: 'Otro',                    color: 'bg-gray-100 text-gray-800' },
]

export const TASK_STATUSES = ['iniciada', 'en_proceso', 'terminada']

export const STATUS_META = {
  iniciada:   { label: 'Iniciada',   bg: 'bg-amber-50',  border: 'border-amber-300',  header: 'bg-amber-100',  dot: 'bg-amber-400' },
  en_proceso: { label: 'En Proceso', bg: 'bg-blue-50',   border: 'border-blue-300',   header: 'bg-blue-100',   dot: 'bg-blue-500' },
  terminada:  { label: 'Terminada',  bg: 'bg-green-50',  border: 'border-green-300',  header: 'bg-green-100',  dot: 'bg-green-500' },
}

export const LABEL_COLORS = [
  '#E8C547', '#8BC34A', '#26A69A', '#EF5350',
  '#AB47BC', '#4A7FC1', '#FF7043', '#78909C',
]
