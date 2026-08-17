import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import './AccountPage.css'

/**
 * Account settings.
 *
 * Exists mainly so the Privacy Policy is true: it promises you can delete your
 * data from inside the app, and a promise a product does not keep is worse than
 * one it never made.
 *
 * Deletion asks you to type DELETE rather than clicking a red button, because
 * it removes your recipes and progress with no undo and no backup to restore
 * from.
 */
export default function AccountPage() {
  const { user, loading, displayName, deleteAccount } = useAuth()
  const navigate = useNavigate()

  const [confirmText, setConfirmText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  if (!loading && !user) return <Navigate to="/login" replace />
  if (loading) return null

  async function handleDelete() {
    setBusy(true)
    setError(null)

    const { error: deleteError } = await deleteAccount()

    if (deleteError) {
      setBusy(false)
      setError(
        /function|does not exist/i.test(deleteError.message)
          ? 'Account deletion is not set up on this project yet — run supabase/migrations/0003_account_deletion.sql.'
          : deleteError.message,
      )
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <main className="layout account">
      <h1 className="account__title">Account</h1>

      <Card padding="md" className="account__card">
        <h2 className="account__heading">Signed in as</h2>
        <p className="account__identity">
          <strong>{displayName}</strong>
          <span>{user.email}</span>
        </p>
      </Card>

      <Card padding="md" className="account__card account__card--danger">
        <h2 className="account__heading">Delete account</h2>
        <p className="account__body">
          This removes your profile, every recipe you have saved, and all of your cook progress.
          It cannot be undone and there is no backup to restore from.
        </p>

        <label className="account__confirm">
          <span>
            Type <code>DELETE</code> to confirm
          </span>
          <input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="DELETE"
            autoComplete="off"
          />
        </label>

        {error ? (
          <p className="account__error" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          variant="ghost"
          className="account__delete"
          disabled={confirmText !== 'DELETE' || busy}
          onClick={handleDelete}
        >
          {busy ? 'Deleting…' : 'Permanently delete my account'}
        </Button>
      </Card>
    </main>
  )
}
