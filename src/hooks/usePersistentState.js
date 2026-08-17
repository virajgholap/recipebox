import { useEffect, useState } from 'react'

/**
 * useState that survives a reload.
 *
 * Cook progress is the one thing in this app that genuinely hurts to lose —
 * you check off six ingredients, your phone locks, and you are back to
 * guessing. Everything else can stay in memory.
 *
 * Storage failures are swallowed: private browsing and a full quota should
 * degrade to a normal useState, not break the page.
 */
export default function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored === null ? initialValue : JSON.parse(stored)
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* no-op — see above */
    }
  }, [key, value])

  return [value, setValue]
}
