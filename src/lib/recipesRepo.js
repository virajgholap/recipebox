import { supabase, isSupabaseConfigured } from './supabase'
import seedRecipes from '../data/recipes'

/**
 * Where recipes come from.
 *
 * Supabase when it is configured, the bundled seed file when it is not — and
 * the seed file again if the network call fails, because a recipe box that
 * shows nothing because a database blinked is worse than one showing slightly
 * stale data. Callers get the same camelCase shape either way.
 */

/** Postgres columns are snake_case; the app is camelCase. One place to fix that. */
function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    blurb: row.blurb,
    cuisine: row.cuisine,
    source: row.source,
    sourceUrl: row.source_url,
    cookTimeMinutes: row.cook_time_minutes,
    servings: row.servings,
    hue: row.hue,
    tags: row.tags ?? [],
    onePan: row.one_pan,
    makeAhead: row.make_ahead,
    addedAt: row.added_at,
    ingredients: row.ingredients ?? [],
    steps: row.steps ?? [],
  }
}

export async function fetchRecipes() {
  if (!isSupabaseConfigured) {
    return { recipes: seedRecipes, source: 'seed' }
  }

  const { data, error } = await supabase.from('recipes').select('*')

  if (error) {
    console.warn('[recipe-box] Falling back to seed data:', error.message)
    return { recipes: seedRecipes, source: 'seed', error }
  }

  if (!data?.length) {
    console.warn('[recipe-box] The recipes table is empty — run supabase/seed.sql.')
    return { recipes: seedRecipes, source: 'seed' }
  }

  return { recipes: data.map(fromRow), source: 'supabase' }
}
