import './Card.css'

/**
 * Card
 *
 * The surface wrapper. It owns background, border, radius and elevation and
 * nothing else — content and padding rhythm come from whatever renders inside.
 * Pass `interactive` for the hover lift used by the recipe grid.
 */
export default function Card({
  as: Tag = 'div',
  interactive = false,
  padding = 'md',
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag
      className={[
        'card',
        `card--pad-${padding}`,
        interactive ? 'card--interactive' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  )
}
