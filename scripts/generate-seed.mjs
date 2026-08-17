/**
 * Generates supabase/seed.sql from src/data/recipes.js.
 *
 * The seed file is committed, so nobody has to run this to deploy — but if you
 * edit a recipe, run `npm run seed:generate` in the same commit rather than
 * hand-editing the SQL. That is the only thing keeping the local fallback data
 * and the production table in agreement.
 *
 * Usage: node scripts/generate-seed.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { recipes } from '../src/data/recipes.js'

const here = dirname(fileURLToPath(import.meta.url))
const outPath = resolve(here, '../supabase/seed.sql')

/** Single-quote a SQL string literal, doubling any embedded quotes. */
function q(value) {
  if (value === null || value === undefined) return 'null'
  return `'${String(value).replaceAll("'", "''")}'`
}

/** A text[] literal. */
function textArray(values) {
  if (!values?.length) return `'{}'::text[]`
  return `array[${values.map(q).join(', ')}]::text[]`
}

/** A jsonb literal. */
function json(value) {
  return `${q(JSON.stringify(value))}::jsonb`
}

const rows = recipes.map((recipe) =>
  [
    q(recipe.id),
    q(recipe.name),
    q(recipe.blurb),
    q(recipe.cuisine),
    json(recipe.source),
    q(recipe.sourceUrl),
    recipe.cookTimeMinutes,
    recipe.servings,
    recipe.hue,
    textArray(recipe.tags),
    recipe.onePan,
    recipe.makeAhead,
    q(recipe.addedAt),
    json(recipe.ingredients),
    json(recipe.steps),
  ].join(', '),
)

const sql = `-- Recipe Box — seed data
--
-- GENERATED FILE. Do not edit by hand.
-- Source: src/data/recipes.js  ->  node scripts/generate-seed.mjs
--
-- Safe to re-run: every row upserts on the primary key.
-- Run this after supabase/migrations/0001_init.sql.

insert into public.recipes (
  id, name, blurb, cuisine, source, source_url, cook_time_minutes,
  servings, hue, tags, one_pan, make_ahead, added_at, ingredients, steps
) values
${rows.map((row) => `  (${row})`).join(',\n')}
on conflict (id) do update set
  name              = excluded.name,
  blurb             = excluded.blurb,
  cuisine           = excluded.cuisine,
  source            = excluded.source,
  source_url        = excluded.source_url,
  cook_time_minutes = excluded.cook_time_minutes,
  servings          = excluded.servings,
  hue               = excluded.hue,
  tags              = excluded.tags,
  one_pan           = excluded.one_pan,
  make_ahead        = excluded.make_ahead,
  added_at          = excluded.added_at,
  ingredients       = excluded.ingredients,
  steps             = excluded.steps;
`

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, sql, 'utf8')

const veg = recipes.filter((r) => r.tags.includes('vegetarian')).length
const byCuisine = recipes.reduce((acc, r) => ({ ...acc, [r.cuisine]: (acc[r.cuisine] ?? 0) + 1 }), {})

console.log(`Wrote ${outPath}`)
console.log(`${recipes.length} recipes — ${veg} vegetarian (${Math.round((veg / recipes.length) * 100)}%)`)
console.log(`cuisine:`, byCuisine)
