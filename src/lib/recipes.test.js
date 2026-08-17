import { describe, expect, it } from 'vitest'
import {
  CUISINE_OPTIONS,
  PROJECT_MINUTES,
  QUICK_MINUTES,
  filterAndSortRecipes,
  formatCookTime,
  getRecipeBadges,
  getSourceLink,
  getTagOptions,
} from './recipes'
import { recipes } from '../data/recipes'

const base = {
  id: 'x',
  name: 'Test Dish',
  cuisine: 'other',
  source: { type: 'youtube', label: 'YouTube' },
  cookTimeMinutes: 40,
  servings: 4,
  hue: 10,
  tags: [],
  onePan: false,
  makeAhead: false,
  addedAt: '2026-01-01',
  ingredients: [],
  steps: [],
}

describe('the seed catalogue', () => {
  it('is the twenty recipes with the split we promised', () => {
    expect(recipes).toHaveLength(20)

    const byCuisine = recipes.reduce(
      (acc, r) => ({ ...acc, [r.cuisine]: (acc[r.cuisine] ?? 0) + 1 }),
      {},
    )
    expect(byCuisine).toEqual({ indian: 12, mexican: 4, other: 4 })

    const veg = recipes.filter((r) => r.tags.includes('vegetarian')).length
    expect(veg).toBe(16)
  })

  it('has no duplicate ids', () => {
    expect(new Set(recipes.map((r) => r.id)).size).toBe(recipes.length)
  })

  it('never stores a source URL — those were the links that 404d', () => {
    for (const recipe of recipes) {
      expect(recipe.sourceUrl).toBeUndefined()
    }
  })

  it('gives every recipe steps and ingredients', () => {
    for (const recipe of recipes) {
      expect(recipe.steps.length).toBeGreaterThan(2)
      expect(recipe.ingredients.length).toBeGreaterThan(2)
    }
  })
})

describe('getRecipeBadges', () => {
  it('marks anything at or under the quick threshold', () => {
    const badges = getRecipeBadges({ ...base, cookTimeMinutes: QUICK_MINUTES })
    expect(badges.map((b) => b.label)).toContain('Under 30 min')
  })

  it('does not mark one minute over it', () => {
    const badges = getRecipeBadges({ ...base, cookTimeMinutes: QUICK_MINUTES + 1 })
    expect(badges.map((b) => b.label)).not.toContain('Under 30 min')
  })

  it('marks a weekend project at the threshold', () => {
    const badges = getRecipeBadges({ ...base, cookTimeMinutes: PROJECT_MINUTES })
    expect(badges.map((b) => b.label)).toContain('Weekend project')
  })

  it('uses variants from the Badge set, never a colour', () => {
    const badges = getRecipeBadges({ ...base, cookTimeMinutes: 10, onePan: true, makeAhead: true })
    for (const badge of badges) {
      expect(['success', 'warning', 'info', 'neutral']).toContain(badge.variant)
    }
  })

  it('returns nothing for an unremarkable recipe', () => {
    expect(getRecipeBadges({ ...base, cookTimeMinutes: 45 })).toEqual([])
  })
})

describe('formatCookTime', () => {
  it.each([
    [15, '15 min'],
    [59, '59 min'],
    [60, '1 hr'],
    [90, '1 hr 30 min'],
    [240, '4 hr'],
  ])('%i minutes reads as %s', (minutes, expected) => {
    expect(formatCookTime(minutes)).toBe(expected)
  })
})

describe('filterAndSortRecipes', () => {
  const set = [
    { ...base, id: 'a', name: 'A', cuisine: 'indian', tags: ['vegetarian'], cookTimeMinutes: 90, addedAt: '2026-01-01' },
    { ...base, id: 'b', name: 'B', cuisine: 'mexican', tags: ['vegetarian', 'weeknight'], cookTimeMinutes: 20, addedAt: '2026-03-01' },
    { ...base, id: 'c', name: 'C', cuisine: 'indian', tags: ['weeknight'], cookTimeMinutes: 45, addedAt: '2026-02-01' },
  ]

  it('combines tags with AND, not OR', () => {
    const result = filterAndSortRecipes(set, { tags: ['vegetarian', 'weeknight'] })
    expect(result.map((r) => r.id)).toEqual(['b'])
  })

  it('can return nothing, which is what the empty state is for', () => {
    expect(filterAndSortRecipes(set, { tags: ['vegetarian'], cuisine: 'indian' })).toHaveLength(1)
    expect(filterAndSortRecipes(set, { tags: ['weeknight'], cuisine: 'mexican' })).toHaveLength(1)
    expect(filterAndSortRecipes(set, { tags: ['vegetarian', 'weeknight'], cuisine: 'indian' })).toHaveLength(0)
  })

  it('sorts by cook time ascending', () => {
    const result = filterAndSortRecipes(set, { sort: 'cookTime' })
    expect(result.map((r) => r.cookTimeMinutes)).toEqual([20, 45, 90])
  })

  it('sorts by most recently added', () => {
    const result = filterAndSortRecipes(set, { sort: 'recent' })
    expect(result.map((r) => r.id)).toEqual(['b', 'c', 'a'])
  })

  it('does not mutate the array it was given', () => {
    const order = set.map((r) => r.id)
    filterAndSortRecipes(set, { sort: 'cookTime' })
    expect(set.map((r) => r.id)).toEqual(order)
  })
})

describe('getSourceLink', () => {
  it('prefers a real permalink when the recipe has one', () => {
    const link = getSourceLink({ ...base, sourceUrl: 'https://example.com/thing' })
    expect(link).toEqual({ url: 'https://example.com/thing', label: 'View original' })
  })

  it('produces a working search URL per platform, never a fake permalink', () => {
    for (const type of ['youtube', 'tiktok', 'instagram']) {
      const link = getSourceLink({ ...base, source: { type, label: type } })
      expect(link.url).toMatch(/^https:\/\//)
      expect(link.url).not.toMatch(/seed-/)
      expect(link.label).toMatch(/^Find it on/)
    }
  })

  it('escapes the query rather than concatenating it raw', () => {
    const link = getSourceLink({ ...base, name: 'Dal Makhani & Rice' })
    expect(link.url).not.toContain(' ')
    expect(link.url).not.toContain('&Rice')
  })

  it('sends a blog to its own domain', () => {
    const link = getSourceLink({ ...base, source: { type: 'blog', label: 'smittenkitchen.com' } })
    expect(link.url).toBe('https://smittenkitchen.com')
  })
})

describe('getTagOptions', () => {
  it('leads with All and counts the whole collection', () => {
    const options = getTagOptions(recipes)
    expect(options[0]).toEqual({ value: null, label: 'All', count: 20 })
  })

  it('counts vegetarian at sixteen', () => {
    const veg = getTagOptions(recipes).find((o) => o.value === 'vegetarian')
    expect(veg.count).toBe(16)
  })
})

describe('CUISINE_OPTIONS', () => {
  it('covers every cuisine present in the data', () => {
    const declared = new Set(CUISINE_OPTIONS.map((o) => o.value).filter((v) => v !== 'all'))
    for (const recipe of recipes) {
      expect(declared.has(recipe.cuisine)).toBe(true)
    }
  })
})
