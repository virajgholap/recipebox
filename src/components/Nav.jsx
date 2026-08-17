import Icon from './Icon'
import './Nav.css'

/**
 * Nav
 *
 * The app bar. `items` is a list of `{ id, label }`; the one matching
 * `activeId` renders as current. `actions` is a right-side slot.
 */
export default function Nav({ items = [], activeId, onNavigate, actions }) {
  return (
    <nav className="nav" aria-label="Main">
      <div className="layout nav__inner">
        <a className="nav__brand" href="#/">
          <span className="nav__brand-mark" aria-hidden="true">
            <Icon name="bowl" size={18} />
          </span>
          <span className="nav__brand-text">Recipe Box</span>
        </a>

        <ul className="nav__links">
          {items.map((item) => {
            const isActive = item.id === activeId
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`nav__link ${isActive ? 'nav__link--active' : ''}`.trim()}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onNavigate?.(item.id)}
                >
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>

        {actions ? <div className="nav__actions">{actions}</div> : null}
      </div>
    </nav>
  )
}
