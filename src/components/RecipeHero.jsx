import { useState } from 'react'
import Icon from './Icon'
import recipeImages from '../data/images'
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
 * The photograph, with a generated gradient underneath it. The gradient is
 * seeded from the recipe's `hue`, so it is deterministic and it is what you see
 * while the image decodes — and the whole hero if a recipe has no photo yet.
 *
 * The photo is decorative: the recipe name sits right beside it, so `alt` is
 * empty rather than a restatement. The source chip stays readable.
 */
export default function RecipeHero({ recipe, size = 'card', children }) {
  // A user-added recipe carries a remote image from the page it came from; the
  // curated twenty have a bundled file. If a remote image 404s or is hotlink-
  // blocked, onError drops it and the gradient underneath takes over.
  const [failed, setFailed] = useState(false)
  const image = failed ? null : (recipe.imageUrl ?? recipeImages[recipe.id])

  return (
    <div className={`recipe-hero recipe-hero--${size}`} style={{ '--recipe-hue': recipe.hue }}>
      <span className="recipe-hero__field recipe-hero__field--a" aria-hidden="true" />
      <span className="recipe-hero__field recipe-hero__field--b" aria-hidden="true" />

      {image ? (
        <img
          className="recipe-hero__image"
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="recipe-hero__grain" aria-hidden="true" />
      )}

      <span className="recipe-hero__source">
        <Icon name={SOURCE_ICONS[recipe.source.type] ?? 'link'} size={13} />
        {recipe.source.label}
      </span>

      {children}
    </div>
  )
}
