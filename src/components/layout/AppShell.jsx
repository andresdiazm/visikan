import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopBar />
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 pb-8">
        <Outlet />
      </main>
    </div>
  )
}
