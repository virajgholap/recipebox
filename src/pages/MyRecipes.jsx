import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import SortControl from '../components/SortControl'
import SegmentedControl from '../components/SegmentedControl'
import RecipeCard from '../components/RecipeCard'
import RecipeDetail from '../components/RecipeDetail'
import EmptyState from '../components/EmptyState'
import { fetchRecipes } from '../lib/recipesRepo'
import { CUISINE_OPTIONS, SORT_OPTIONS, filterAndSortRecipes, getTagOptions } from '../lib/recipes'
import './MyRecipes.css'

export default function MyRecipes() {
  const { recipeId } = useParams()
  const navigate = useNavigate()

  const [allRecipes, setAllRecipes] = useState([])
  const [status, setStatus] = useState('loading')
  const [activeTags, setActiveTags] = useState([])
  const [cuisine, setCuisine] = useState('all')
  const [sort, setSort] = useState('recent')

  useEffect(() => {
    let active = true

    fetchRecipes().then(({ recipes }) => {
      if (!active) return
      setAllRecipes(recipes)
      setStatus('ready')
    })

    return () => {
      active = false
    }
  }, [])

  const tagOptions = useMemo(() => getTagOptions(allRecipes), [allRecipes])
  const visible = useMemo(
    () => filterAndSortRecipes(allRecipes, { tags: activeTags, cuisine, sort }),
    [allRecipes, activeTags, cuisine, sort],
  )

  const openRecipe = useMemo(
    () => allRecipes.find((recipe) => recipe.id === recipeId) ?? null,
    [allRecipes, recipeId],
  )

  // A URL for a recipe that does not exist should not leave the user staring at
  // a grid wondering why nothing opened.
  useEffect(() => {
    if (status === 'ready' && recipeId && !openRecipe) navigate('/', { replace: true })
  }, [status, recipeId, openRecipe, navigate])

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

  function clearFilters() {
    setActiveTags([])
    setCuisine('all')
  }

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
        <div className="my-recipes__cuisines">
          <span className="my-recipes__controls-label">Cuisine</span>
          <SegmentedControl
            options={CUISINE_OPTIONS}
            value={cuisine}
            onChange={setCuisine}
            label="Filter by cuisine"
          />
        </div>
        <FilterBar options={tagOptions} values={activeTags} onToggle={handleToggleTag} />
      </div>

      {status === 'loading' ? (
        <ul className="my-recipes__grid" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <li key={index} className="my-recipes__skeleton" />
          ))}
        </ul>
      ) : visible.length > 0 ? (
        <>
          <p className="my-recipes__count" role="status">
            {visible.length} {visible.length === 1 ? 'recipe' : 'recipes'}
            {activeTags.length > 0 ? ` tagged ${activeTags.join(' + ')}` : ''}
          </p>

          <ul className="my-recipes__grid">
            {visible.map((recipe, index) => (
              <li
                key={recipe.id}
                className="my-recipes__grid-item"
                style={{ '--stagger': `${Math.min(index, 11) * 28}ms` }}
              >
                <RecipeCard recipe={recipe} onOpen={(next) => navigate(`/recipe/${next.id}`)} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <EmptyState
          icon="search"
          headline="Nothing matches those filters"
          body="Nothing you have saved fits all of those at once. Try loosening one."
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      )}

      {openRecipe ? (
        <RecipeDetail key={openRecipe.id} recipe={openRecipe} onClose={() => navigate('/')} />
      ) : null}
    </main>
  )
}
