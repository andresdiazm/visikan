import { useState } from 'react'
import { Shield, UserPlus, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { supabaseAdmin } from '../lib/supabaseAdmin'
import Button from '../components/ui/Button'

// ── Password Gate ────────────────────────────────────────────────────────────

function PasswordGate({ onUnlock }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabaseAdmin.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('Correo o contraseña incorrectos.')
    } else {
      onUnlock()
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-bay-blue/10 rounded-full p-4 mb-3">
            <Shield size={28} className="text-bay-blue" />
          </div>
          <h1 className="text-lg font-bold text-bay-blue">Acceso Restringido</h1>
          <p className="text-xs text-gray-500 text-center mt-1">
            Ingresa tus credenciales para gestionar usuarios
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Tu correo"
            required
            autoFocus
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
          />

          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle size={13} /> {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
            {loading ? 'Verificando…' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  )
}

// ── User Creation Form ───────────────────────────────────────────────────────

function UserForm() {
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd,         setShowPwd]         = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [result,          setResult]          = useState(null)

  async function handleCreate(e) {
    e.preventDefault()
    setResult(null)

    if (password !== confirmPassword) {
      setResult({ success: false, message: 'Las contraseñas no coinciden.' })
      return
    }
    if (password.length < 6) {
      setResult({ success: false, message: 'La contraseña debe tener al menos 6 caracteres.' })
      return
    }

    setLoading(true)
    const { error } = await supabaseAdmin.auth.signUp({ email, password })
    setLoading(false)

    if (error) {
      setResult({ success: false, message: error.message })
    } else {
      setResult({ success: true, message: `Usuario ${email} creado correctamente.` })
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-bay-blue flex items-center gap-2">
          <UserPlus size={20} />
          Crear usuario
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Crea cuentas de acceso para el personal del hospital.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@hospital.cl"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
            />
          </div>

          {result && (
            <div className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 border
              ${result.success
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
              }`}>
              {result.success
                ? <CheckCircle size={14} className="shrink-0 mt-0.5" />
                : <AlertCircle size={14} className="shrink-0 mt-0.5" />
              }
              {result.message}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
            <UserPlus size={15} />
            {loading ? 'Creando…' : 'Crear usuario'}
          </Button>
        </form>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUsers() {
  const [unlocked, setUnlocked] = useState(false)

  return (
    <div className="py-4">
      {unlocked
        ? <UserForm />
        : <PasswordGate onUnlock={() => setUnlocked(true)} />
      }
    </div>
  )
}
