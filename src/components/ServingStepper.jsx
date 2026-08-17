import './ServingStepper.css'

/**
 * ServingStepper
 *
 * Change the yield and every quantity rescales. The original yield is kept
 * visible as a reset, because the most common thing you want after doubling a
 * recipe is to undo doubling it.
 *
 * The − and + buttons call `onChange` with an updater rather than a number:
 * two clicks inside one render frame would otherwise both compute their next
 * value from the same stale `value` and the second would be swallowed.
 */
export default function ServingStepper({ value, baseValue, min = 1, max = 24, onChange }) {
  return (
    <div className="serving-stepper">
      <span className="serving-stepper__label">Servings</span>

      <div className="serving-stepper__control">
        <button
          type="button"
          className="serving-stepper__button"
          aria-label="Fewer servings"
          disabled={value <= min}
          onClick={() => onChange((current) => Math.max(min, current - 1))}
        >
          −
        </button>

        <span className="serving-stepper__value" aria-live="polite">
          {value}
        </span>

        <button
          type="button"
          className="serving-stepper__button"
          aria-label="More servings"
          disabled={value >= max}
          onClick={() => onChange((current) => Math.min(max, current + 1))}
        >
          +
        </button>
      </div>

      {value !== baseValue ? (
        <button type="button" className="serving-stepper__reset" onClick={() => onChange(baseValue)}>
          Reset to {baseValue}
        </button>
      ) : null}
    </div>
  )
}
