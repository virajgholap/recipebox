import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

/**
 * Auth state for the whole app.
 *
 * `loading` starts true and only flips once we know whether there is a session,
 * so nothing renders a signed-out state for a frame before snapping to signed
 * in. When Supabase is not configured the provider settles immediately with no
 * user, and the auth UI hides itself rather than offering a button that cannot
 * work.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [googleEnabled, setGoogleEnabled] = useState(false)

  /**
   * Ask the project which providers are actually turned on.
   *
   * Offering a Google button on a project with no Google credentials produces
   * "Unsupported provider: provider is not enabled" — a dead end the user can
   * do nothing about. This makes the button self-configuring: hidden until
   * Google is enabled in the dashboard, visible the moment it is, with no
   * redeploy in between.
   */
  useEffect(() => {
    if (!isSupabaseConfigured) return

    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY

    fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
      .then((response) => (response.ok ? response.json() : null))
      .then((settings) => setGoogleEnabled(Boolean(settings?.external?.google)))
      .catch(() => setGoogleEnabled(false))
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signUpWithEmail = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    return { data, error }
  }, [])

  const signInWithEmail = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    return { data, error }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }, [])

  /** Sends the recovery email. Supabase puts a recovery token in the link. */
  const requestPasswordReset = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }, [])

  /**
   * Called after arriving from that email. The client has already exchanged
   * the token in the URL for a session, so this is an ordinary password change.
   */
  const updatePassword = useCallback(async (password) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error }
  }, [])

  /** Runs the security-definer function from migration 0003, then signs out. */
  const deleteAccount = useCallback(async () => {
    const { error } = await supabase.rpc('delete_own_account')
    if (error) return { error }
    await supabase.auth.signOut()
    return { error: null }
  }, [])

  const user = session?.user ?? null

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      isConfigured: isSupabaseConfigured,
      googleEnabled,
      // Google puts these in user_metadata; email signups have neither.
      displayName:
        user?.user_metadata?.full_name ??
        user?.user_metadata?.name ??
        user?.email?.split('@')[0] ??
        null,
      avatarUrl: user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? null,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      signOut,
      requestPasswordReset,
      updatePassword,
      deleteAccount,
    }),
    [
      session,
      user,
      loading,
      googleEnabled,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      signOut,
      requestPasswordReset,
      updatePassword,
      deleteAccount,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside an AuthProvider')
  return context
}

export default AuthContext
