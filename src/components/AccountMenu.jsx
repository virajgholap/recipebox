import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from './Button'
import { useAuth } from '../context/AuthContext'
import './AccountMenu.css'

/**
 * AccountMenu
 *
 * Signed out: a Sign in link. Signed in: an avatar that opens a small menu.
 * When Supabase is not configured it renders nothing at all rather than a
 * button that leads to a dead end.
 */
export default function AccountMenu() {
  const { user, loading, isConfigured, displayName, avatarUrl, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return undefined

    function handlePointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false)
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  if (!isConfigured) return null
  if (loading) return <span className="account-menu__placeholder" aria-hidden="true" />

  if (!user) {
    return (
      <Link className="account-menu__signin" to="/login">
        Sign in
      </Link>
    )
  }

  const initial = (displayName ?? '?').charAt(0).toUpperCase()

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="account-menu" ref={wrapperRef}>
      <button
        type="button"
        className="account-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account: ${displayName}`}
        onClick={() => setOpen((value) => !value)}
      >
        {avatarUrl ? (
          <img className="account-menu__avatar" src={avatarUrl} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span className="account-menu__initial" aria-hidden="true">
            {initial}
          </span>
        )}
      </button>

      {open ? (
        <div className="account-menu__panel" role="menu">
          <div className="account-menu__identity">
            <strong>{displayName}</strong>
            <span>{user.email}</span>
          </div>
          <Button variant="ghost" size="sm" fullWidth onClick={handleSignOut} role="menuitem">
            Sign out
          </Button>
        </div>
      ) : null}
    </div>
  )
}
