import { useState, useEffect, useCallback } from 'react'
import {
  Shield, UserPlus, CheckCircle, AlertCircle,
  Eye, EyeOff, Users, Trash2, RefreshCw, Terminal,
} from 'lucide-react'
import { supabaseAdmin } from '../lib/supabaseAdmin'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

// ── SQL de migración ──────────────────────────────────────────────────────────
const SETUP_SQL = `create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  email        text unique not null,
  display_name text,
  is_active    boolean default true,
  created_at   timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "allow_all" on public.profiles for all using (true);
grant all on public.profiles to anon, authenticated;`

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function initials(profile) {
  if (profile.display_name) {
    return profile.display_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }
  return profile.email.slice(0, 2).toUpperCase()
}

// ── Password Gate ─────────────────────────────────────────────────────────────
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
          />
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
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

// ── Modal: Crear usuario ──────────────────────────────────────────────────────
function CreateUserModal({ onClose, onCreated }) {
  const [displayName,     setDisplayName]     = useState('')
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd,         setShowPwd]         = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState('')

  async function handleCreate(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)

    // 1. Crear en Auth
    const { error: authError } = await supabaseAdmin.auth.signUp({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // 2. Registrar en tabla profiles
    const { error: dbError } = await supabase
      .from('profiles')
      .insert({ email, display_name: displayName.trim() || null })

    setLoading(false)

    if (dbError) {
      setError(`Usuario creado en Auth pero no en la tabla profiles: ${dbError.message}`)
      return
    }

    onCreated()
    onClose()
  }

  const footer = (
    <div className="flex gap-2">
      <Button type="submit" form="create-user-form" variant="primary" className="flex-1" disabled={loading}>
        <UserPlus size={14} />
        {loading ? 'Creando…' : 'Crear usuario'}
      </Button>
      <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
    </div>
  )

  return (
    <Modal title="Nuevo usuario" onClose={onClose} footer={footer} size="sm">
      <form id="create-user-form" onSubmit={handleCreate} className="flex flex-col gap-4">

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Nombre <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Ej: Dr. García"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="usuario@hospital.cl"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Contraseña <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
            />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Confirmar contraseña <span className="text-red-500">*</span>
          </label>
          <input
            type={showPwd ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Repite la contraseña"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 text-xs rounded-lg px-3 py-2 border bg-red-50 border-red-200 text-red-700">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}
      </form>
    </Modal>
  )
}

// ── Panel principal de usuarios ───────────────────────────────────────────────
function UsersPanel() {
  const [profiles,     setProfiles]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [tableError,   setTableError]   = useState(false)
  const [showCreate,   setShowCreate]   = useState(false)
  const [showSQL,      setShowSQL]      = useState(false)
  const [deletingId,   setDeletingId]   = useState(null)
  const [successMsg,   setSuccessMsg]   = useState('')

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    setLoading(false)

    if (error) {
      // Tabla no existe o sin acceso
      setTableError(true)
    } else {
      setProfiles(data || [])
      setTableError(false)
    }
  }, [])

  useEffect(() => { fetchProfiles() }, [fetchProfiles])

  async function handleDelete(profile) {
    if (!window.confirm(`¿Eliminar a ${profile.display_name || profile.email} del listado?\n\nNota: la cuenta de Auth no se eliminará.`)) return
    setDeletingId(profile.id)
    await supabase.from('profiles').delete().eq('id', profile.id)
    setDeletingId(null)
    fetchProfiles()
  }

  function handleCreated() {
    fetchProfiles()
    setSuccessMsg('Usuario creado correctamente.')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // ── Tabla no configurada ──────────────────────────────────────────────────
  if (tableError) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-bay-blue flex items-center gap-2">
              <Users size={20} /> Usuarios
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Gestión de acceso al sistema</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <Terminal size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">Configuración requerida</p>
              <p className="text-xs text-amber-700 mt-1">
                La tabla <code className="bg-amber-100 px-1 rounded font-mono">profiles</code> no existe aún.
                Ejecuta el siguiente SQL en el Editor SQL de Supabase (una sola vez):
              </p>
            </div>
          </div>
          <pre className="bg-white border border-amber-200 rounded-lg p-4 text-xs font-mono text-gray-700 overflow-x-auto select-all whitespace-pre-wrap">
            {SETUP_SQL}
          </pre>
          <div className="flex gap-2 mt-4">
            <Button variant="primary" size="sm" onClick={fetchProfiles}>
              <RefreshCw size={13} /> Ya ejecuté el SQL
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Vista principal ───────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl">

      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-bay-blue flex items-center gap-2">
            <Users size={20} /> Usuarios
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {loading ? 'Cargando…' : `${profiles.length} usuario${profiles.length !== 1 ? 's' : ''} registrado${profiles.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <UserPlus size={15} /> Nuevo usuario
        </Button>
      </div>

      {/* Mensaje de éxito */}
      {successMsg && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-4">
          <CheckCircle size={15} /> {successMsg}
        </div>
      )}

      {/* Lista */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <RefreshCw size={18} className="animate-spin mr-2" /> Cargando usuarios…
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users size={32} className="mb-3 opacity-30" />
            <p className="text-sm">Sin usuarios registrados.</p>
            <p className="text-xs mt-1">Crea el primero con el botón "Nuevo usuario".</p>
          </div>
        ) : (
          <>
            {/* Encabezado columnas */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-b border-gray-100">
              <span className="w-8 shrink-0" />
              <span className="flex-1 text-[10px] uppercase tracking-wide text-gray-400 font-medium">Usuario</span>
              <span className="w-32 text-[10px] uppercase tracking-wide text-gray-400 font-medium shrink-0">Creado</span>
              <span className="w-6 shrink-0" />
            </div>

            {/* Filas */}
            {profiles.map(profile => (
              <div key={profile.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group">

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-bay-blue/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-bay-blue">{initials(profile)}</span>
                </div>

                {/* Nombre + email */}
                <div className="flex-1 min-w-0">
                  {profile.display_name && (
                    <p className="text-sm font-medium text-gray-800 truncate">{profile.display_name}</p>
                  )}
                  <p className={`truncate ${profile.display_name ? 'text-xs text-gray-500' : 'text-sm text-gray-800 font-medium'}`}>
                    {profile.email}
                  </p>
                </div>

                {/* Fecha */}
                <span className="w-32 text-xs text-gray-400 shrink-0">{formatDate(profile.created_at)}</span>

                {/* Eliminar */}
                <button
                  onClick={() => handleDelete(profile)}
                  disabled={deletingId === profile.id}
                  className="w-6 text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar del listado"
                >
                  {deletingId === profile.id
                    ? <RefreshCw size={13} className="animate-spin" />
                    : <Trash2 size={13} />
                  }
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Nota sobre eliminación */}
      {profiles.length > 0 && (
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          El botón elimina el registro del listado. Para revocar acceso completo, desactiva la cuenta en el panel de Supabase Auth.
        </p>
      )}

      {/* Modal crear */}
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [unlocked, setUnlocked] = useState(false)

  return (
    <div className="py-4">
      {unlocked
        ? <UsersPanel />
        : <PasswordGate onUnlock={() => setUnlocked(true)} />
      }
    </div>
  )
}
