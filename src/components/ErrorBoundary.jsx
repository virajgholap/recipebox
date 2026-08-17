import { Component } from 'react'
import { report } from '../lib/monitoring'
import './ErrorBoundary.css'

/**
 * ErrorBoundary
 *
 * Without this, one thrown error during render unmounts the whole tree and the
 * user gets a white page with nothing to click. This catches it, says so, and
 * offers a way out.
 *
 * Still a class: React has no hook equivalent of componentDidCatch.
 */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    report(error, { kind: 'render', componentStack: info?.componentStack })
  }

  handleReset = () => {
    this.setState({ error: null })
    window.location.assign('/')
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="error-boundary">
        <div className="error-boundary__inner">
          <h1>Something broke</h1>
          <p>
            An unexpected error stopped the page from rendering. Nothing you saved is affected —
            your recipes and progress live in the database, not in this page.
          </p>
          <pre className="error-boundary__detail">{String(this.state.error?.message ?? this.state.error)}</pre>
          <button type="button" onClick={this.handleReset}>
            Back to my recipes
          </button>
        </div>
      </main>
    )
  }
}
