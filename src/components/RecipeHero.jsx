import Icon from './Icon'
import './RecipeHero.css'

const SOURCE_ICONS = {
  instagram: 'instagram',
  tiktok: 'tiktok',
  youtube: 'youtube',
  blog: 'link',
}

/**
 * RecipeHero
 *
 * There are no photographs in this app and no network requests to fetch any,
 * so the art is generated: three overlapping gradient fields seeded from the
 * recipe's `hue`, plus a grain overlay so it reads as a surface rather than a
 * default. Deterministic — the same recipe always looks the same.
 */
export default function RecipeHero({ recipe, size = 'card', children }) {
  return (
    <div
      className={`recipe-hero recipe-hero--${size}`}
      style={{ '--recipe-hue': recipe.hue }}
      aria-hidden="true"
    >
      <span className="recipe-hero__field recipe-hero__field--a" />
      <span className="recipe-hero__field recipe-hero__field--b" />
      <span className="recipe-hero__grain" />

      <span className="recipe-hero__source">
        <Icon name={SOURCE_ICONS[recipe.source.type] ?? 'link'} size={13} />
        {recipe.source.label}
      </span>

      {children}
    </div>
  )
}
