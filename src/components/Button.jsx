import './Button.css'

/**
 * Button
 *
 * Variants: `primary` (the one call to action on a surface) and `ghost`
 * (everything else — filters, secondary actions, toolbar controls).
 * Sizes: `sm` and `md`.
 */

export const BUTTON_VARIANTS = ['primary', 'ghost']

export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  fullWidth = false,
  className = '',
  children,
  ...rest
}) {
  const safeVariant = BUTTON_VARIANTS.includes(variant) ? variant : 'primary'

  return (
    <button
      type={type}
      className={[
        'button',
        `button--${safeVariant}`,
        `button--${size}`,
        fullWidth ? 'button--full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}
