import { useState } from 'react'
import Nav from './components/Nav'
import ThemeToggle from './components/ThemeToggle'
import MyRecipes from './pages/MyRecipes'

const NAV_ITEMS = [{ id: 'recipes', label: 'My Recipes' }]

export default function App() {
  const [page, setPage] = useState('recipes')

  return (
    <>
      <Nav items={NAV_ITEMS} activeId={page} onNavigate={setPage} actions={<ThemeToggle />} />
      {page === 'recipes' ? <MyRecipes /> : null}
    </>
  )
}
