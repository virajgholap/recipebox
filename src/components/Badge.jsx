import './Badge.css'

/**
 * Badge
 *
 * A small status pill. Colour is never passed in — it comes from `variant`,
 * which maps to a token set in tokens.css. If you need a new colour, add a
 * variant here rather than styling a Badge from the outside.
 */

export const BADGE_VARIANTS = ['success', 'warning', 'info', 'neutral']

export default function Badge({ variant = 'neutral', children, className = '', ...rest }) {
  const safeVariant = BADGE_VARIANTS.includes(variant) ? variant : 'neutral'

  return (
    <span
      className={`badge badge--${safeVariant} ${className}`.trim()}
      data-variant={safeVariant}
      {...rest}
    >
      {children}
    </span>
  )
}
