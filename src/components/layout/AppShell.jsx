import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Activity } from 'lucide-react'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import useVisiStore from '../../store/useVisiStore'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="bg-bay-blue rounded-2xl p-4 animate-pulse">
        <Activity size={32} className="text-white" />
      </div>
      <p className="text-gray-500 text-sm">Conectando con el servidor…</p>
    </div>
  )
}

export default function AppShell() {
  const loaded = useVisiStore(s => s.loaded)
  const init   = useVisiStore(s => s.init)

  // En desktop por defecto abierto; en móvil cerrado
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 640)

  useEffect(() => { init() }, [])

  if (!loaded) return <LoadingScreen />

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopBar onToggleSidebar={() => setSidebarOpen(v => !v)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(v => !v)}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto px-5 pt-4 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
