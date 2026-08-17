import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import SortControl from '../components/SortControl'
import SegmentedControl from '../components/SegmentedControl'
import RecipeCard from '../components/RecipeCard'
import RecipeDetail from '../components/RecipeDetail'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import AddRecipeDialog from '../components/AddRecipeDialog'
import { fetchRecipes } from '../lib/recipesRepo'
import { fetchUserRecipes } from '../lib/userRecipes'
import { useAuth } from '../context/AuthContext'
import { CUISINE_OPTIONS, SORT_OPTIONS, filterAndSortRecipes, getTagOptions } from '../lib/recipes'
import './MyRecipes.css'

export default function MyRecipes() {
  const { recipeId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [catalogue, setCatalogue] = useState([])
  const [mine, setMine] = useState([])
  const [status, setStatus] = useState('loading')
  const [activeTags, setActiveTags] = useState([])
  const [cuisine, setCuisine] = useState('all')
  const [sort, setSort] = useState('recent')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    let active = true

    fetchRecipes().then(({ recipes }) => {
      if (!active) return
      setCatalogue(recipes)
      setStatus('ready')
    })

    return () => {
      active = false
    }
  }, [])

  // Your own saves load separately — the catalogue should not wait on them,
  // and signing in or out should refresh them without refetching everything.
  useEffect(() => {
    let active = true

    if (!user) {
      setMine([])
      return undefined
    }

    fetchUserRecipes(user.id).then((recipes) => {
      if (active) setMine(recipes)
    })

    return () => {
      active = false
    }
  }, [user?.id])

  // Yours first, so a recipe you just added is not buried under twenty others.
  const allRecipes = useMemo(() => [...mine, ...catalogue], [mine, catalogue])

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
          <>
            <SortControl options={SORT_OPTIONS} value={sort} onChange={setSort} label="Sort by" />
            <Button size="sm" onClick={() => setAdding(true)}>
              Add recipe
            </Button>
          </>
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

      <AddRecipeDialog
        open={adding}
        onClose={() => setAdding(false)}
        onSaved={(recipe) => {
          // Replace rather than prepend: re-adding a URL upserts, so the same
          // recipe coming back should not appear twice.
          setMine((current) => [recipe, ...current.filter((item) => item.id !== recipe.id)])
          navigate(`/recipe/${recipe.id}`)
        }}
      />
    </main>
  )
}
