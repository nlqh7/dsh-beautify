import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * shadcn-style token slider: a range input styled with `--dsw-*` aliases. The
 * value is shown as a percentage next to the label.
 */
import css from './Slider.module.css';
/**
 * Render a token-styled slider.
 * @param props - slider props.
 * @returns the labeled range input.
 */
export function Slider({ value, min = 0, max = 1, step = 0.01, label, onChange, format }) {
    const display = format === undefined ? `${Math.round(value * 100)}%` : format(value);
    return (_jsxs("label", { className: css.row, children: [_jsxs("span", { className: css.label, children: [label, "\uFF1A", display] }), _jsx("input", { className: css.input, type: "range", min: min, max: max, step: step, value: value, onChange: (e) => { onChange(Number(e.target.value)); } })] }));
}
//# sourceMappingURL=Slider.js.map