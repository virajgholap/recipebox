import { describe, expect, it } from 'vitest'
import {
  CATEGORY_ORDER,
  formatQuantity,
  groupByCategory,
  normaliseIngredient,
  scaleIngredient,
} from './ingredients'

describe('formatQuantity', () => {
  it.each([
    [0.25, '¼'],
    [0.5, '½'],
    [0.75, '¾'],
    [1.5, '1½'],
    [2, '2'],
    [5.25, '5¼'],
    [0.333, '⅓'],
  ])('%s renders as %s', (input, expected) => {
    expect(formatQuantity(input)).toBe(expected)
  })

  it('falls back to a decimal rather than lying about a near-miss', () => {
    // 0.42 is not close enough to any common fraction to claim it is one.
    expect(formatQuantity(0.42)).toBe('0.42')
  })

  it('returns nothing for absent or nonsense values', () => {
    expect(formatQuantity(null)).toBe('')
    expect(formatQuantity(0)).toBe('')
    expect(formatQuantity(-1)).toBe('')
    expect(formatQuantity(Number.NaN)).toBe('')
  })
})

describe('scaleIngredient', () => {
  it('multiplies a structured quantity', () => {
    const result = scaleIngredient({ quantity: 3, unit: 'tbsp', item: 'tahini' }, 7 / 4)
    expect(result.quantity).toBeCloseTo(5.25)
    expect(formatQuantity(result.quantity)).toBe('5¼')
  })

  it('leaves a free-text ingredient alone instead of mangling it', () => {
    const result = scaleIngredient('2 cups plain flour, sifted', 2)
    expect(result.item).toBe('2 cups plain flour, sifted')
    expect(result.quantity).toBeNull()
  })
})

describe('normaliseIngredient', () => {
  it('turns an extracted string into the structured shape', () => {
    expect(normaliseIngredient('800g canned chickpeas')).toEqual({
      quantity: null,
      unit: '',
      item: '800g canned chickpeas',
      category: 'other',
    })
  })

  it('passes a structured ingredient through untouched', () => {
    const original = { quantity: 2, unit: 'clove', item: 'garlic', category: 'produce' }
    expect(normaliseIngredient(original)).toBe(original)
  })
})

describe('groupByCategory', () => {
  it('orders aisles the way you walk a shop, not alphabetically', () => {
    const groups = groupByCategory([
      { quantity: 1, unit: 'tsp', item: 'cumin', category: 'spices' },
      { quantity: 1, unit: 'lb', item: 'lamb', category: 'protein' },
      { quantity: 2, unit: 'clove', item: 'garlic', category: 'produce' },
    ])
    expect(groups.map((g) => g.category)).toEqual(['produce', 'protein', 'spices'])
  })

  it('drops empty aisles', () => {
    const groups = groupByCategory([{ quantity: 1, unit: '', item: 'x', category: 'produce' }])
    expect(groups).toHaveLength(1)
  })

  it('keeps an unknown category rather than losing the ingredient', () => {
    const groups = groupByCategory([{ quantity: 1, unit: '', item: 'saffron', category: 'wat' }])
    expect(groups).toHaveLength(1)
    expect(groups[0].items[0].item).toBe('saffron')
  })

  it('handles a list of plain strings from an extracted recipe', () => {
    const groups = groupByCategory(['3 onions', '2 tbsp oil'])
    expect(groups).toHaveLength(1)
    expect(groups[0].items.map((i) => i.item)).toEqual(['3 onions', '2 tbsp oil'])
  })

  it('never invents an aisle outside the known set', () => {
    const groups = groupByCategory(['a', { quantity: 1, unit: '', item: 'b', category: 'dairy' }])
    for (const group of groups) {
      expect([...CATEGORY_ORDER, 'other']).toContain(group.category)
    }
  })
})
