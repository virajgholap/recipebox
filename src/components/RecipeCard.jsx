import Card from './Card'
import Badge from './Badge'
import Icon from './Icon'
import RecipeHero from './RecipeHero'
import { formatCookTime, getRecipeBadges } from '../lib/recipes'
import './RecipeCard.css'

/**
 * RecipeCard
 *
 * One recipe in the grid. The title is the button and its hit area stretches
 * over the whole card, so there is exactly one focusable control per card
 * rather than a card-shaped div wrapping three of them.
 */
export default function RecipeCard({ recipe, onOpen }) {
  const badges = getRecipeBadges(recipe)

  return (
    <Card as="article" interactive padding="sm" className="recipe-card">
      <RecipeHero recipe={recipe} size="card" />

      <div className="recipe-card__body">
        <h3 className="recipe-card__name">
          <button type="button" className="recipe-card__button" onClick={() => onOpen(recipe)}>
            {recipe.name}
          </button>
        </h3>

        <p className="recipe-card__blurb">{recipe.blurb}</p>

        <div className="recipe-card__meta">
          <span className="recipe-card__time">
            <Icon name="clock" size={14} />
            {formatCookTime(recipe.cookTimeMinutes)}
          </span>
          <span className="recipe-card__dot" aria-hidden="true">
            ·
          </span>
          <span>Serves {recipe.servings}</span>
        </div>

        {badges.length > 0 ? (
          <ul className="recipe-card__badges">
            {badges.map((badge) => (
              <li key={badge.label}>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Card>
  )
}
