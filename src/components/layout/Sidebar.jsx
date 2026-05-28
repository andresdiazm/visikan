import { useNavigate, useLocation } from 'react-router-dom'
import { BedDouble, ChevronLeft, ChevronRight, LayoutGrid, UserPlus } from 'lucide-react'

const NAV = [
  { label: 'Inicio',    href: '/',            icon: LayoutGrid },
  { label: 'Sectores',  href: '/sectores',    icon: BedDouble  },
  { label: 'Usuarios',  href: '/admin/users', icon: UserPlus   },
]

export default function Sidebar({ open, onToggle, onClose }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  function handleNav(href) {
    navigate(href)
    onClose()   // cierra drawer en móvil al navegar
  }

  return (
    <>
      {/* Backdrop móvil */}
      {open && (
        <div
          className="fixed inset-0 top-14 bg-black/30 z-30 sm:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-14 bottom-0 left-0 z-40
        sm:relative sm:top-auto sm:bottom-auto sm:left-auto sm:z-auto
        bg-white border-r border-gray-200
        flex flex-col
        transition-[width,transform] duration-200 ease-in-out
        overflow-hidden shrink-0
        ${open
          ? 'w-44 translate-x-0'
          : '-translate-x-full sm:translate-x-0 sm:w-12'
        }
      `}>
        {/* Etiqueta sección */}
        <p className={`text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-4 mb-2 px-4 whitespace-nowrap transition-opacity ${open ? 'opacity-100' : 'sm:opacity-0'}`}>
          Gestión
        </p>

        <nav className="flex flex-col gap-0.5 flex-1">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = isActive(href)
            return (
              <button
                key={href}
                onClick={() => handleNav(href)}
                title={!open ? label : undefined}
                className={`flex items-center gap-3 py-2.5 w-full transition-colors
                  ${open ? 'px-4' : 'sm:justify-center sm:px-0 px-4'}
                  ${active
                    ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-500'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                  }`}
              >
                <Icon size={16} className={`shrink-0 ${active ? 'text-teal-600' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium whitespace-nowrap transition-opacity ${open ? 'opacity-100' : 'sm:opacity-0 sm:w-0'}`}>
                  {label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Botón colapsar — solo desktop */}
        <button
          onClick={onToggle}
          className="hidden sm:flex items-center justify-center h-9 border-t border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
          title={open ? 'Contraer menú' : 'Expandir menú'}
        >
          {open ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </aside>
    </>
  )
}
