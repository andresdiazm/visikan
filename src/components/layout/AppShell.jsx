import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Activity } from 'lucide-react'
import TopBar from './TopBar'
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

  useEffect(() => { init() }, [])   // carga datos de Supabase al montar

  if (!loaded) return <LoadingScreen />

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopBar />
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 pb-8">
        <Outlet />
      </main>
    </div>
  )
}
