import { useMemo, useState } from 'react'
import Modal from './Modal'
import Badge from './Badge'
import Button from './Button'
import Icon from './Icon'
import RecipeHero from './RecipeHero'
import IngredientList from './IngredientList'
import StepList from './StepList'
import ServingStepper from './ServingStepper'
import useRecipeProgress from '../hooks/useRecipeProgress'
import { formatCookTime, getRecipeBadges, getSourceLink } from '../lib/recipes'
import { scaleIngredient } from '../lib/ingredients'
import './RecipeDetail.css'

/**
 * RecipeDetail
 *
 * The recipe as something you cook from, not just something you saved.
 *
 * Mount this keyed on `recipe.id` — the progress hook reads its stored state
 * once on mount, so a remount per recipe is what keeps one recipe's checked
 * ingredients from leaking into another's.
 */
export default function RecipeDetail({ recipe, onClose }) {
  const [progress, setProgress, sync] = useRecipeProgress(recipe)

  const [cookMode, setCookMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const servings = progress.servings ?? recipe.servings
  const factor = servings / recipe.servings

  const scaled = useMemo(
    () => recipe.ingredients.map((ingredient) => scaleIngredient(ingredient, factor)),
    [recipe.ingredients, factor],
  )

  const badges = getRecipeBadges(recipe)
  const sourceLink = getSourceLink(recipe)
  const titleId = `recipe-title-${recipe.id}`

  const checkedCount = progress.checked.length
  const doneCount = progress.done.length
  const stepPercent = Math.round((doneCount / recipe.steps.length) * 100)

  function update(patch) {
    setProgress((current) => ({ ...current, ...patch }))
  }

  // Accepts either a number or an updater, so rapid stepper clicks compose.
  function setServings(next) {
    setProgress((current) => {
      const from = current.servings ?? recipe.servings
      return { ...current, servings: typeof next === 'function' ? next(from) : next }
    })
  }

  function toggleIngredient(key) {
    setProgress((current) => ({
      ...current,
      checked: current.checked.includes(key)
        ? current.checked.filter((value) => value !== key)
        : [...current.checked, key],
    }))
  }

  function toggleStep(index) {
    const isDone = progress.done.includes(index)

    setProgress((current) => ({
      ...current,
      done: current.done.includes(index)
        ? current.done.filter((value) => value !== index)
        : [...current.done, index],
    }))

    // Completing the step you are standing on moves you to the next one.
    if (!isDone && cookMode && index === currentStep) {
      setCurrentStep(Math.min(recipe.steps.length - 1, index + 1))
    }
  }

  function resetProgress() {
    update({ checked: [], done: [] })
    setCurrentStep(0)
  }

  return (
    <Modal open onClose={onClose} labelledBy={titleId}>
      <div className={`recipe-detail ${cookMode ? 'recipe-detail--cooking' : ''}`.trim()}>
        <RecipeHero recipe={recipe} size="detail">
          <button type="button" className="recipe-detail__close" aria-label="Close recipe" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </RecipeHero>

        <div className="recipe-detail__body">
          <header className="recipe-detail__intro">
            <h2 className="recipe-detail__title" id={titleId}>
              {recipe.name}
            </h2>
            <p className="recipe-detail__blurb">{recipe.blurb}</p>

            <div className="recipe-detail__meta">
              <span className="recipe-detail__meta-item">
                <Icon name="clock" size={14} />
                {formatCookTime(recipe.cookTimeMinutes)}
              </span>
              <span className="recipe-detail__meta-item">
                {recipe.steps.length} steps · {recipe.ingredients.length} ingredients
              </span>
              <a
                className="recipe-detail__source-link"
                href={sourceLink.url}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Icon name="link" size={14} />
                {sourceLink.label}
              </a>
            </div>

            {badges.length > 0 ? (
              <ul className="recipe-detail__badges">
                {badges.map((badge) => (
                  <li key={badge.label}>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </li>
                ))}
              </ul>
            ) : null}
          </header>

          <div className="recipe-detail__toolbar">
            <ServingStepper
              value={servings}
              baseValue={recipe.servings}
              onChange={setServings}
            />

            <div className="recipe-detail__toolbar-actions">
              {sync.synced ? (
                <span className="recipe-detail__sync" title="Your progress is saved to your account">
                  {sync.syncing ? 'Syncing…' : 'Synced'}
                </span>
              ) : null}
              {checkedCount + doneCount > 0 ? (
                <Button variant="ghost" size="sm" onClick={resetProgress}>
                  Reset
                </Button>
              ) : null}
              <Button
                variant={cookMode ? 'primary' : 'ghost'}
                size="sm"
                aria-pressed={cookMode}
                onClick={() => setCookMode((on) => !on)}
              >
                {cookMode ? 'Exit cook mode' : 'Cook mode'}
              </Button>
            </div>
          </div>

          <div className="recipe-detail__columns">
            <aside className="recipe-detail__ingredients">
              <div className="recipe-detail__section-head">
                <h3 className="recipe-detail__section-title">Ingredients</h3>
                <span className="recipe-detail__progress-text">
                  {checkedCount} of {recipe.ingredients.length}
                </span>
              </div>

              {factor !== 1 ? (
                <p className="recipe-detail__scaled-note">
                  Scaled {factor > 1 ? 'up' : 'down'} from {recipe.servings} servings.
                </p>
              ) : null}

              <IngredientList
                ingredients={scaled}
                checkedKeys={progress.checked}
                onToggle={toggleIngredient}
              />
            </aside>

            <section className="recipe-detail__steps">
              <div className="recipe-detail__section-head">
                <h3 className="recipe-detail__section-title">Method</h3>
                <span className="recipe-detail__progress-text">
                  {doneCount} of {recipe.steps.length}
                </span>
              </div>

              <div
                className="recipe-detail__progress-bar"
                role="progressbar"
                aria-valuenow={stepPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Steps completed"
              >
                <span style={{ width: `${stepPercent}%` }} />
              </div>

              <StepList
                steps={recipe.steps}
                doneIndexes={progress.done}
                onToggle={toggleStep}
                cookMode={cookMode}
                currentIndex={currentStep}
              />
            </section>
          </div>
        </div>

        {cookMode ? (
          <footer className="recipe-detail__cook-bar">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((index) => Math.max(0, index - 1))}
            >
              Previous
            </Button>
            <span className="recipe-detail__cook-position">
              Step {currentStep + 1} of {recipe.steps.length}
            </span>
            <Button
              variant="primary"
              size="sm"
              disabled={currentStep === recipe.steps.length - 1}
              onClick={() => setCurrentStep((index) => Math.min(recipe.steps.length - 1, index + 1))}
            >
              Next
            </Button>
          </footer>
        ) : null}
      </div>
    </Modal>
  )
}
