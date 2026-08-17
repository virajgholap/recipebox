import './StepList.css'

/**
 * StepList
 *
 * Numbered steps you tap to complete. In cook mode everything but the current
 * step dims right back and the current one grows — straight out of Mela, and
 * the single most useful thing a recipe app does once your hands are wet.
 */
export default function StepList({
  steps,
  doneIndexes = [],
  onToggle,
  cookMode = false,
  currentIndex = 0,
}) {
  return (
    <ol className={`step-list ${cookMode ? 'step-list--cooking' : ''}`.trim()}>
      {steps.map((step, index) => {
        const isDone = doneIndexes.includes(index)
        const isCurrent = cookMode && index === currentIndex

        return (
          <li
            key={step}
            className={[
              'step',
              isDone ? 'step--done' : '',
              isCurrent ? 'step--current' : '',
              cookMode && !isCurrent ? 'step--dimmed' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <button type="button" className="step__button" aria-pressed={isDone} onClick={() => onToggle(index)}>
              <span className="step__number" aria-hidden="true">
                {index + 1}
              </span>
              <span className="step__text">{step}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
