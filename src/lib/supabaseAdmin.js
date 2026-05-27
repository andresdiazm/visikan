import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cliente independiente para operaciones de admin (gate + creación de usuarios)
// persistSession: false → no afecta la sesión principal de la app
export const supabaseAdmin = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})
