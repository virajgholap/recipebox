/**
 * Recipe helpers.
 *
 * Badges are derived from the data rather than stored on it — a recipe is a
 * "Weekend project" because of what it is, not because someone tagged it.
 */

export const QUICK_MINUTES = 30
export const PROJECT_MINUTES = 120

/**
 * Returns the badges for a recipe as `{ label, variant }`, in display order.
 */
export function getRecipeBadges(recipe) {
  const badges = []

  if (recipe.cookTimeMinutes <= QUICK_MINUTES) {
    badges.push({ label: 'Under 30 min', variant: 'success' })
  }

  if (recipe.onePan) {
    badges.push({ label: 'One pan', variant: 'success' })
  }

  if (recipe.makeAhead) {
    badges.push({ label: 'Make ahead', variant: 'info' })
  }

  if (recipe.cookTimeMinutes >= PROJECT_MINUTES) {
    badges.push({ label: 'Weekend project', variant: 'warning' })
  }

  return badges
}

/** "1 hr 30 min", "45 min". */
export function formatCookTime(minutes) {
  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`
}

/** Every tag in the collection, with how many recipes carry it. */
export function getTagOptions(collection) {
  const counts = new Map()

  for (const recipe of collection) {
    for (const tag of recipe.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  const tags = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag, count]) => ({ value: tag, label: toTagLabel(tag), count }))

  return [{ value: null, label: 'All', count: collection.length }, ...tags]
}

function toTagLabel(tag) {
  return tag.charAt(0).toUpperCase() + tag.slice(1)
}

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently added' },
  { value: 'cookTime', label: 'Cook time' },
]

export const CUISINE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'indian', label: 'Indian' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'other', label: 'Everything else' },
]

/**
 * Filter by cuisine and tags, then sort. Selected tags combine with AND: a
 * recipe has to carry every one of them. An empty list means no tag filter,
 * and a cuisine of 'all' means no cuisine filter.
 */
export function filterAndSortRecipes(
  collection,
  { tags = [], cuisine = 'all', sort = 'recent' } = {},
) {
  const filtered = collection.filter((recipe) => {
    if (cuisine !== 'all' && recipe.cuisine !== cuisine) return false
    return tags.every((tag) => recipe.tags.includes(tag))
  })

  return filtered.sort((a, b) => {
    if (sort === 'cookTime') {
      return a.cookTimeMinutes - b.cookTimeMinutes || a.name.localeCompare(b.name)
    }
    return new Date(b.addedAt) - new Date(a.addedAt) || a.name.localeCompare(b.name)
  })
}
