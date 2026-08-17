import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import ThemeToggle from './components/ThemeToggle'
import AccountMenu from './components/AccountMenu'
import MyRecipes from './pages/MyRecipes'

/**
 * The grid is what everyone lands on, so it stays in the main bundle. Auth,
 * legal, and account pages are visited rarely and by a minority of people —
 * they load on demand instead of being paid for by every first visit.
 */
const AuthPage = lazy(() => import('./pages/AuthPage'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const ForgotPasswordPage = lazy(() =>
  import('./pages/PasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
)
const ResetPasswordPage = lazy(() =>
  import('./pages/PasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
)
const TermsPage = lazy(() => import('./pages/LegalPage').then((m) => ({ default: m.TermsPage })))
const PrivacyPage = lazy(() =>
  import('./pages/LegalPage').then((m) => ({ default: m.PrivacyPage })),
)

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

      <Suspense fallback={<div className="route-fallback" aria-busy="true" />}>
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
      </Suspense>

      <Footer />
    </div>
  )
}
