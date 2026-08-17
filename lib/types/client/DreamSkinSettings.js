import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * 外观（Appearance）settings section: 明暗模式切换 + 本地主题网格，悬停预览
 * 壁纸。选择写入持久化 settings（通过 injected select 回调）。
 */
import { useState } from 'react';
import css from './DreamSkinSettings.module.css';
/** Built-in light/dark/system modes shown above the theme grid. */
const MODES = [
    { id: 'system', label: '跟随系统' },
    { id: 'light', label: '浅色' },
    { id: 'dark', label: '深色' },
];
/** Lucide-style palette icon. */
function PaletteIcon() {
    return (_jsxs("svg", { viewBox: "0 0 24 24", width: "16", height: "16", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("path", { d: "M12 22a10 10 0 1 1 10-10c0 1.7-1.3 3-3 3h-2.5a2.5 2.5 0 0 0-2.5 2.5c0 .7.3 1.3.7 1.7.4.4.6.9.6 1.4A1.4 1.4 0 0 1 12 22z" }), _jsx("circle", { cx: "7.5", cy: "11.5", r: "1.5" }), _jsx("circle", { cx: "11", cy: "7.5", r: "1.5" }), _jsx("circle", { cx: "15.5", cy: "8.5", r: "1.5" })] }));
}
/**
 * Render the appearance settings section.
 * @param props - composed slot props.
 * @returns the section element tree.
 */
export function DreamSkinSettings({ useStore, presets, select }) {
    const preference = useStore(s => s.preference);
    const [hovered, setHovered] = useState(null);
    const hoveredPreset = hovered === null
        ? undefined
        : presets.find(p => p.id === hovered && p.wallpaper !== undefined);
    return (_jsxs("div", { className: css.root, children: [_jsxs("div", { className: css.header, children: [_jsx(PaletteIcon, {}), _jsx("span", { children: "\u5916\u89C2" })] }), _jsxs("div", { className: css.section, children: [_jsx("div", { className: css.sectionTitle, children: "\u660E\u6697\u6A21\u5F0F" }), _jsx("div", { className: css.modeRow, children: MODES.map((mode) => {
                            const selected = preference === mode.id;
                            return (_jsx("button", { type: "button", className: selected ? `${css.modeButton} ${css.selected}` : css.modeButton, "aria-pressed": selected, onClick: () => { select(mode.id); }, children: mode.label }, mode.id));
                        }) })] }), _jsxs("div", { className: css.section, children: [_jsx("div", { className: css.sectionTitle, children: "\u4E3B\u9898" }), _jsx("div", { className: css.grid, children: presets.map((p) => {
                            const selected = preference === p.id;
                            const style = p.wallpaper !== undefined
                                ? {
                                    backgroundImage: `url("${p.wallpaper.url}")`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: `${Math.round(p.wallpaper.focusX * 100)}% ${Math.round(p.wallpaper.focusY * 100)}%`,
                                }
                                : { background: `linear-gradient(135deg, ${p.swatches[0]}, ${p.swatches[1]})` };
                            return (_jsxs("button", { type: "button", className: selected ? `${css.tile} ${css.selected}` : css.tile, "aria-pressed": selected, onClick: () => { select(p.id); }, onMouseEnter: () => { setHovered(p.id); }, onMouseLeave: () => { setHovered(null); }, children: [_jsx("span", { className: css.tilePreview, style: style }), _jsx("span", { className: css.tileLabel, children: p.label })] }, p.id));
                        }) })] }), hoveredPreset?.wallpaper !== undefined && (_jsx("div", { className: css.preview, children: _jsx("img", { src: hoveredPreset.wallpaper.url, alt: "", draggable: false }) }))] }));
}
//# sourceMappingURL=DreamSkinSettings.js.map