import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

/**
 * AuthPage
 *
 * One component, two routes: /login and /signup differ only by `mode`. Both
 * offer Google and email + password, because the two paths share every other
 * piece of layout and copy and splitting them would mean maintaining the same
 * form twice.
 */
export default function AuthPage({ mode = 'login' }) {
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const {
    user,
    loading,
    isConfigured,
    googleEnabled,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
  } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [busy, setBusy] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setNotice(null)

    if (password.length < 6) {
      setError('Password needs to be at least 6 characters.')
      return
    }

    setBusy(true)
    const { data, error: authError } = isSignup
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password)
    setBusy(false)

    if (authError) {
      setError(authError.message)
      return
    }

    // With email confirmation switched on, signUp returns a user but no
    // session — there is nothing to navigate to yet.
    if (isSignup && !data?.session) {
      setNotice('Check your email for a confirmation link, then sign in.')
      return
    }

    navigate('/', { replace: true })
  }

  async function handleGoogle() {
    setError(null)
    setBusy(true)
    const { error: oauthError } = await signInWithGoogle()

    if (oauthError) {
      // Supabase says "Unsupported provider: provider is not enabled", which
      // is accurate and useless to whoever is looking at it. It only ever
      // means the project has no Google credentials configured.
      setError(
        /provider is not enabled|unsupported provider/i.test(oauthError.message)
          ? 'Google sign-in is not set up on this project yet. Use email and password below.'
          : oauthError.message,
      )
      setBusy(false)
    }
    // On success the browser leaves for Google, so there is nothing to reset.
  }

  return (
    <main className="auth-page">
      <Card padding="md" className="auth-card">
        <h1 className="auth-card__title">{isSignup ? 'Create an account' : 'Welcome back'}</h1>
        <p className="auth-card__subtitle">
          {isSignup
            ? 'Your cook progress follows you to any device you sign in on.'
            : 'Sign in to pick up wherever you left off.'}
        </p>

        {!isConfigured ? (
          <p className="auth-card__error" role="alert">
            This build has no Supabase credentials, so accounts are switched off. Add
            <code> VITE_SUPABASE_URL </code> and <code> VITE_SUPABASE_ANON_KEY </code> and reload.
          </p>
        ) : (
          <>
            {/* Only rendered once the project actually has Google credentials.
                Showing it otherwise gives the user a button that cannot work
                and an error they cannot act on. */}
            {googleEnabled ? (
              <>
                <Button
                  variant="ghost"
                  fullWidth
                  disabled={busy}
                  onClick={handleGoogle}
                  className="auth-google"
                >
                  <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
                    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
                    <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
                    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
                  </svg>
                  Continue with Google
                </Button>

                <div className="auth-divider">
                  <span>or</span>
                </div>
              </>
            ) : null}

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>

              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={isSignup ? 'At least 6 characters' : '••••••••'}
                />
              </label>

              {error ? (
                <p className="auth-card__error" role="alert">
                  {error}
                </p>
              ) : null}

              {notice ? (
                <p className="auth-card__notice" role="status">
                  {notice}
                </p>
              ) : null}

              <Button type="submit" fullWidth disabled={busy}>
                {busy ? 'One moment…' : isSignup ? 'Create account' : 'Sign in'}
              </Button>
            </form>

            {!isSignup ? (
              <p className="auth-card__switch">
                <Link to="/forgot-password">Forgot your password?</Link>
              </p>
            ) : null}
          </>
        )}

        <p className="auth-card__switch">
          {isSignup ? (
            <>
              Already have an account? <Link to="/login">Sign in</Link>
            </>
          ) : (
            <>
              New here? <Link to="/signup">Create an account</Link>
            </>
          )}
        </p>

        <p className="auth-card__skip">
          <Link to="/">Keep browsing without an account</Link>
        </p>
      </Card>
    </main>
  )
}
