import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Token-styled segmented picker: an evenly split hairline frame whose cells
 * highlight the active option with the business state tint.
 */
import css from './Segmented.module.css';
/**
 * Render a segmented picker.
 * @param props - segmented props.
 * @returns the button group.
 */
export function Segmented({ label, value, options, onSelect }) {
    return (_jsx("div", { className: css.segmented, role: "group", "aria-label": label, children: options.map((option) => (_jsx("button", { type: "button", className: option.id === value ? `${css.seg} ${css.active}` : css.seg, "aria-pressed": option.id === value, onClick: () => { onSelect(option.id); }, children: option.label }, option.id))) }));
}
//# sourceMappingURL=Segmented.js.map