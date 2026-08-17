/**
 * shadcn-style token slider: a range input styled with `--dsw-*` aliases. The
 * value is shown as a percentage next to the label.
 */
import css from './Slider.module.css'

export interface SliderProps {
  /** Current value. */
  value: number
  /** Minimum (default 0). */
  min?: number
  /** Maximum (default 1). */
  max?: number
  /** Step (default 0.01). */
  step?: number
  /** Visible label; the current value is appended as a percentage. */
  label: string
  /** Change callback with the new numeric value. */
  onChange: (value: number) => void
}

/**
 * Render a token-styled slider.
 * @param props - slider props.
 * @returns the labeled range input.
 */
export function Slider({ value, min = 0, max = 1, step = 0.01, label, onChange }: SliderProps) {
  return (
    <label className={css.row}>
      <span className={css.label}>{label}：{Math.round(value * 100)}%</span>
      <input
        className={css.input}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => { onChange(Number(e.target.value)) }}
      />
    </label>
  )
}
