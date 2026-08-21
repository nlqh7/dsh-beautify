import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * 外观（Appearance）settings section: 明暗模式切换 + 本地主题网格 + 壁纸遮罩
 * 强度滑块 + 自定义主题，悬停预览壁纸。选择写入持久化 settings。
 */
import { useEffect, useState } from 'react';
import { CURSOR_UPLOAD_STATES, readCursorUploads } from "./cursor-images.js";
import { Button, Knob, Modal, Segmented } from "./ui/index.js";
import { DEFAULT_SCRIM_STRENGTH } from "../dream-settings.js";
import { readGlass, readWallpaper, setGlass, setWeEffect, useStore as useWallpaperStore, applySelection, loadInventory } from "./wallpaper-layer.js";
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
/** Wallpaper Engine control block: pick a wallpaper in a modal; tuning lives in 美化参数. */
function WallpaperEngineBlock() {
    const sel = useWallpaperStore();
    const [open, setOpen] = useState(false);
    const wallpapers = Array.isArray(sel.inventory.wallpapers) ? sel.inventory.wallpapers.filter(w => w.playable) : [];
    const openPicker = () => {
        if (!sel.loaded)
            void loadInventory();
        setOpen(true);
    };
    return (_jsxs("div", { className: css.section, children: [_jsxs("button", { type: "button", className: css.groupHeader, "aria-haspopup": "dialog", "aria-expanded": open, onClick: openPicker, children: [_jsx("span", { className: css.groupHeaderText, children: "\u58C1\u7EB8\u5F15\u64CE\uFF08Wallpaper Engine\uFF09" }), _jsxs("span", { className: css.groupHeaderActions, children: [_jsxs("span", { className: css.groupCount, children: [wallpapers.length, " \u5F20"] }), _jsx("span", { className: css.groupGo, children: "\u9009\u62E9" })] })] }), _jsx(Modal, { open: open, title: "\u58C1\u7EB8\u5F15\u64CE", onClose: () => { setOpen(false); }, className: css.pickerModal, children: sel.inventory.error
                    ? _jsx("div", { className: css.hint, children: String(sel.inventory.error) })
                    : !sel.loaded
                        ? _jsx("div", { className: css.hint, children: "\u626B\u63CF\u4E2D\u2026" })
                        : (_jsxs(_Fragment, { children: [_jsx("div", { className: css.weGrid, children: wallpapers.map(w => (_jsxs("button", { type: "button", className: sel.id === w.id ? `${css.weTile} ${css.selected}` : css.weTile, "aria-pressed": sel.id === w.id, onClick: () => { applySelection(w.id); }, title: w.title, children: [w.preview
                                                ? _jsx("img", { className: css.weTileImage, src: w.preview, alt: w.title, loading: "lazy" })
                                                : _jsx("span", { className: css.weTileNoPreview, children: w.title }), _jsx("span", { className: css.weTileLabel, children: w.title })] }, w.id))) }), _jsx(Button, { onClick: () => { loadInventory(); }, children: "\u5237\u65B0" })] })) })] }));
}
/**
 * Theme-tile grid for one group of presets.
 * @param presets - the presets to render.
 * @param preference - the currently selected theme id.
 * @param select - switch-theme callback.
 * @returns the tile grid JSX.
 */
