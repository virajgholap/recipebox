import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client.
 *
 * Deliberately returns `null` rather than throwing when the environment
 * variables are missing. A fresh clone with no .env should still run: the app
 * falls back to the bundled seed data and hides the auth UI, instead of showing
 * a white screen and a console error. `isSupabaseConfigured` is how the rest of
 * the app asks which mode it is in.
 *
 * The anon key is meant to be public — it identifies the project, it does not
 * grant access. Row-level security in supabase/migrations/0001_init.sql is what
 * actually protects the data. Never put the service_role key in this file or
 * anywhere else under src/.
 */

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.info(
    '[recipe-box] No Supabase credentials found — running on bundled seed data. ' +
      'Copy .env.example to .env.local and fill it in to enable accounts and sync.',
  )
}

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export default supabase
