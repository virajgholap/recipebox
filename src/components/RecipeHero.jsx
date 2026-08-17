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
 * Card grids put four across on a wide screen and one across on a phone, so
 * the rendered width is roughly a quarter of the viewport on desktop and most
 * of it on mobile. Telling the browser that lets it pick the 400w file for a
 * phone instead of the 1200w original.
 */
const CARD_SIZES = '(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 280px'
const DETAIL_SIZES = '(max-width: 920px) 100vw, 920px'

/**
 * RecipeHero
 *
 * The photograph, with a generated gradient underneath it. The gradient is
 * seeded from the recipe's `hue`, so it is deterministic, and it is what you
 * see while the image decodes — and the whole hero if a recipe has no photo.
 *
 * The photo is decorative: the recipe name sits right beside it, so `alt` is
 * empty rather than a restatement. The source chip stays readable.
 */
export default function RecipeHero({ recipe, size = 'card', children }) {
  // A user-added recipe carries a remote image from the page it came from; the
  // curated twenty have bundled files at three widths. If a remote image 404s
  // or is hotlink-blocked, onError drops it and the gradient takes over.
  const [failed, setFailed] = useState(false)
  const bundled = recipeImages[recipe.id]
  const src = failed ? null : (recipe.imageUrl ?? bundled?.src ?? null)
  const srcSet = recipe.imageUrl ? undefined : (bundled?.srcSet ?? undefined)

  return (
    <div className={`recipe-hero recipe-hero--${size}`} style={{ '--recipe-hue': recipe.hue }}>
      <span className="recipe-hero__field recipe-hero__field--a" aria-hidden="true" />
      <span className="recipe-hero__field recipe-hero__field--b" aria-hidden="true" />

      {src ? (
        <img
          className="recipe-hero__image"
          src={src}
          srcSet={srcSet}
          sizes={srcSet ? (size === 'detail' ? DETAIL_SIZES : CARD_SIZES) : undefined}
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
