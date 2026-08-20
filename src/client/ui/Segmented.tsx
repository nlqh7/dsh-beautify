/**
 * Token-styled segmented picker: an evenly split hairline frame whose cells
 * highlight the active option with the business state tint.
 */
import css from './Segmented.module.css'

export interface SegmentedOption<T extends string> {
  id: T
  label: string
}

export interface SegmentedProps<T extends string> {
  /** Accessible name for the button group. */
  label: string
  value: T
  options: readonly SegmentedOption<T>[]
  onSelect: (value: T) => void
}

/**
 * Render a segmented picker.
 * @param props - segmented props.
 * @returns the button group.
 */
export function Segmented<T extends string>({ label, value, options, onSelect }: SegmentedProps<T>) {
  return (
    <div className={css.segmented} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={option.id === value ? `${css.seg} ${css.active}` : css.seg}
          aria-pressed={option.id === value}
          onClick={() => { onSelect(option.id) }}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}