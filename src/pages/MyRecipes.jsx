import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import SortControl from '../components/SortControl'
import RecipeCard from '../components/RecipeCard'
import RecipeDetail from '../components/RecipeDetail'
import EmptyState from '../components/EmptyState'
import recipes from '../data/recipes'
import { SORT_OPTIONS, filterAndSortRecipes, getTagOptions } from '../lib/recipes'
import './MyRecipes.css'

export default function MyRecipes() {
  const [activeTags, setActiveTags] = useState([])
  const [sort, setSort] = useState('recent')
  const [openRecipe, setOpenRecipe] = useState(null)

  const tagOptions = useMemo(() => getTagOptions(recipes), [])
  const visible = useMemo(
    () => filterAndSortRecipes(recipes, { tags: activeTags, sort }),
    [activeTags, sort],
  )

  // `null` is the "All" chip — it clears rather than toggles.
  function handleToggleTag(tag) {
    if (tag === null) {
      setActiveTags([])
      return
    }

    setActiveTags((current) =>
      current.includes(tag) ? current.filter((value) => value !== tag) : [...current, tag],
    )
  }

  const isFiltered = activeTags.length > 0

  return (
    <main className="layout my-recipes">
      <PageHeader
        title="My Recipes"
        subtitle="Everything you saved and meant to cook, in one place you can actually search through."
        actions={
          <SortControl options={SORT_OPTIONS} value={sort} onChange={setSort} label="Sort by" />
        }
      />

      <div className="my-recipes__controls">
        <FilterBar options={tagOptions} values={activeTags} onToggle={handleToggleTag} />
      </div>

      {visible.length > 0 ? (
        <>
          <p className="my-recipes__count" role="status">
            {visible.length} {visible.length === 1 ? 'recipe' : 'recipes'}
            {isFiltered ? ` tagged ${activeTags.join(' + ')}` : ''}
          </p>

          <ul className="my-recipes__grid">
            {visible.map((recipe, index) => (
              <li
                key={recipe.id}
                className="my-recipes__grid-item"
                style={{ '--stagger': `${Math.min(index, 11) * 28}ms` }}
              >
                <RecipeCard recipe={recipe} onOpen={setOpenRecipe} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <EmptyState
          icon="search"
          headline="Nothing matches those filters"
          body={`Nothing you have saved is ${activeTags.join(' and ')} at the same time.`}
          actionLabel="Clear filters"
          onAction={() => setActiveTags([])}
        />
      )}

      {openRecipe ? (
        <RecipeDetail
          key={openRecipe.id}
          recipe={openRecipe}
          onClose={() => setOpenRecipe(null)}
        />
      ) : null}
    </main>
  )
}
