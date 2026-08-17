import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Recipes people add themselves, from public.user_recipes.
 *
 * Shape matches the curated catalogue so the grid and the detail view do not
 * care which table a recipe came from — `isUserRecipe` is the only difference,
 * and it exists so the UI can show a Remove action on your own saves.
 */

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    blurb: row.blurb,
    cuisine: row.cuisine,
    source: row.source,
    sourceUrl: row.source_url,
    imageUrl: row.image_url,
    cookTimeMinutes: row.cook_time_minutes,
    servings: row.servings,
    hue: row.hue,
    tags: row.tags ?? [],
    onePan: row.one_pan,
    makeAhead: row.make_ahead,
    addedAt: row.added_at,
    ingredients: row.ingredients ?? [],
    steps: row.steps ?? [],
    isUserRecipe: true,
  }
}

export async function fetchUserRecipes(userId) {
  if (!isSupabaseConfigured || !userId) return []

  const { data, error } = await supabase
    .from('user_recipes')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false })

  if (error) {
    console.warn('[recipe-box] Could not load your recipes:', error.message)
    return []
  }

  return (data ?? []).map(fromRow)
}

/**
 * Upserts on (user_id, source_url), so re-adding the same link updates the
 * existing save instead of creating a second copy of it.
 */
export async function saveUserRecipe(userId, draft) {
  if (!isSupabaseConfigured) {
    return { error: new Error('Accounts are not configured in this deployment.') }
  }

  const { data, error } = await supabase
    .from('user_recipes')
    .upsert(
      {
        user_id: userId,
        name: draft.name,
        blurb: draft.blurb ?? '',
        cuisine: draft.cuisine ?? 'other',
        source: draft.source ?? {},
        source_url: draft.sourceUrl,
        image_url: draft.imageUrl ?? null,
        cook_time_minutes: draft.cookTimeMinutes ?? 30,
        servings: draft.servings ?? 4,
        hue: draft.hue ?? 20,
        tags: draft.tags ?? [],
        one_pan: draft.onePan ?? false,
        make_ahead: draft.makeAhead ?? false,
        ingredients: draft.ingredients ?? [],
        steps: draft.steps ?? [],
      },
      { onConflict: 'user_id,source_url' },
    )
    .select()
    .single()

  if (error) return { error }
  return { recipe: fromRow(data) }
}

export async function deleteUserRecipe(id) {
  const { error } = await supabase.from('user_recipes').delete().eq('id', id)
  return { error }
}

/** Which platform a pasted link is from, for the source chip on the card. */
export function detectSource(url) {
  let host
  try {
    host = new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return { type: 'blog', label: 'Link' }
  }

  if (host.includes('instagram.')) return { type: 'instagram', label: 'Instagram' }
  if (host.includes('tiktok.')) return { type: 'tiktok', label: 'TikTok' }
  if (host.includes('youtube.') || host === 'youtu.be') return { type: 'youtube', label: 'YouTube' }
  return { type: 'blog', label: host }
}

/** A stable hue per domain, so the same site always gets the same hero colour. */
export function hueFromUrl(url) {
  let hash = 0
  for (const char of url) hash = (hash * 31 + char.charCodeAt(0)) % 360
  return hash
}
