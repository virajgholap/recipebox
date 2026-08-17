import { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from './Modal'
import Button from './Button'
import Badge from './Badge'
import { useAuth } from '../context/AuthContext'
import { detectSource, hueFromUrl, saveUserRecipe } from '../lib/userRecipes'
import { CUISINE_OPTIONS } from '../lib/recipes'
import './AddRecipeDialog.css'

/**
 * AddRecipeDialog
 *
 * Paste a link, see what was actually pulled out of it, then decide.
 *
 * The preview step is the point. Extraction is unreliable by nature — a food
 * blog with JSON-LD gives real ingredients and steps, while an Instagram reel
 * gives a title and nothing else — so the dialog states which of the two it
 * got instead of silently saving something thin and letting you discover it
 * later. Everything stays editable before saving.
 */

const STEPS = { INPUT: 'input', PREVIEW: 'preview' }

export default function AddRecipeDialog({ open, onClose, onSaved }) {
  const { user } = useAuth()

  const [stage, setStage] = useState(STEPS.INPUT)
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [extraction, setExtraction] = useState(null)
  const [draft, setDraft] = useState(null)

  function reset() {
    setStage(STEPS.INPUT)
    setUrl('')
    setBusy(false)
    setError(null)
    setExtraction(null)
    setDraft(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleExtract(event) {
    event.preventDefault()
    setError(null)
    setBusy(true)

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      const payload = await response.json()

      if (!response.ok) {
        setError(payload.error ?? 'Could not read that page.')
        setBusy(false)
        return
      }

      const source = detectSource(url)

      setExtraction(payload.extraction)
      setDraft({
        name: payload.recipe.name || 'Untitled recipe',
        blurb: payload.recipe.blurb ?? '',
        cuisine: 'other',
        source,
        sourceUrl: payload.recipe.sourceUrl,
        imageUrl: payload.recipe.imageUrl ?? null,
        cookTimeMinutes: payload.recipe.cookTimeMinutes ?? 30,
        servings: payload.recipe.servings ?? 4,
        hue: hueFromUrl(payload.recipe.sourceUrl),
        tags: [],
        onePan: false,
        makeAhead: false,
        ingredients: payload.recipe.ingredients ?? [],
        steps: payload.recipe.steps ?? [],
      })
      setStage(STEPS.PREVIEW)
    } catch (fetchError) {
      // In `npm run dev` there is no /api route — Vite serves the app only.
      setError(
        fetchError.message.includes('JSON')
          ? 'The extractor is not running. It deploys with the app on Vercel; locally, use `vercel dev`.'
          : `Something went wrong: ${fetchError.message}`,
      )
    }

    setBusy(false)
  }

  async function handleSave() {
    setBusy(true)
    setError(null)

    const { recipe, error: saveError } = await saveUserRecipe(user.id, draft)

    setBusy(false)

    if (saveError) {
      setError(saveError.message)
      return
    }

    onSaved?.(recipe)
    handleClose()
  }

  function patch(changes) {
    setDraft((current) => ({ ...current, ...changes }))
  }

  if (!open) return null

  return (
    <Modal open onClose={handleClose} labelledBy="add-recipe-title">
      <div className="add-recipe">
        <header className="add-recipe__head">
          <h2 className="add-recipe__title" id="add-recipe-title">
            {stage === STEPS.INPUT ? 'Add a recipe' : 'Check this over'}
          </h2>
          <button type="button" className="add-recipe__close" aria-label="Close" onClick={handleClose}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        {!user ? (
          <div className="add-recipe__body">
            <p className="add-recipe__note">
              You need an account to save recipes — they are stored against your profile so they
              follow you between devices.
            </p>
            <Link className="add-recipe__signin" to="/login" onClick={handleClose}>
              Sign in or create an account
            </Link>
          </div>
        ) : stage === STEPS.INPUT ? (
          <form className="add-recipe__body" onSubmit={handleExtract}>
            <label className="add-recipe__field">
              <span>Recipe link</span>
              <input
                type="url"
                required
                autoFocus
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://smittenkitchen.com/…"
              />
            </label>

            <p className="add-recipe__hint">
              Food blogs give the best results — most publish structured recipe data, so ingredients
              and steps come through intact. Instagram, TikTok, and YouTube links save the title and
              a link back; the method is inside the video and there is no honest way to read it.
            </p>

            {error ? (
              <p className="add-recipe__error" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" fullWidth disabled={busy || !url.trim()}>
              {busy ? 'Reading the page…' : 'Fetch recipe'}
            </Button>
          </form>
        ) : (
          <div className="add-recipe__body">
            <div className="add-recipe__banner">
              <Badge variant={extraction === 'full' ? 'success' : 'warning'}>
                {extraction === 'full' ? 'Full recipe found' : 'Partial'}
              </Badge>
              <span>
                {extraction === 'full'
                  ? `${draft.ingredients.length} ingredients and ${draft.steps.length} steps were read from the page.`
                  : 'Only the title and description could be read. Everything below is editable.'}
              </span>
            </div>

            <label className="add-recipe__field">
              <span>Name</span>
              <input value={draft.name} onChange={(event) => patch({ name: event.target.value })} />
            </label>

            <label className="add-recipe__field">
              <span>One-line description</span>
              <input value={draft.blurb} onChange={(event) => patch({ blurb: event.target.value })} />
            </label>

            <div className="add-recipe__row">
              <label className="add-recipe__field">
                <span>Cook time (min)</span>
                <input
                  type="number"
                  min="1"
                  max="6000"
                  value={draft.cookTimeMinutes}
                  onChange={(event) => patch({ cookTimeMinutes: Number(event.target.value) })}
                />
              </label>

              <label className="add-recipe__field">
                <span>Servings</span>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={draft.servings}
                  onChange={(event) => patch({ servings: Number(event.target.value) })}
                />
              </label>

              <label className="add-recipe__field">
                <span>Cuisine</span>
                <select value={draft.cuisine} onChange={(event) => patch({ cuisine: event.target.value })}>
                  {CUISINE_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="add-recipe__toggles">
              <label>
                <input
                  type="checkbox"
                  checked={draft.tags.includes('vegetarian')}
                  onChange={(event) =>
                    patch({
                      tags: event.target.checked
                        ? [...draft.tags, 'vegetarian']
                        : draft.tags.filter((tag) => tag !== 'vegetarian'),
                    })
                  }
                />
                Vegetarian
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={draft.onePan}
                  onChange={(event) => patch({ onePan: event.target.checked })}
                />
                One pan
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={draft.makeAhead}
                  onChange={(event) => patch({ makeAhead: event.target.checked })}
                />
                Make ahead
              </label>
            </div>

            {draft.ingredients.length > 0 ? (
              <details className="add-recipe__details" open>
                <summary>{draft.ingredients.length} ingredients</summary>
                <ul>
                  {draft.ingredients.map((ingredient, index) => (
                    <li key={index}>{typeof ingredient === 'string' ? ingredient : ingredient.item}</li>
                  ))}
                </ul>
              </details>
            ) : null}

            {draft.steps.length > 0 ? (
              <details className="add-recipe__details">
                <summary>{draft.steps.length} steps</summary>
                <ol>
                  {draft.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </details>
            ) : null}

            <p className="add-recipe__origin">
              From <span>{draft.source.label}</span> · {draft.sourceUrl}
            </p>

            {error ? (
              <p className="add-recipe__error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="add-recipe__actions">
              <Button variant="ghost" onClick={() => setStage(STEPS.INPUT)} disabled={busy}>
                Back
              </Button>
              <Button onClick={handleSave} disabled={busy || !draft.name.trim()}>
                {busy ? 'Saving…' : 'Add to my recipes'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
