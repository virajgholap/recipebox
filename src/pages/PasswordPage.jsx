import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

/**
 * Forgot-password and set-new-password, the two halves of account recovery.
 *
 * Without these, one forgotten password is a permanent lockout — the only
 * escape would be creating a second account, abandoning the first.
 */

export function ForgotPasswordPage() {
  const { isConfigured, requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setBusy(true)

    const { error: resetError } = await requestPasswordReset(email.trim())

    setBusy(false)

    // Deliberately shown whether or not the address exists. Saying "no such
    // account" would let anyone test which emails are registered here.
    if (resetError && !/rate/i.test(resetError.message)) setError(resetError.message)
    setSent(true)
  }

  return (
    <main className="auth-page">
      <Card padding="md" className="auth-card">
        <h1 className="auth-card__title">Reset your password</h1>

        {!isConfigured ? (
          <p className="auth-card__error" role="alert">
            Accounts are not configured in this deployment.
          </p>
        ) : sent ? (
          <>
            <p className="auth-card__notice" role="status">
              If an account exists for {email}, a reset link is on its way. The link expires after
              an hour.
            </p>
            <p className="auth-card__switch">
              <Link to="/login">Back to sign in</Link>
            </p>
          </>
        ) : (
          <>
            <p className="auth-card__subtitle">
              Enter the address you signed up with and we will send you a link to set a new
              password.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>

              {error ? (
                <p className="auth-card__error" role="alert">
                  {error}
                </p>
              ) : null}

              <Button type="submit" fullWidth disabled={busy || !email.trim()}>
                {busy ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>

            <p className="auth-card__switch">
              Remembered it? <Link to="/login">Sign in</Link>
            </p>
          </>
        )}
      </Card>
    </main>
  )
}

export function ResetPasswordPage() {
  const { isConfigured, updatePassword } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password needs to be at least 6 characters.')
      return
    }

    if (password !== confirm) {
      setError('Those two passwords do not match.')
      return
    }

    setBusy(true)
    const { error: updateError } = await updatePassword(password)
    setBusy(false)

    if (updateError) {
      // The commonest cause is an expired or already-used recovery link.
      setError(
        /session|jwt|token/i.test(updateError.message)
          ? 'That reset link has expired or was already used. Request a new one.'
          : updateError.message,
      )
      return
    }

    setDone(true)
    setTimeout(() => navigate('/', { replace: true }), 1200)
  }

  return (
    <main className="auth-page">
      <Card padding="md" className="auth-card">
        <h1 className="auth-card__title">Choose a new password</h1>

        {!isConfigured ? (
          <p className="auth-card__error" role="alert">
            Accounts are not configured in this deployment.
          </p>
        ) : done ? (
          <p className="auth-card__notice" role="status">
            Password updated. Taking you back to your recipes…
          </p>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>New password</span>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                autoFocus
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
              />
            </label>

            <label className="auth-field">
              <span>Confirm password</span>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
            </label>

            {error ? (
              <p className="auth-card__error" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" fullWidth disabled={busy}>
              {busy ? 'Saving…' : 'Set new password'}
            </Button>
          </form>
        )}

        <p className="auth-card__switch">
          <Link to="/forgot-password">Need a new link?</Link>
        </p>
      </Card>
    </main>
  )
}
