import { jsx as _jsx } from "react/jsx-runtime";
import css from './Button.module.css';
/**
 * Render a token-styled button.
 * @param props - button props.
 * @returns the button element.
 */
export function Button({ children, onClick, selected, variant = 'default', className }) {
    const cls = [
        css.button,
        variant === 'ghost' ? css.ghost : '',
        selected === true ? css.selected : '',
        className ?? '',
    ].filter(Boolean).join(' ');
    return (_jsx("button", { type: "button", className: cls, "aria-pressed": selected, onClick: onClick, children: children }));
}
//# sourceMappingURL=Button.js.map