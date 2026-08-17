import Card from './Card'
import Badge from './Badge'
import Icon from './Icon'
import { formatCookTime, getRecipeBadges } from '../lib/recipes'
import './RecipeCard.css'

const SOURCE_ICONS = {
  instagram: 'instagram',
  tiktok: 'tiktok',
  youtube: 'youtube',
  blog: 'link',
}

/**
 * RecipeCard
 *
 * One recipe in the grid: name, where it came from, how long it takes, and the
 * badges derived in lib/recipes. Composed from Card and Badge — it adds layout,
 * not new visual language.
 */
export default function RecipeCard({ recipe }) {
  const badges = getRecipeBadges(recipe)

  return (
    <Card as="article" interactive padding="md" className="recipe-card">
      <div className="recipe-card__source">
        <Icon name={SOURCE_ICONS[recipe.source.type] ?? 'link'} size={14} />
        <span>{recipe.source.label}</span>
      </div>

      <h3 className="recipe-card__name">
        <a
          className="recipe-card__link"
          href={recipe.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          {recipe.name}
        </a>
      </h3>

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
    </Card>
  )
}
