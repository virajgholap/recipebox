/**
 * Recipe photography.
 *
 * Discovered with import.meta.glob rather than twenty hand-written imports.
 * Adding a photo used to mean editing this file as well, and forgetting meant
 * the recipe silently fell back to its gradient. Now dropping a file into
 * src/assets/recipes named after the recipe id is the whole job.
 *
 * Three widths per photo — 400w, 800w, and the 1200w original — so a phone
 * showing a 300px card downloads a 400px image instead of a 1200px one.
 * Regenerate variants with `npm run images:generate` after adding photos.
 *
 * Every file is openly licensed and credited in ATTRIBUTION.md. If you add or
 * swap a photo, add the credit in the same commit.
 *
 * These stay bundled rather than living in Supabase Storage: they never change
 * per user, they cache forever behind a content hash, and the page needs no
 * network round trip for them.
 *
 * A missing entry is not an error — RecipeHero falls back to its generated
 * gradient, so a recipe without a photo still looks deliberate.
 */

const files = import.meta.glob('../assets/recipes/*.jpg', { eager: true, import: 'default' })

const ORIGINAL_WIDTH = 1200

const byId = {}

for (const [path, url] of Object.entries(files)) {
  const filename = path.split('/').pop()
  const match = filename.match(/^(.+?)(?:-(\d+)w)?\.jpg$/)
  if (!match) continue

  const [, id, width] = match
  byId[id] ??= { original: null, variants: [] }

  if (width) byId[id].variants.push({ url, width: Number(width) })
  else byId[id].original = url
}

/** `{ [recipeId]: { src, srcSet } }`. srcSet is null when there are no variants. */
export const recipeImages = Object.fromEntries(
  Object.entries(byId).map(([id, entry]) => {
    const all = [...entry.variants]
    if (entry.original) all.push({ url: entry.original, width: ORIGINAL_WIDTH })
    all.sort((a, b) => a.width - b.width)

    // Fall back to the widest variant if the original is somehow absent, so a
    // half-populated folder still renders something.
    const src = entry.original ?? all[all.length - 1]?.url ?? null
    const srcSet = all.length > 1 ? all.map(({ url, width }) => `${url} ${width}w`).join(', ') : null

    return [id, { src, srcSet }]
  }),
)

export default recipeImages
