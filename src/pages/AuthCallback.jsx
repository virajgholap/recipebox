import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthCallback.css'

/**
 * Where Google sends the browser back to.
 *
 * The Supabase client is configured with `detectSessionInUrl`, so it consumes
 * the tokens from the URL by itself and the auth listener fires. All this route
 * has to do is wait for that and then get out of the way.
 *
 * The timeout is the failure case: a stale or tampered callback URL that never
 * produces a session would otherwise spin forever.
 */
export default function AuthCallback() {
  const { user, loading } = useAuth()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 8000)
    return () => clearTimeout(timer)
  }, [])

  if (user) return <Navigate to="/" replace />
  if (timedOut && !loading) return <Navigate to="/login?error=callback" replace />

  return (
    <main className="auth-callback">
      <span className="auth-callback__spinner" aria-hidden="true" />
      <p>Signing you in…</p>
    </main>
  )
}