function themeTiles(presets, preference, select) {
    return (_jsx("div", { className: css.grid, children: presets.map((p) => {
            const selected = preference === p.id;
            const style = p.wallpaper !== undefined
                ? {
                    backgroundImage: `url("${p.wallpaper.thumb ?? p.wallpaper.url}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: `${Math.round(p.wallpaper.focusX * 100)}% ${Math.round(p.wallpaper.focusY * 100)}%`,
                }
                : undefined;
            return (_jsx("button", { type: "button", className: selected ? `${css.tile} ${css.selected}` : css.tile, "aria-pressed": selected, onClick: () => { select(p.id); }, children: p.wallpaper !== undefined
                    ? (_jsxs(_Fragment, { children: [_jsx("span", { className: css.tilePreview, style: style }), _jsx("span", { className: css.tileLabel, children: p.label })] }))
                    : (_jsxs("span", { className: css.solidRow, children: [_jsx("span", { className: css.solidLabel, children: p.label }), _jsxs("span", { className: css.solidSwatches, children: [_jsx("span", { className: css.solidSwatch, style: { background: p.palette.background }, title: "\u80CC\u666F" }), _jsx("span", { className: css.solidSwatch, style: { background: p.palette.accent }, title: "\u5F3A\u8C03" }), _jsx("span", { className: css.solidSwatch, style: { background: p.palette.text }, title: "\u6587\u5B57" })] })] })) }, p.id));
        }) }));
}
/**
 * Wallpaper-theme picker in a centered modal: the wallpaper preset grid opens
 * on demand (not on settings open), so the settings section stays light and
 * the full-size wallpaper images are only decoded while the modal is open.
 * Tiles render the downscaled `thumb`; the full image is applied on select.
 * @param props.presets - the wallpaper presets to show.
 * @param props.preference - the currently selected theme id.
 * @param props.select - switch-theme callback.
 * @returns the section with the modal-trigger row.
 */
function WallpaperThemesPicker({ presets, preference, select }) {
    const [open, setOpen] = useState(false);
    return (_jsxs("div", { className: css.section, children: [_jsxs("button", { type: "button", className: css.groupHeader, "aria-haspopup": "dialog", "aria-expanded": open, onClick: () => { setOpen(true); }, children: [_jsx("span", { className: css.groupHeaderText, children: "\u58C1\u7EB8\u4E3B\u9898" }), _jsxs("span", { className: css.groupHeaderActions, children: [_jsxs("span", { className: css.groupCount, children: [presets.length, " \u5F20"] }), _jsx("span", { className: css.groupGo, children: "\u9009\u62E9" })] })] }), _jsx(Modal, { open: open, title: "\u58C1\u7EB8\u4E3B\u9898", onClose: () => { setOpen(false); }, className: css.pickerModal, children: themeTiles(presets, preference, (id) => { select(id); setOpen(false); }) })] }));
}
/**
 * Render the appearance settings section.
 * @param props - composed slot props.
 * @returns the section element tree.
 */
/** One uploadable cursor state row inside the custom-skin section. */
function CursorUploadRow({ state, label, onSave, }) {
    const [dataUrl, setDataUrl] = useState(() => readCursorUploads()[state] ?? null);
    const pick = (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            const url = String(reader.result);
            setDataUrl(url);
            onSave(state, url);
        };
        reader.readAsDataURL(file);
    };
    const remove = () => {
        setDataUrl(null);
        onSave(state, null);
    };
    return (_jsxs("div", { className: css.uploadRow, children: [_jsx("span", { className: css.uploadLabel, children: label }), dataUrl !== null && (_jsx("img", { className: css.uploadThumb, src: dataUrl, alt: label })), _jsxs("label", { className: css.uploadBtn, children: ["\u9009\u62E9\u56FE\u7247", _jsx("input", { type: "file", accept: "image/png,image/webp,image/jpeg", hidden: true, onChange: pick })] }), dataUrl !== null && (_jsx(Button, { onClick: remove, children: "\u79FB\u9664" }))] }));
}
export function DreamSkinSettings({ useStore, presets, select, saveCustomTheme, tweak, resetTweak: resetTweakFn, setCursorEnabled, setCursorSkin, setCursorSize, saveCursorUpload, setCursorStateOverride, }) {
    const preference = useStore(s => s.preference);
    const cursorEnabled = useStore(s => s.cursorEnabled);
    const cursorSkin = useStore(s => s.cursorSkin);
    const cursorSize = useStore(s => s.cursorSize);
    const cursorStateOverrides = useStore(s => s.cursorStateOverrides);
    const sel = useWallpaperStore();
    // Host-side feature health (wallpaper engine / balance whale), shown as a
    // visible notice when something failed to mount.
    const [featureStatus, setFeatureStatus] = useState(null);
    useEffect(() => {
        let cancelled = false;
        fetch('/dsh-beautify/status.json', { cache: 'no-store' })
            .then(res => (res.ok ? res.json() : null))
            .then((data) => {
            if (!cancelled)
                setFeatureStatus(data);
        })
            .catch(() => { });
        return () => { cancelled = true; };
    }, []);
    const failedFeatures = featureStatus === null
        ? []
        : Object.entries(featureStatus).filter(([, s]) => !s.ok);
    const [showParams, setShowParams] = useState(false);
    const [showCursor, setShowCursor] = useState(false);
    // 液态玻璃皮肤（vendored 自 liquid-glass-theme）：独立 localStorage + 窗口事件，
    // 与 apply 里的 initLiquidGlass 联动（不经过主题 store）。档位：off/lite/standard/ultra
    const [lgLevel, setLgLevel] = useState(() => {
        try {
            const v = localStorage.getItem('dsh-beautify:liquidGlass');
            if (v === 'lite' || v === 'standard' || v === 'ultra')
                return v;
            return 'off';
        }
        catch {
            return 'off';
        }
    });
    const toggleLiquidGlass = (level) => {
        setLgLevel(level);
        try {
            localStorage.setItem('dsh-beautify:liquidGlass', level);
        }
        catch { /* noop */ }
        try {
            window.dispatchEvent(new CustomEvent('dsh:liquid-glass-toggle', { detail: { level } }));
        }
        catch { /* noop */ }
    };
    const [custom, setCustom] = useState({
        wallpaperUrl: '',
        accent: '#c8a55a',
        background: '#111318',
        text: '#f0f0f0',
    });
    const [showAdvancedColors, setShowAdvancedColors] = useState(false);
    const wallpaperPresets = presets.filter(p => p.wallpaper !== undefined);
    const solidPresets = presets.filter(p => p.wallpaper === undefined);
    // Per-theme wallpaper tweaks for the currently selected wallpaper preset;
    // defaults are the preset's shipped focus point and a sharp (0px) blur.
    const activePreset = presets.find(p => p.id === preference && p.wallpaper !== undefined);
    const weActive = sel.id !== '';
    const wallpaper = readWallpaper();
    const glass = readGlass();
    const onWallpaper = (partial) => {
        if (weActive) {
            if (partial.blur !== undefined)
                setWeEffect('wallpaperBlur', partial.blur);
            if (partial.scrim !== undefined)
                setWeEffect('scrim', Math.round(partial.scrim * 100));
        }
        tweak(partial);
    };
    return (_jsxs("div", { className: css.root, children: [_jsxs("div", { className: css.header, children: [_jsx(PaletteIcon, {}), _jsx("span", { children: "\u5916\u89C2" })] }), failedFeatures.length > 0 && (_jsxs("div", { className: css.statusNotice, role: "alert", children: [_jsx("div", { className: css.statusNoticeTitle, children: "\u90E8\u5206\u529F\u80FD\u672A\u52A0\u8F7D" }), failedFeatures.map(([key, s]) => (_jsxs("div", { className: css.statusNoticeRow, children: [_jsx("span", { className: css.statusNoticeName, children: key === 'whale' ? '余额小鲸鱼' : key === 'wallpaper' ? '壁纸引擎' : key }), _jsx("span", { className: css.statusNoticeReason, children: s.reason ?? '未知原因' })] }, key))), _jsx("div", { className: css.statusNoticeHint, children: "\u53EF\u5728\u7EC8\u7AEF\u65E5\u5FD7\u4E2D\u67E5\u770B\u8BE6\u7EC6\u9519\u8BEF\uFF0C\u6216\u4FEE\u590D\u540E\u91CD\u542F dsh\u3002" })] })), _jsxs("div", { className: css.section, children: [_jsx("div", { className: css.sectionTitle, children: "\u660E\u6697\u6A21\u5F0F" }), _jsx(Segmented, { label: "\u660E\u6697\u6A21\u5F0F", value: preference, options: MODES, onSelect: select })] }), _jsxs("div", { className: css.section, children: [_jsx("div", { className: css.sectionTitle, children: "\u7EAF\u8272\u4E3B\u9898" }), themeTiles(solidPresets, preference, select)] }), _jsxs("div", { className: css.section, children: [_jsxs("div", { className: css.sectionTitle, children: ["\u4E3B\u9898\uFF08", wallpaperPresets.length, "\uFF09"] }), _jsx(WallpaperThemesPicker, { presets: wallpaperPresets, preference: preference, select: select })] }), _jsxs("div", { className: css.section, children: [_jsxs("button", { type: "button", className: css.groupHeader, "aria-expanded": showCursor, onClick: () => { setShowCursor(v => !v); }, children: [_jsx("span", { className: css.groupHeaderText, children: "\u9F20\u6807\u5149\u6807" }), _jsxs("span", { className: css.groupHeaderActions, children: [_jsx("span", { className: css.groupCount, children: cursorEnabled ? `${cursorSkin === 'custom' ? '自定义' : '鲸鱼'} · ${cursorSize}px` : '已关闭' }), _jsx("span", { className: showCursor ? `${css.chevron} ${css.chevronOpen}` : css.chevron, "aria-hidden": "true", children: "\u25BE" })] })] }), _jsx("div", { className: css.collapse, "data-open": showCursor, children: _jsxs("div", { className: css.collapseInner, children: [_jsx(Segmented, { label: "\u5149\u6807\u7F8E\u5316", value: cursorEnabled ? 'on' : 'off', options: [
                                        { id: 'on', label: '启用' },
                                        { id: 'off', label: '关闭' },
                                    ], onSelect: (id) => { setCursorEnabled(id === 'on'); } }), cursorEnabled && (_jsxs(_Fragment, { children: [_jsx(Segmented, { label: "\u5149\u6807\u76AE\u80A4", value: cursorSkin, options: [
                                                { id: 'whale', label: '鲸鱼' },
                                                { id: 'custom', label: '自定义' },
                                            ], onSelect: (id) => { setCursorSkin(id); } }), _jsxs("div", { className: css.paramGroup, children: [_jsx("div", { className: css.paramGroupTitle, children: "\u5927\u5C0F" }), _jsx(Knob, { label: "\u5149\u6807\u5927\u5C0F", value: cursorSize, min: 24, max: 64, step: 4, unit: "px", onChange: setCursorSize })] }), _jsxs("div", { className: css.paramGroup, children: [_jsx("div", { className: css.paramGroupTitle, children: "\u72B6\u6001\u5F00\u5173\uFF08\u53D6\u6D88\u52FE\u9009 = \u8BE5\u72B6\u6001\u7528\u539F\u5149\u6807\uFF09" }), CURSOR_UPLOAD_STATES.map(({ id, label }) => (_jsxs("label", { className: css.cursorStateRow, children: [_jsx("span", { className: css.cursorStateLabel, children: label }), _jsx("input", { type: "checkbox", className: css.cursorStateToggle, checked: id === 'drag'
                                                                ? cursorStateOverrides[id] === true
                                                                : cursorStateOverrides[id] !== false, onChange: (e) => { setCursorStateOverride(id, e.target.checked); } })] }, id))), _jsx("p", { className: css.hint, children: "\u5149\u6807\u59CB\u7EC8\u6309\u60AC\u505C\u76EE\u6807\u81EA\u52A8\u5207\u6362\u5F62\u6001\uFF1B\u52FE\u9009 = \u8BE5\u5F62\u6001\u7528\u76AE\u80A4\uFF0C\u53D6\u6D88 = \u4FDD\u7559\u7CFB\u7EDF\u539F\u751F\u5149\u6807\u3002\u300C\u62D6\u52A8\u300D\u9ED8\u8BA4\u7528\u7CFB\u7EDF\u5149\u6807\uFF08\u6309\u4F4F\u6293\u53D6/\u62D6\u52A8\u6700\u81EA\u7136\uFF09\uFF0C\u60F3\u8981\u76AE\u80A4\u7248\u53EF\u52FE\u4E0A\u3002" })] }), cursorSkin === 'custom' ? (_jsxs("div", { className: css.paramGroup, children: [_jsx("div", { className: css.paramGroupTitle, children: "\u81EA\u5B9A\u4E49\u56FE\u7247\uFF08\u672A\u4E0A\u4F20\u7684\u72B6\u6001\u7528\u9CB8\u9C7C\u56FE\u515C\u5E95\uFF09" }), CURSOR_UPLOAD_STATES.map(({ id, label }) => (_jsx(CursorUploadRow, { state: id, label: label, onSave: saveCursorUpload }, id)))] })) : (_jsx("p", { className: css.hint, children: "DeepSeek \u9CB8\u9C7C\u5149\u6807\uFF1A\u8DDF\u968F\u9F20\u6807\u79FB\u52A8\uFF0C\u60AC\u505C\u94FE\u63A5/\u6309\u94AE\u81EA\u52A8\u6362\u6001\u3002" }))] })), !cursorEnabled && (_jsx("p", { className: css.hint, children: "\u5DF2\u5173\u95ED\u5149\u6807\u7F8E\u5316\uFF0C\u4F7F\u7528\u7CFB\u7EDF\u539F\u751F\u5149\u6807\u3002" }))] }) })] }), _jsxs("div", { className: css.section, children: [_jsxs("button", { type: "button", className: css.groupHeader, "aria-expanded": showParams, onClick: () => { setShowParams(v => !v); }, children: [_jsx("span", { className: css.groupHeaderText, children: "\u7F8E\u5316\u53C2\u6570" }), _jsxs("span", { className: css.groupHeaderActions, children: [_jsx("span", { className: css.groupCount, children: "\u73BB\u7483 \u00B7 \u58C1\u7EB8 \u00B7 \u4E3B\u9898" }), _jsx("span", { className: showParams ? `${css.chevron} ${css.chevronOpen}` : css.chevron, "aria-hidden": "true", children: "\u25BE" })] })] }), _jsx("div", { className: css.collapse, "data-open": showParams, children: _jsxs("div", { className: css.collapseInner, children: [_jsxs("div", { className: css.paramGroup, children: [_jsx("div", { className: css.paramGroupTitle, children: "\u6DB2\u6001\u73BB\u7483" }), _jsx(Segmented, { label: "\u6548\u679C\u6863\u4F4D", value: lgLevel, options: [
                                                { id: 'off', label: '关闭' },
                                                { id: 'lite', label: '轻量' },
                                                { id: 'standard', label: '标准' },
                                                { id: 'ultra', label: '极致' },
                                            ], onSelect: (id) => { toggleLiquidGlass(id); } }), _jsxs("p", { className: css.hint, children: ["WebGL \u7269\u7406\u900F\u955C + \u591A\u5C42\u6BDB\u73BB\u7483\uFF08\u6EB6\u5165\u81EA liquid-glass-theme\uFF0CMIT\uFF09\u3002", _jsx("br", {}), "\u300C\u6863\u4F4D\u300D\uFF1A", _jsx("b", { children: "\u8F7B\u91CF" }), "=\u7EAF\u6BDB\u73BB\u7483\u3001\u4E0D\u8DD1 WebGL\uFF08\u4F4E\u914D/\u96C6\u663E\u63A8\u8350\uFF0C\u51E0\u4E4E\u4E0D\u5361\uFF09\uFF1B", _jsx("b", { children: "\u6807\u51C6" }), "=\u534A\u5206\u8FA8\u7387\u900F\u955C + 30fps\uFF1B", _jsx("b", { children: "\u6781\u81F4" }), "=\u5168\u6548\u679C + 60fps\uFF08\u4EC5\u72EC\u7ACB\u663E\u5361\uFF09\u3002", _jsx("br", {}), "\u300C\u95EE\u9898\u300D\uFF1A\u6807\u51C6/\u6781\u81F4\u5728\u4F4E\u914D\u6216\u96C6\u6210\u663E\u5361\u4E0A\u4ECD\u53EF\u80FD\u660E\u663E\u6389\u5E27\uFF1B\u6D4F\u89C8\u5668\u7981\u7528 WebGL \u65F6\u8F7B\u91CF\u6863\u7167\u5E38\u3001\u5176\u4F59\u6863\u65E0\u900F\u955C\u6548\u679C\u3002"] })] }), _jsxs("div", { className: css.paramGroup, children: [_jsx("div", { className: css.paramGroupTitle, children: "\u58C1\u7EB8" }), _jsx(Knob, { label: "\u58C1\u7EB8\u6A21\u7CCA", value: wallpaper.blur, min: 0, max: 60, step: 1, unit: "px", onChange: (v) => { onWallpaper({ blur: v }); } }), _jsx(Knob, { label: "\u7126\u70B9 \u00B7 \u5DE6\u53F3", value: wallpaper.focusX >= 0 ? wallpaper.focusX : (activePreset?.wallpaper?.focusX ?? 0.5), min: 0, max: 1, step: 0.01, onChange: (v) => { onWallpaper({ focusX: v }); } }), _jsx(Knob, { label: "\u7126\u70B9 \u00B7 \u4E0A\u4E0B", value: wallpaper.focusY >= 0 ? wallpaper.focusY : (activePreset?.wallpaper?.focusY ?? 0.5), min: 0, max: 1, step: 0.01, onChange: (v) => { onWallpaper({ focusY: v }); } }), _jsx(Knob, { label: "\u6697\u5316", value: wallpaper.scrim >= 0 ? wallpaper.scrim : DEFAULT_SCRIM_STRENGTH, min: 0, max: 1, step: 0.01, onChange: (v) => { onWallpaper({ scrim: v }); } })] }), _jsxs("div", { className: css.paramGroup, children: [_jsx("div", { className: css.paramGroupTitle, children: "\u73BB\u7483" }), _jsx(Knob, { label: "\u73BB\u7483\u6A21\u7CCA", value: glass.blur, min: 0, max: 40, step: 1, unit: "px", onChange: (v) => { setGlass('blur', v); } }), _jsx(Knob, { label: "\u73BB\u7483\u9AD8\u5149", value: glass.highlight, min: 0, max: 0.8, step: 0.01, onChange: (v) => { setGlass('highlight', v); } }), _jsx(Knob, { label: "\u73BB\u7483\u9971\u548C\u5EA6", value: glass.saturate, min: 1, max: 3, step: 0.05, onChange: (v) => { setGlass('saturate', v); } }), _jsx(Knob, { label: "\u8FB9\u6846\uFF08\u58C1\u7EB8\u5F15\u64CE\uFF09", value: glass.border, min: 0, max: 1, step: 0.01, onChange: (v) => { setGlass('border', v); }, disabled: !weActive })] }), _jsxs("div", { className: css.paramGroup, children: [_jsx("div", { className: css.paramGroupTitle, children: "\u81EA\u5B9A\u4E49\u4E3B\u9898" }), _jsx("input", { className: css.textInput, type: "text", placeholder: "\u58C1\u7EB8 URL\uFF08https:// \u6216 data:image/...\uFF09", value: custom.wallpaperUrl, onChange: (e) => { setCustom(c => ({ ...c, wallpaperUrl: e.target.value })); } }), _jsxs("div", { className: css.colorRow, children: [_jsxs("label", { className: css.colorField, children: ["\u5F3A\u8C03", _jsx("input", { type: "color", value: custom.accent, onChange: (e) => { setCustom(c => ({ ...c, accent: e.target.value })); } })] }), _jsxs("label", { className: css.colorField, children: ["\u80CC\u666F", _jsx("input", { type: "color", value: custom.background, onChange: (e) => { setCustom(c => ({ ...c, background: e.target.value })); } })] }), _jsxs("label", { className: css.colorField, children: ["\u6587\u5B57", _jsx("input", { type: "color", value: custom.text, onChange: (e) => { setCustom(c => ({ ...c, text: e.target.value })); } })] })] }), _jsxs("button", { type: "button", className: css.advancedToggle, "aria-expanded": showAdvancedColors, onClick: () => { setShowAdvancedColors(v => !v); }, children: ["\u66F4\u591A\u989C\u8272\uFF08\u9762\u677F / \u8FB9\u6846 / \u6B21\u7EA7\u6587\u5B57\uFF09", _jsx("span", { className: showAdvancedColors ? `${css.chevron} ${css.chevronOpen}` : css.chevron, "aria-hidden": "true", children: "\u25BE" })] }), showAdvancedColors && (_jsxs("div", { className: css.colorRow, children: [_jsxs("label", { className: css.colorField, children: ["\u9762\u677F", _jsx("input", { type: "color", value: custom.panel ?? custom.background, onChange: (e) => { setCustom(c => ({ ...c, panel: e.target.value })); } })] }), _jsxs("label", { className: css.colorField, children: ["\u9762\u677F\u4EAE", _jsx("input", { type: "color", value: custom.panelAlt ?? custom.background, onChange: (e) => { setCustom(c => ({ ...c, panelAlt: e.target.value })); } })] }), _jsxs("label", { className: css.colorField, children: ["\u6B21\u7EA7\u6587\u5B57", _jsx("input", { type: "color", value: custom.muted ?? custom.text, onChange: (e) => { setCustom(c => ({ ...c, muted: e.target.value })); } })] }), _jsxs("label", { className: css.colorField, children: ["\u8FB9\u6846", _jsx("input", { type: "color", value: custom.line ?? custom.accent, onChange: (e) => { setCustom(c => ({ ...c, line: e.target.value })); } })] })] })), _jsx(Button, { onClick: () => { saveCustomTheme(custom); }, children: "\u5E94\u7528\u81EA\u5B9A\u4E49\u4E3B\u9898" })] }), _jsx(Button, { onClick: resetTweakFn, children: "\u6062\u590D\u58C1\u7EB8\u53C2\u6570\u9ED8\u8BA4" })] }) })] }), _jsx(WallpaperEngineBlock, {})] }));
}
//# sourceMappingURL=DreamSkinSettings.js.map