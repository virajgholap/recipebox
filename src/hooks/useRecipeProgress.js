import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

/**
 * Cook progress for one recipe: chosen yield, ticked ingredients, finished steps.
 *
 * Signed out, this is localStorage — the same behaviour the app had before
 * accounts existed. Signed in, Supabase is the source of truth and localStorage
 * becomes a cache so the panel paints instantly instead of waiting on a round
 * trip.
 *
 * The first time you sign in, whatever you had checked off locally gets pushed
 * up rather than discarded. Losing your place because you finally made an
 * account would be a strange reward for making one.
 *
 * Mount this keyed on recipe.id — the initial read happens once.
 */
export default function useRecipeProgress(recipe) {
  const { user } = useAuth()
  const storageKey = `recipe-box:progress:${recipe.id}`

  const defaults = {
    servings: recipe.servings,
    checked: [],
    done: [],
  }

  const [progress, setProgress] = useState(() => {
    try {
      const stored = window.localStorage.getItem(storageKey)
      return stored === null ? defaults : { ...defaults, ...JSON.parse(stored) }
    } catch {
      return defaults
    }
  })

  const [syncing, setSyncing] = useState(false)
  const saveTimer = useRef(null)
  // Suppresses the write-back that would otherwise fire from setting state
  // with rows we just read out of the database.
  const hydrating = useRef(false)

  // Declared before the effects that call it. It used to sit below them, which
  // worked only because effect bodies run after render — a temporal dead zone
  // waiting for the first person to move code around.
  const persist = useCallback(
    async (next) => {
      if (!user) return

      const { error } = await supabase.from('recipe_progress').upsert(
        {
          user_id: user.id,
          recipe_id: recipe.id,
          servings: next.servings,
          checked_ingredients: next.checked,
          completed_steps: next.done,
        },
        { onConflict: 'user_id,recipe_id' },
      )

      if (error) console.warn('[recipe-box] Could not save progress:', error.message)
    },
    [user, recipe.id],
  )

  // Pull the server copy once we know who the user is.
  useEffect(() => {
    if (!user) return undefined

    let active = true
    setSyncing(true)

    supabase
      .from('recipe_progress')
      .select('servings, checked_ingredients, completed_steps')
      .eq('user_id', user.id)
      .eq('recipe_id', recipe.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return

        if (error) {
          console.warn('[recipe-box] Could not load progress:', error.message)
          setSyncing(false)
          return
        }

        if (data) {
          hydrating.current = true
          setProgress({
            servings: data.servings,
            checked: data.checked_ingredients ?? [],
            done: data.completed_steps ?? [],
          })
        } else if (progress.checked.length || progress.done.length || progress.servings !== recipe.servings) {
          // Nothing on the server but something locally — carry it up.
          void persist(progress)
        }

        setSyncing(false)
      })

    return () => {
      active = false
    }
    // Intentionally keyed only on the user and recipe: this is a one-time
    // hydrate, not a subscription to local edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, recipe.id])

  // Cache locally on every change; debounce the network write so ticking six
  // ingredients in a row is one request rather than six.
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(progress))
    } catch {
      /* private browsing, quota — not worth breaking the page over */
    }

    if (!user) return undefined

    if (hydrating.current) {
      hydrating.current = false
      return undefined
    }

    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => void persist(progress), 600)

    return () => clearTimeout(saveTimer.current)
  }, [progress, storageKey, user, persist])

  return [progress, setProgress, { syncing, synced: Boolean(user) }]
}
