import { useNavigate } from 'react-router-dom'
import { Activity } from 'lucide-react'

export default function TopBar() {
  const navigate = useNavigate()
  return (
    <header className="bg-bay-blue text-white shadow-md z-10 relative">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="bg-teal rounded-lg p-1.5">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-display font-semibold text-lg tracking-wide">VISIKAN</span>
        </button>
        <span className="text-white/40 text-sm hidden sm:block">·</span>
        <span className="text-white/60 text-sm hidden sm:block">Hospital San José</span>
      </div>
    </header>
  )
}
