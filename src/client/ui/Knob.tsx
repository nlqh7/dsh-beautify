/**
 * Token-styled knob: a fixed-width label, a range slider, and a stepless
 * number box with an optional unit suffix (the DeepSeek appearance-row
 * recipe). Writes go straight through on change, so the skin moves live.
 */
import css from './Knob.module.css'

export interface KnobProps {
  /** Visible label, fixed 92px column. */
  label: string
  /** Current value. */
  value: number
  /** Minimum (default 0). */
  min?: number
  /** Maximum (default 1). */
  max?: number
  /** Step (default 0.01). */
  step?: number
  /** Unit suffix for the number box (e.g. `px`, `%`, `°`). */
  unit?: string
  /** Change callback with the new numeric value. */
  onChange: (value: number) => void
  /** Disable the input (dimmed, no drag). */
  disabled?: boolean
}

/**
 * Render a token-styled knob row.
 * @param props - knob props.
 * @returns the labeled slider with a numeric readout.
 */
export function Knob({ label, value, min = 0, max = 1, step = 0.01, unit, onChange, disabled = false }: KnobProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : min))
  return (
    <label className={`${css.knob}${disabled ? ` ${css.disabled}` : ''}`}>
      <span className={css.label}>{label}</span>
      <input
        className={css.slider}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => { onChange(clamp(Number(e.target.value))) }}
      />
      <span className={css.numberWrap}>
        <input
          className={css.number}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => { onChange(clamp(Number(e.target.value))) }}
        />
        {unit !== undefined && <span className={css.unit}>{unit}</span>}
      </span>
    </label>
  )
}