import './SegmentedControl.css'

/**
 * SegmentedControl
 *
 * A small set of mutually exclusive options, all visible at once. Use it when
 * there are two or three choices and the cost of hiding them behind a menu is
 * higher than the space they take.
 */
export default function SegmentedControl({ options, value, onChange, label }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={`segmented__option ${isActive ? 'segmented__option--active' : ''}`.trim()}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
