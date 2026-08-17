import SegmentedControl from './SegmentedControl'
import './SortControl.css'

/**
 * SortControl
 *
 * The sort options, built on SegmentedControl. There are only two, so a select
 * hid both of them behind a click for no reason. Same props as before.
 */
export default function SortControl({ options, value, onChange, label = 'Sort' }) {
  return (
    <div className="sort-control">
      <span className="sort-control__label">{label}</span>
      <SegmentedControl options={options} value={value} onChange={onChange} label={label} />
    </div>
  )
}
