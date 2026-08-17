import './FilterBar.css'

/**
 * FilterBar
 *
 * A row of tag chips. Multi-select, and the selected tags combine with AND —
 * "Vegetarian + Weekend" is a real question with a real (empty) answer.
 *
 * `options` is a list of `{ value, label, count }`. The option with a `value`
 * of `null` is the "All" chip, which clears the selection.
 */
export default function FilterBar({ options, values = [], onToggle, label = 'Filter by tag' }) {
  return (
    <div className="filter-bar" role="group" aria-label={label}>
      <span className="filter-bar__label">{label}</span>
      <div className="filter-bar__options">
        {options.map((option) => {
          const isAll = option.value === null
          const isActive = isAll ? values.length === 0 : values.includes(option.value)

          return (
            <button
              key={option.value ?? 'all'}
              type="button"
              className={`filter-chip ${isActive ? 'filter-chip--active' : ''}`.trim()}
              aria-pressed={isActive}
              onClick={() => onToggle(option.value)}
            >
              {option.label}
              {typeof option.count === 'number' ? (
                <span className="filter-chip__count">{option.count}</span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
