import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * 外观（Appearance）settings section: 明暗模式切换 + 本地主题网格 + 壁纸遮罩
 * 强度滑块 + 自定义主题，悬停预览壁纸。选择写入持久化 settings。
 */
import { useState } from 'react';
import { Button, Slider } from "./ui/index.js";
import { useStore as useWallpaperStore, applySelection, setWeEffect } from "./wallpaper-layer.js";
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
/** Wallpaper Engine control block: pick a wallpaper and tune blur/scrim/border/glass. */
function WallpaperEngineBlock() {
    const sel = useWallpaperStore();
    const inventory = sel.inventory;
    const wallpapers = Array.isArray(inventory.wallpapers) ? inventory.wallpapers.filter((w) => w.playable) : [];
    return (_jsxs("div", { className: css.section, children: [_jsx("div", { className: css.sectionTitle, children: "\u58C1\u7EB8\u5F15\u64CE\uFF08Wallpaper Engine\uFF09" }), inventory.error
                ? _jsx("div", { className: css.hint, children: String(inventory.error) })
                : !sel.loaded
                    ? _jsx("div", { className: css.hint, children: "\u626B\u63CF\u4E2D\u2026" })
                    : (_jsxs(_Fragment, { children: [_jsxs("select", { className: css.textInput, value: sel.id, onChange: (e) => { applySelection(e.target.value); }, children: [_jsx("option", { value: "", children: "\u2014 \u65E0\uFF08\u5173\u95ED\uFF09\u2014" }), wallpapers.map((w) => (_jsx("option", { value: w.id, children: w.title }, w.id)))] }), _jsx(Slider, { label: "\u58C1\u7EB8\u6A21\u7CCA", value: sel.wallpaperBlur, min: 0, max: 60, step: 1, format: (v) => `${v}px`, onChange: (v) => { setWeEffect('wallpaperBlur', v); } }), _jsx(Slider, { label: "\u6697\u5316", value: sel.scrim, min: 0, max: 1, step: 0.01, onChange: (v) => { setWeEffect('scrim', Math.round(v * 100)); } }), _jsx(Slider, { label: "\u8FB9\u6846", value: sel.border, min: 0, max: 1, step: 0.01, onChange: (v) => { setWeEffect('border', Math.round(v * 100)); } }), _jsx(Slider, { label: "\u73BB\u7483", value: sel.blur, min: 0, max: 40, step: 1, format: (v) => `${v}px`, onChange: (v) => { setWeEffect('blur', v); } })] }))] }));
}
/**
 * Render the appearance settings section.
 * @param props - composed slot props.
 * @returns the section element tree.
 */
export function DreamSkinSettings({ useStore, presets, select, setScrimStrength, saveCustomTheme, }) {
    const preference = useStore(s => s.preference);
    const scrimStrength = useStore(s => s.scrimStrength);
    const [hovered, setHovered] = useState(null);
    const [custom, setCustom] = useState({
        wallpaperUrl: '',
        accent: '#c8a55a',
        background: '#111318',
        text: '#f0f0f0',
    });
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
                        }) })] }), _jsxs("div", { className: css.section, children: [_jsx("div", { className: css.sectionTitle, children: "\u7EC6\u8282" }), _jsx(Slider, { label: "\u58C1\u7EB8\u906E\u7F69\u5F3A\u5EA6", value: scrimStrength, onChange: setScrimStrength })] }), _jsxs("div", { className: css.section, children: [_jsx("div", { className: css.sectionTitle, children: "\u81EA\u5B9A\u4E49\u4E3B\u9898" }), _jsx("input", { className: css.textInput, type: "text", placeholder: "\u58C1\u7EB8 URL\uFF08https:// \u6216 data:image/...\uFF09", value: custom.wallpaperUrl, onChange: (e) => { setCustom(c => ({ ...c, wallpaperUrl: e.target.value })); } }), _jsxs("div", { className: css.colorRow, children: [_jsxs("label", { className: css.colorField, children: ["\u5F3A\u8C03", _jsx("input", { type: "color", value: custom.accent, onChange: (e) => { setCustom(c => ({ ...c, accent: e.target.value })); } })] }), _jsxs("label", { className: css.colorField, children: ["\u80CC\u666F", _jsx("input", { type: "color", value: custom.background, onChange: (e) => { setCustom(c => ({ ...c, background: e.target.value })); } })] }), _jsxs("label", { className: css.colorField, children: ["\u6587\u5B57", _jsx("input", { type: "color", value: custom.text, onChange: (e) => { setCustom(c => ({ ...c, text: e.target.value })); } })] })] }), _jsx(Button, { onClick: () => { saveCustomTheme(custom); }, children: "\u5E94\u7528\u81EA\u5B9A\u4E49\u4E3B\u9898" })] }), _jsx(WallpaperEngineBlock, {}), hoveredPreset?.wallpaper !== undefined && (_jsx("div", { className: css.preview, children: _jsx("img", { src: hoveredPreset.wallpaper.url, alt: "", draggable: false }) }))] }));
}
//# sourceMappingURL=DreamSkinSettings.js.map