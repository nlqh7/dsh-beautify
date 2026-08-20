import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Token-styled knob: a fixed-width label, a range slider, and a stepless
 * number box with an optional unit suffix (the DeepSeek appearance-row
 * recipe). Writes go straight through on change, so the skin moves live.
 */
import css from './Knob.module.css';
/**
 * Render a token-styled knob row.
 * @param props - knob props.
 * @returns the labeled slider with a numeric readout.
 */
export function Knob({ label, value, min = 0, max = 1, step = 0.01, unit, onChange, disabled = false }) {
    const clamp = (n) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
    return (_jsxs("label", { className: `${css.knob}${disabled ? ` ${css.disabled}` : ''}`, children: [_jsx("span", { className: css.label, children: label }), _jsx("input", { className: css.slider, type: "range", min: min, max: max, step: step, value: value, disabled: disabled, onChange: (e) => { onChange(clamp(Number(e.target.value))); } }), _jsxs("span", { className: css.numberWrap, children: [_jsx("input", { className: css.number, type: "number", min: min, max: max, step: step, value: value, disabled: disabled, onChange: (e) => { onChange(clamp(Number(e.target.value))); } }), unit !== undefined && _jsx("span", { className: css.unit, children: unit })] })] }));
}
//# sourceMappingURL=Knob.js.map