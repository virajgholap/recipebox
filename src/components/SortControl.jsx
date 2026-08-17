import { useId } from 'react'
import Icon from './Icon'
import './SortControl.css'

/**
 * SortControl
 *
 * A labelled select. Native on purpose — a custom listbox would be the first
 * thing to drift out of sync with the rest of the system.
 */
export default function SortControl({ options, value, onChange, label = 'Sort' }) {
  const id = useId()

  return (
    <div className="sort-control">
      <label className="sort-control__label" htmlFor={id}>
        {label}
      </label>
      <div className="sort-control__field">
        <select
          id={id}
          className="sort-control__select"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" size={16} className="sort-control__chevron" />
      </div>
    </div>
  )
}
