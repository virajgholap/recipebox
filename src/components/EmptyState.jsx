import Button from './Button'
import Icon from './Icon'
import './EmptyState.css'

/**
 * EmptyState
 *
 * Icon, headline, one line of body copy, optional action. Keep the body to a
 * single sentence — if it needs two, the headline is wrong.
 */
export default function EmptyState({
  icon = 'search',
  headline,
  body,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`.trim()}>
      <span className="empty-state__icon">
        <Icon name={icon} size={24} />
      </span>
      <h2 className="empty-state__headline">{headline}</h2>
      {body ? <p className="empty-state__body">{body}</p> : null}
      {actionLabel && onAction ? (
        <Button variant="ghost" size="sm" onClick={onAction} className="empty-state__action">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
