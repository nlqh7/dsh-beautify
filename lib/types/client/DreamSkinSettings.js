import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import css from './DreamSkinSettings.module.css';
/** Preference ids that mean "not a Dream Skin preset". */
const DEFAULT_IDS = new Set(['system', 'light', 'dark']);
/**
 * Render the Dream Skin settings section.
 * @param props - composed slot props.
 * @returns the section element tree.
 */
export function DreamSkinSettings({ useStore, presets, select }) {
    const preference = useStore(s => s.preference);
    const isDefault = DEFAULT_IDS.has(preference);
    return (_jsxs("div", { className: css.root, children: [_jsx("div", { className: css.hint, children: "\u9009\u62E9\u4E00\u5957 Dream Skin \u4E3B\u9898\uFF0C\u70B9\u51FB\u5373\u5E94\u7528\u3002" }), _jsxs("button", { type: "button", className: isDefault ? `${css.card} ${css.selected}` : css.card, "aria-pressed": isDefault, onClick: () => { select('system'); }, children: [_jsx("span", { className: css.swatchRow, children: _jsx("span", { className: css.swatch, style: { background: 'transparent', border: '1px dashed var(--dsw-alias-label-secondary)' } }) }), "\u8DDF\u968F\u7CFB\u7EDF"] }), presets.map((p) => {
                const selected = preference === p.id;
                return (_jsxs("button", { type: "button", className: selected ? `${css.card} ${css.selected}` : css.card, "aria-pressed": selected, onClick: () => { select(p.id); }, children: [_jsx("span", { className: css.swatchRow, children: p.swatches.map((color) => (_jsx("span", { className: css.swatch, style: { background: color } }, color))) }), p.label] }, p.id));
            })] }));
}
//# sourceMappingURL=DreamSkinSettings.js.map