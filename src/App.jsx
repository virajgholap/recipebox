import { Route, Routes } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import ThemeToggle from './components/ThemeToggle'
import AccountMenu from './components/AccountMenu'
import MyRecipes from './pages/MyRecipes'
import AuthPage from './pages/AuthPage'
import AuthCallback from './pages/AuthCallback'
import AccountPage from './pages/AccountPage'
import NotFoundPage from './pages/NotFoundPage'
import { ForgotPasswordPage, ResetPasswordPage } from './pages/PasswordPage'
import { TermsPage, PrivacyPage } from './pages/LegalPage'

const NAV_ITEMS = [{ id: 'recipes', label: 'My Recipes', to: '/' }]

export default function App() {
  return (
    <div className="app-shell">
      <Nav
        items={NAV_ITEMS}
        activeId="recipes"
        actions={
          <>
            <ThemeToggle />
            <AccountMenu />
          </>
        }
      />

      <Routes>
        <Route path="/" element={<MyRecipes />} />
        {/* Same page — the :recipeId just decides which recipe opens, so a
            recipe is a shareable URL rather than a state you cannot link to. */}
        <Route path="/recipe/:recipeId" element={<MyRecipes />} />

        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/account" element={<AccountPage />} />

        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* A real 404 rather than a silent redirect, so a dead link looks dead. */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Footer />
    </div>
  )
}
