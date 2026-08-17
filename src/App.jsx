import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Nav from './components/Nav'
import ThemeToggle from './components/ThemeToggle'
import AccountMenu from './components/AccountMenu'
import MyRecipes from './pages/MyRecipes'
import AuthPage from './pages/AuthPage'
import AuthCallback from './pages/AuthCallback'

const NAV_ITEMS = [{ id: 'recipes', label: 'My Recipes', to: '/' }]

export default function App() {
  const navigate = useNavigate()

  return (
    <>
      <Nav
        items={NAV_ITEMS}
        activeId="recipes"
        onNavigate={() => navigate('/')}
        actions={
          <>
            <ThemeToggle />
            <AccountMenu />
          </>
        }
      />

      <Routes>
        <Route path="/" element={<MyRecipes />} />
        {/* Same page — the :id just decides which recipe opens, so a recipe
            is a shareable URL rather than a state you cannot link to. */}
        <Route path="/recipe/:recipeId" element={<MyRecipes />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
