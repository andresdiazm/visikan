import { useNavigate, useLocation } from 'react-router-dom'
import { Activity, ClipboardList, LogOut, Users } from 'lucide-react'

const NAV = [
  { label: 'Altas y traslados', href: '/altas',          icon: LogOut        },
  { label: 'Procedimientos',    href: '/procedimientos', icon: ClipboardList },
  { label: 'Sociales',          href: '/sociales',       icon: Users         },
]

export default function TopBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Ruta activa: coincidencia exacta para /, prefijo para el resto
  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="bg-bay-blue text-white shadow-md z-10 relative">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
        >
          <div className="bg-teal rounded-lg p-1.5">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-display font-semibold text-lg tracking-wide">VISIKAN</span>
        </button>

        <span className="text-white/30 hidden sm:block">|</span>

        {/* Navegación */}
        <nav className="flex items-center gap-1">
          {NAV.map(({ label, href, icon: Icon }) => (
            <button
              key={href}
              onClick={() => navigate(href)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(href)
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>

        {/* Subtítulo hospital */}
        <span className="ml-auto text-white/40 text-sm hidden md:block">Hospital San José</span>
      </div>
    </header>
  )
}
