/**
 * Ingredient helpers.
 *
 * Two ideas borrowed from the apps that get this right: Paprika groups
 * ingredients the way a shop is laid out, and every good recipe app writes
 * quantities as fractions because nobody owns a 0.75 cup measure.
 */

/** Aisle order — roughly the walk through a shop, not alphabetical. */
export const CATEGORY_ORDER = ['produce', 'protein', 'dairy', 'bakery', 'pantry', 'spices']

export const CATEGORY_LABELS = {
  produce: 'Produce',
  protein: 'Meat & seafood',
  dairy: 'Dairy & eggs',
  bakery: 'Bakery',
  pantry: 'Pantry',
  spices: 'Spices',
}

const FRACTIONS = [
  [0.125, '⅛'],
  [0.25, '¼'],
  [0.333, '⅓'],
  [0.375, '⅜'],
  [0.5, '½'],
  [0.625, '⅝'],
  [0.667, '⅔'],
  [0.75, '¾'],
  [0.875, '⅞'],
]

/**
 * 0.75 -> "¾", 1.5 -> "1½", 2 -> "2", 0.42 -> "0.42".
 *
 * Only snaps to a fraction when the value is genuinely close to one, so a
 * scaled-by-thirds quantity degrades to a decimal rather than lying.
 */
export function formatQuantity(value) {
  if (!Number.isFinite(value) || value <= 0) return ''

  const whole = Math.floor(value)
  const remainder = value - whole

  if (remainder < 0.02) return String(whole)

  const match = FRACTIONS.find(([size]) => Math.abs(remainder - size) < 0.02)
  if (match) return whole === 0 ? match[1] : `${whole}${match[1]}`

  return String(Math.round(value * 100) / 100)
}

/** Scale an ingredient's quantity by a factor, leaving everything else alone. */
export function scaleIngredient(ingredient, factor) {
  return { ...ingredient, quantity: ingredient.quantity * factor }
}

/**
 * Group ingredients into aisles, in CATEGORY_ORDER. Empty aisles are dropped,
 * and anything with an unknown category lands at the end rather than vanishing.
 */
export function groupByCategory(ingredients) {
  const groups = new Map()

  for (const ingredient of ingredients) {
    const key = CATEGORY_ORDER.includes(ingredient.category) ? ingredient.category : 'other'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(ingredient)
  }

  const ordered = [...CATEGORY_ORDER, 'other']

  return ordered
    .filter((category) => groups.has(category))
    .map((category) => ({
      category,
      label: CATEGORY_LABELS[category] ?? 'Other',
      items: groups.get(category),
    }))
}

/** A stable key for one ingredient line within a recipe. */
export function ingredientKey(ingredient, index) {
  return `${index}-${ingredient.item}`
}
