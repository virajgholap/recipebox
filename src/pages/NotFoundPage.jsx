import EmptyState from '../components/EmptyState'
import { useNavigate } from 'react-router-dom'
import './NotFoundPage.css'

/**
 * A real 404.
 *
 * The catch-all route used to redirect silently to the grid, which told the
 * user nothing — a mistyped or dead link looked identical to a working one.
 */
export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <main className="layout not-found">
      <EmptyState
        icon="search"
        headline="That page does not exist"
        body="The link may be out of date, or the recipe it pointed to has been removed."
        actionLabel="Back to my recipes"
        onAction={() => navigate('/')}
      />
    </main>
  )
}
