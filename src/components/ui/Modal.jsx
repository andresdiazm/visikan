import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ title, onClose, children, size = 'md' }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center sm:p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`bg-white sm:rounded-2xl shadow-xl w-full ${sizes[size]} flex flex-col
        h-[100dvh] sm:h-auto sm:max-h-[90vh] mt-auto sm:mt-0`}>
        {/* Header siempre visible */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3 sm:px-6 sm:py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 truncate pr-2">{title}</h2>
          <button
            onClick={onClose}
            className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
