import { useEffect } from 'react'
import usePersistentState from '../hooks/usePersistentState'
import './ThemeToggle.css'

function preferredTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * ThemeToggle
 *
 * Starts from the system preference, remembers an explicit choice, and writes
 * `data-theme` on the root element. Every colour in the app is a token, so this
 * is the entire dark mode implementation.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = usePersistentState('recipe-box:theme', preferredTheme())

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        {isDark ? (
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" strokeLinejoin="round" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" strokeLinecap="round" />
          </>
        )}
      </svg>
    </button>
  )
}
