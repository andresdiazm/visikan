import { useNavigate, useLocation } from 'react-router-dom'
import { BedDouble, LayoutGrid, UserPlus } from 'lucide-react'

const NAV = [
  { label: 'Inicio',    href: '/',            icon: LayoutGrid },
  { label: 'Sectores',  href: '/sectores',    icon: BedDouble  },
  { label: 'Usuarios',  href: '/admin/users', icon: UserPlus   },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <aside className="w-44 shrink-0 bg-white border-r border-gray-200 flex flex-col pt-4 pb-8">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold px-4 mb-2">
        Gestión
      </p>
      <nav className="flex flex-col gap-0.5">
        {NAV.map(({ label, href, icon: Icon }) => (
          <button
            key={href}
            onClick={() => navigate(href)}
            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left ${
              isActive(href)
                ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-500'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            <Icon size={16} className={isActive(href) ? 'text-teal-600' : 'text-gray-400'} />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
