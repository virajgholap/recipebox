import './PageHeader.css'

/**
 * PageHeader
 *
 * Title, optional subtitle, optional right-side slot. The slot is where page
 * level controls go (sort, actions) so they sit on the header baseline rather
 * than floating above the content.
 */
export default function PageHeader({ title, subtitle, actions, className = '' }) {
  return (
    <header className={`page-header ${className}`.trim()}>
      <div className="page-header__text">
        <h1 className="page-header__title">{title}</h1>
        {subtitle ? <p className="page-header__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  )
}
