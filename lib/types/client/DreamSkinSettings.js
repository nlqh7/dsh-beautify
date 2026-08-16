import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Dream Skin settings section: the shipped presets as cards with preview
 * swatches, a "follow system" reset, and a hover wallpaper preview. Selection
 * reads the persisted preference (never the resolved active theme) and writes
 * through the injected select callback.
 */
import { useState } from 'react';
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
    const [hovered, setHovered] = useState(null);
    const isDefault = DEFAULT_IDS.has(preference);
    const hoveredPreset = hovered === null
        ? undefined
        : presets.find(p => p.id === hovered && p.wallpaper !== undefined);
    return (_jsxs("div", { className: css.root, children: [_jsx("div", { className: css.hint, children: "\u9009\u62E9\u4E00\u5957 Dream Skin \u4E3B\u9898\uFF0C\u60AC\u505C\u9884\u89C8\u58C1\u7EB8\uFF0C\u70B9\u51FB\u5373\u5E94\u7528\u3002" }), _jsxs("button", { type: "button", className: isDefault ? `${css.card} ${css.selected}` : css.card, "aria-pressed": isDefault, onClick: () => { select('system'); }, children: [_jsx("span", { className: css.swatchRow, children: _jsx("span", { className: css.swatch, style: { background: 'transparent', border: '1px dashed var(--dsw-alias-label-secondary)' } }) }), "\u8DDF\u968F\u7CFB\u7EDF"] }), presets.map((p) => {
                const selected = preference === p.id;
                return (_jsxs("button", { type: "button", className: selected ? `${css.card} ${css.selected}` : css.card, "aria-pressed": selected, onClick: () => { select(p.id); }, onMouseEnter: () => { setHovered(p.id); }, onMouseLeave: () => { setHovered(null); }, children: [_jsx("span", { className: css.swatchRow, children: p.swatches.map((color) => (_jsx("span", { className: css.swatch, style: { background: color } }, color))) }), p.label] }, p.id));
            }), hoveredPreset?.wallpaper !== undefined && (_jsx("div", { className: css.preview, children: _jsx("img", { src: hoveredPreset.wallpaper.url, alt: "", draggable: false }) }))] }));
}
//# sourceMappingURL=DreamSkinSettings.js.map