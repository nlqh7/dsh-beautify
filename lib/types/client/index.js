import { DREAM_SKIN_PRESETS, buildAmbient, buildScrim } from "./themes.js";
import { applyGlass, applySelection, initWallpaperLayer, readGlass, readWallpaper, setWallpaper } from "./wallpaper-layer.js";
import { initMaidSkin } from "./maid-skin.js";
import { initMaidAtelier } from "./maid-atelier-skin.js";
import { initWhaleCursor } from "./whale-cursor.js";
import { readCursorUploads, writeCursorUploads, } from "./cursor-images.js";
import { initSettingsPerf } from "./settings-perf.js";
import { createDreamSkinStore } from "./settings-store.js";
import { DreamSkinSettings } from "./DreamSkinSettings.js";
import { DEFAULT_SCRIM_STRENGTH } from "../dream-settings.js";
/** Required services: theme registry (for built-in modes), the slot system,
 * and the sessions runtime (subagent catalog for the baby-whale parade).
 * `sessions` must be injected explicitly — Cordis contexts are strict proxies
 * and reading an un-injected property throws, which would kill the plugin. */
export const inject = ['theme', 'slots', 'workspaces', 'sessions'];
/** Renders nothing: ui-theme's appearance row is superseded by the 外观 section. */
const HiddenAppearanceRow = () => null;
/** localStorage key for the persisted appearance prefs. */
const STORAGE_KEY = 'dsh-beautify:prefs';
/** Built-in modes that ride the theme service (no skin overrides). */
const BUILTIN_MODES = new Set(['system', 'light', 'dark']);
/** DSW tokens a skin overrides directly on <body>. */
const SKIN_TOKENS = [
    '--dsw-alias-bg-base', '--dsw-alias-bg-layer-1', '--dsw-alias-bg-layer-2',
    '--dsw-alias-bg-layer-3', '--dsw-alias-bg-module-platform',
    '--dsw-alias-bg-multi-select', '--dsw-alias-bg-overlay', '--dsw-alias-bg-skeleton',
    '--dsw-alias-border-l1', '--dsw-alias-border-l2',
    '--dsw-alias-border-l2-darkmode-thin', '--dsw-alias-border-l3',
    '--dsw-alias-border-l4', '--dsw-alias-border-subtle',
    '--dsw-alias-brand-primary', '--dsw-alias-brand-text', '--dsw-alias-brand-primary-invert',
    '--dsw-alias-label-primary', '--dsw-alias-label-primary-bluish',
    '--dsw-alias-label-primary-dimmed', '--dsw-alias-label-primary-foreground',
    '--dsw-alias-label-primary-inverted', '--dsw-alias-label-secondary',
    '--dsw-alias-label-tertiary', '--dsw-alias-label-quaternary',
    '--dsw-alias-label-caption', '--dsw-alias-label-dimmed',
    '--dsw-alias-text-primary', '--dsw-alias-text-tertiary',
    '--dsw-alias-fill-tsp-secondary',
    '--dsw-alias-markdown-citation', '--dsw-alias-markdown-code-block',
    '--dsw-alias-markdown-code-block-banner', '--dsw-alias-markdown-code-segment-selected',
    '--dsw-alias-markdown-code-segment-unselected', '--dsw-alias-markdown-inline-code',
    '--dsw-alias-markdown-placeholder', '--dsw-alias-markdown-tag',
    '--dsw-alias-button-elevated-fill', '--dsw-alias-button-floating-fill',
    '--dsw-alias-button-floating-hover', '--dsw-alias-button-primary-fill',
    '--dsw-alias-button-primary-hover', '--dsw-alias-button-primary-dimmed',
    '--dsw-alias-button-tool-bar-fill', '--dsw-alias-button-tool-bar-fill-invisible',
    '--dsw-alias-button-tool-bar-hover', '--dsw-alias-button-ghost-active-fill',
    '--dsw-alias-button-ghost-active-border', '--dsw-alias-button-ghost-active-hover',
    '--dsw-alias-interactive-bg-hover', '--dsw-alias-interactive-bg-active',
    '--dsw-alias-interactive-bg-hover-solid',
    '--dsw-specific-bubble', '--dsw-specific-bubble-highlight',
    '--dsw-specific-input-major', '--dsw-specific-login-input',
    '--dsw-specific-menu', '--dsw-specific-selector', '--dsw-specific-sidebar-fill',
    '--dsw-specific-sidebar-nav-item-active', '--dsw-specific-sidebar-nav-item-active-accent',
    '--dsw-specific-sidebar-nav-item-hover', '--dsw-specific-tip',
];
/**
 * Tokens that wallpaper-layer.css redefines while a WE wallpaper is active
 * (transparent frame, border/label contrast, frosted glass). Inline skin
 * values would outrank those stylesheet rules and hide the wallpaper layer,
 * so applySkin skips them while `data-we-wallpaper` is set.
 */
const WE_OVERRIDDEN_TOKENS = new Set([
    '--dsw-alias-bg-base',
    '--dsw-alias-bg-layer-1',
    '--dsw-alias-bg-layer-2',
    '--dsw-alias-bg-layer-3',
    '--dsw-alias-bg-module-platform',
    '--dsw-alias-bg-multi-select',
    '--dsw-alias-bg-overlay',
    '--dsw-alias-bg-skeleton',
    '--dsw-specific-sidebar-fill',
    '--dsw-specific-login-input',
    '--dsw-specific-tip',
    '--dsw-alias-border-l1',
    '--dsw-alias-border-l2',
    '--dsw-alias-border-l2-darkmode-thin',
    '--dsw-alias-border-l3',
    '--dsw-alias-border-l4',
    '--dsw-alias-border-subtle',
    '--dsw-alias-label-primary',
    '--dsw-alias-label-primary-bluish',
    '--dsw-alias-label-primary-dimmed',
    '--dsw-alias-label-primary-foreground',
    '--dsw-alias-label-primary-inverted',
    '--dsw-alias-label-secondary',
    '--dsw-alias-label-tertiary',
    '--dsw-alias-label-quaternary',
    '--dsw-alias-label-caption',
    '--dsw-alias-label-dimmed',
    '--dsw-alias-text-primary',
    '--dsw-alias-text-tertiary',
    '--dsw-alias-fill-tsp-secondary',
    '--dsw-alias-markdown-citation',
    '--dsw-alias-markdown-code-block',
    '--dsw-alias-markdown-code-block-banner',
    '--dsw-alias-markdown-code-segment-selected',
    '--dsw-alias-markdown-code-segment-unselected',
    '--dsw-alias-markdown-inline-code',
    '--dsw-alias-markdown-placeholder',
    '--dsw-alias-markdown-tag',
    '--dsw-alias-button-elevated-fill',
    '--dsw-alias-button-floating-fill',
    '--dsw-alias-button-floating-hover',
    '--dsw-alias-button-primary-fill',
    '--dsw-alias-button-primary-hover',
    '--dsw-alias-button-primary-dimmed',
    '--dsw-alias-button-tool-bar-fill',
    '--dsw-alias-button-tool-bar-fill-invisible',
    '--dsw-alias-button-tool-bar-hover',
    '--dsw-alias-button-ghost-active-fill',
    '--dsw-alias-button-ghost-active-border',
    '--dsw-alias-button-ghost-active-hover',
    '--dsw-alias-interactive-bg-hover',
    '--dsw-alias-interactive-bg-active',
    '--dsw-alias-interactive-bg-hover-solid',
    '--dsw-specific-bubble',
    '--dsw-specific-input-major',
    '--dsw-specific-sidebar-nav-item-hover',
    '--dsw-specific-sidebar-nav-item-active',
    '--dsw-specific-sidebar-nav-item-active-accent',
]);
/** Read persisted prefs, falling back to defaults on malformed or missing data. */
function readPrefs() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null)
            return { themeId: 'system', scrimStrength: DEFAULT_SCRIM_STRENGTH, cursorEnabled: true, cursorSkin: 'whale', cursorSize: 48, cursorStateOverrides: {} };
        const parsed = JSON.parse(raw);
        return {
            themeId: typeof parsed.themeId === 'string' ? parsed.themeId : 'system',
            scrimStrength: typeof parsed.scrimStrength === 'number'
                ? parsed.scrimStrength
                : DEFAULT_SCRIM_STRENGTH,
            cursorEnabled: parsed.cursorEnabled !== false,
            cursorSkin: parsed.cursorSkin === 'custom' ? 'custom' : 'whale',
            cursorSize: typeof parsed.cursorSize === 'number'
                ? Math.min(64, Math.max(24, parsed.cursorSize))
                : 48,
            cursorStateOverrides: typeof parsed.cursorStateOverrides === 'object' && parsed.cursorStateOverrides !== null
                ? parsed.cursorStateOverrides
                : {},
            ...(parsed.customTheme === undefined ? {} : { customTheme: parsed.customTheme }),
        };
    }
    catch {
        return { themeId: 'system', scrimStrength: DEFAULT_SCRIM_STRENGTH, cursorEnabled: true, cursorSkin: 'whale', cursorSize: 48, cursorStateOverrides: {} };
    }
}
/** Persist appearance prefs. */
function writePrefs(prefs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
/** Build the custom-skin palette + wallpaper from the user's form. */
function customSkin(custom) {
    if (custom === undefined || custom.wallpaperUrl === '')
        return undefined;
    const palette = {
        background: custom.background,
        panel: custom.panel ?? custom.background,
        panelAlt: custom.panelAlt ?? custom.background,
        accent: custom.accent,
        accentAlt: custom.accent,
        secondary: custom.accent,
        highlight: custom.accent,
        text: custom.text,
        muted: custom.muted ?? custom.text,
        line: custom.line ?? custom.accent,
    };
    return { palette, wallpaper: { url: custom.wallpaperUrl, focusX: 0.5, focusY: 0.5 } };
}
/** The maid-whale theme id whose chrome (frames + ornaments) mounts. */
const MAID_THEME_ID = 'maid-whale';
const MAID_ATELIER_THEME_ID = 'maid-atelier';
/** DOM event the whale widget listens to for the baby-whale parade. */
const SUBAGENT_EVENT = 'dshw:subagents';
/**
 * Watch the current session's subagent catalog and relay the direct-child
 * identities to the balance whale through a DOM event. The whale widget turns
 * it into the baby-whale parade: one small whale per subagent, lifecycled
 * 1:1 with the subagent session (appear together, leave together), a cry per
 * arrival (staggered when several arrive at once), and a numeric bubble.
 * Sessions may be absent on minimal hosts — the whole watcher is optional
 * and fails closed.
 */
function initSubagentWatcher(ctx) {
    const sessions = ctx.sessions;
    const list = sessions?.list;
    if (list === undefined || typeof list.subscribe !== 'function' || typeof list.getSnapshot !== 'function') {
        return () => { };
    }
    const readIds = () => {
        try {
            const snap = list.getSnapshot();
            const current = snap?.current;
            const catalog = current === undefined ? undefined : snap?.subagentsByParent?.[current];
            if (catalog === undefined || !Array.isArray(catalog.entries))
                return [];
            return catalog.entries
                .filter(e => e?.kind === 'child' && typeof e.id === 'string')
                .map(e => e.id);
        }
        catch {
            return [];
        }
    };
    let lastIds = readIds();
    const sync = () => {
        try {
            const ids = readIds();
            const changed = ids.length !== lastIds.length || ids.some((id, i) => id !== lastIds[i]);
            if (changed) {
                lastIds = ids;
                window.dispatchEvent(new CustomEvent(SUBAGENT_EVENT, { detail: { ids } }));
            }
        }
        catch { /* never let a watcher tick break the host */ }
    };
    const unsubscribe = list.subscribe(() => { sync(); });
    return () => {
        try {
            unsubscribe();
        }
        catch { /* noop */ }
    };
}
/**
 * Dedicated fixed layer under the app frame (z-index -3) that carries a
 * blurred theme wallpaper; `filter: blur()` cannot apply to a CSS background,
 * so blurred wallpapers render here instead of the body background. Null when
 * no theme wallpaper needs it.
 */
let themeWallpaperEl = null;
function setThemeWallpaperLayer(palette, wallpaper, strength, tweak) {
    if (themeWallpaperEl === null) {
        themeWallpaperEl = document.createElement('div');
        themeWallpaperEl.style.cssText = 'position:fixed;inset:0;z-index:-3;background-size:cover;background-repeat:no-repeat;pointer-events:none;';
        document.body.appendChild(themeWallpaperEl);
    }
    themeWallpaperEl.style.background = buildScrim(palette, wallpaper, strength, tweak);
    const blur = Math.max(0, typeof tweak?.blur === 'number' ? tweak.blur : 0);
    themeWallpaperEl.style.filter = blur > 0 ? `blur(${blur}px)` : '';
}
function removeThemeWallpaperLayer() {
    if (themeWallpaperEl !== null) {
        themeWallpaperEl.remove();
        themeWallpaperEl = null;
    }
}
/**
 * Shift a hex palette color toward white (positive ratio) or black (negative
 * ratio). Hover/active surfaces need a step above the flat panel they sit on;
 * a bare palette color would equal the panel and vanish (the settings nav on
 * `panelAlt`).
 * @param hex - `#rgb` or `#rrggbb` palette color.
 * @param ratio - blend amount in (-1, 1); sign picks the blend target.
 * @returns an `rgb(...)` color string.
 */
function shiftHex(hex, ratio) {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const num = Number.parseInt(full, 16);
    if (full.length !== 6 || Number.isNaN(num))
        return hex;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    const a = Math.min(1, Math.abs(ratio));
    const target = ratio > 0 ? 255 : 0;
    const mix = (c) => Math.round(c + (target - c) * a);
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}
/** Relative luminance of a hex color (0 = black, 1 = white), for choosing the hover step direction. */
function shiftLuma(hex) {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const num = Number.parseInt(full, 16);
    if (full.length !== 6 || Number.isNaN(num))
        return 0.5;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
/** Convert a hex color to an `rgba(...)` string with the given alpha. */
function hexToRgba(hex, alpha) {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const num = Number.parseInt(full, 16);
    if (full.length !== 6 || Number.isNaN(num))
        return hex;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${Math.min(1, Math.max(0, alpha))})`;
}
/** Apply a skin by writing DSW tokens directly on <body> — the maid-whale way,
 * no theme-service registration. Empty/unknown ids clear the overrides.
 */
function applySkin(themeId, scrimStrength, custom) {
    const style = document.body.style;
    // While a WE wallpaper is active, its stylesheet rules own the frame/glass
    // tokens; inline skin values must not outrank them or the wallpaper hides.
    const weActive = document.body.hasAttribute('data-we-wallpaper');
    const clear = () => {
        for (const token of SKIN_TOKENS) {
            if (weActive && WE_OVERRIDDEN_TOKENS.has(token))
                continue;
            style.removeProperty(token);
        }
    };
    const skin = themeId === 'custom'
        ? customSkin(custom)
        : (() => {
            const preset = DREAM_SKIN_PRESETS.find((p) => p.id === themeId);
            if (preset === undefined)
                return undefined;
            return { palette: preset.palette, wallpaper: preset.wallpaper };
        })();
    if (skin === undefined) {
        clear();
        removeThemeWallpaperLayer();
        applyGlass();
        return;
    }
    // Global wallpaper knobs: blur/focus/scrim apply to any wallpaper source.
    const wp = readWallpaper();
    const blur = Math.max(0, wp.blur);
    // A blurred wallpaper needs its own layer (filter can't target a background);
    // the frame then sits on a plain palette wash. Sharp wallpapers stay on the
    // body background, which keeps blur=0 on the preset defaults free of layers.
    const useLayer = skin.wallpaper !== undefined && blur > 0;
    const focus = {};
    if (wp.focusX >= 0)
        focus.focusX = wp.focusX;
    if (wp.focusY >= 0)
        focus.focusY = wp.focusY;
    const scrim = wp.scrim >= 0 ? wp.scrim : scrimStrength;
    if (useLayer && skin.wallpaper !== undefined) {
        setThemeWallpaperLayer(skin.palette, skin.wallpaper, scrim, { blur, ...focus });
    }
    else {
        removeThemeWallpaperLayer();
    }
    const bg = !useLayer && skin.wallpaper !== undefined
        ? buildScrim(skin.palette, skin.wallpaper, scrim, focus)
        : buildAmbient(skin.palette);
    const set = (token, value) => {
        if (weActive && WE_OVERRIDDEN_TOKENS.has(token))
            return;
        style.setProperty(token, value);
    };
    set('--dsw-alias-bg-base', bg);
    set('--dsw-alias-bg-layer-1', skin.palette.panel);
    set('--dsw-alias-bg-layer-2', skin.palette.panelAlt);
    set('--dsw-alias-bg-layer-3', skin.palette.panelAlt);
    set('--dsw-alias-bg-module-platform', skin.palette.panel);
    set('--dsw-alias-bg-multi-select', skin.palette.panelAlt);
    set('--dsw-alias-bg-overlay', skin.palette.panelAlt);
    set('--dsw-alias-bg-skeleton', skin.palette.panelAlt);
    set('--dsw-alias-border-l1', skin.palette.line);
    set('--dsw-alias-border-l2', skin.palette.line);
    set('--dsw-alias-border-l2-darkmode-thin', skin.palette.line);
    set('--dsw-alias-border-l3', skin.palette.line);
    set('--dsw-alias-border-l4', skin.palette.line);
    set('--dsw-alias-border-subtle', skin.palette.line);
    set('--dsw-alias-brand-primary', skin.palette.accent);
    set('--dsw-alias-brand-text', skin.palette.text);
    // The brand wordmark's HARNESS plate draws the badge plate in currentColor
    // (label-primary) and knocks its letters out in the inverted alias; without a
    // contrast-matched override the plate and letters collide (white on white).
    const textLight = shiftLuma(skin.palette.text) >= 0.5;
    const inverted = textLight ? '#0d0f14' : '#ffffff';
    set('--dsw-alias-brand-primary-invert', inverted);
    set('--dsw-alias-label-primary-foreground', inverted);
    set('--dsw-alias-label-primary-inverted', inverted);
    set('--dsw-alias-label-primary', skin.palette.text);
    set('--dsw-alias-label-primary-bluish', skin.palette.muted);
    set('--dsw-alias-label-primary-dimmed', skin.palette.muted);
    set('--dsw-alias-label-secondary', skin.palette.muted);
    // Tertiary/caption/dimmed/quaternary stay on the palette's muted family so
    // reasoning rows, helper text, and seat labels never fall back to the base
    // theme's near-white gray.
    set('--dsw-alias-label-tertiary', skin.palette.muted);
    set('--dsw-alias-label-quaternary', skin.palette.muted);
    set('--dsw-alias-label-caption', skin.palette.muted);
    set('--dsw-alias-label-dimmed', skin.palette.muted);
    // Settings/model sections reference the text-* and border-subtle aliases that
    // the platform CSS does not define; overriding them inline keeps those lists
    // on the palette instead of the light-mode literals they fall back to.
    set('--dsw-alias-text-primary', skin.palette.text);
    set('--dsw-alias-text-tertiary', skin.palette.muted);
    set('--dsw-alias-fill-tsp-secondary', skin.palette.panelAlt);
    // Markdown chips (inline code, tags, citations, code blocks) must follow the
    // palette family or they stay on the platform's near-white while the text
    // inside turns light — the white-on-white nouns in model output.
    set('--dsw-alias-markdown-citation', skin.palette.panelAlt);
    set('--dsw-alias-markdown-code-block', skin.palette.panelAlt);
    set('--dsw-alias-markdown-code-block-banner', skin.palette.panel);
    set('--dsw-alias-markdown-code-segment-selected', skin.palette.panel);
    set('--dsw-alias-markdown-code-segment-unselected', skin.palette.panelAlt);
    set('--dsw-alias-markdown-inline-code', skin.palette.panelAlt);
    set('--dsw-alias-markdown-placeholder', skin.palette.muted);
    set('--dsw-alias-markdown-tag', skin.palette.panelAlt);
    // Specific surfaces must follow the palette's light/dark family or bubbles
    // and inputs stay on the base theme's near-white while text turns light.
    set('--dsw-specific-bubble', skin.palette.panel);
    set('--dsw-specific-bubble-highlight', skin.palette.panelAlt);
    set('--dsw-specific-input-major', skin.palette.panel);
    set('--dsw-specific-login-input', skin.palette.panel);
    set('--dsw-specific-menu', skin.palette.panelAlt);
    set('--dsw-specific-selector', skin.palette.panelAlt);
    set('--dsw-specific-sidebar-fill', skin.palette.panel);
    // Nav hover/active must step off the flat panel (the settings nav sits on
    // panelAlt): lighter panels darken, darker panels lighten. A bare palette
    // color would equal the background and the hover/active state would vanish.
    const panelLight = shiftLuma(skin.palette.panelAlt) >= 0.5;
    set('--dsw-specific-sidebar-nav-item-hover', shiftHex(skin.palette.panelAlt, panelLight ? -0.09 : 0.09));
    set('--dsw-specific-sidebar-nav-item-active', shiftHex(skin.palette.panelAlt, panelLight ? -0.16 : 0.16));
    set('--dsw-specific-sidebar-nav-item-active-accent', shiftHex(skin.palette.panelAlt, panelLight ? -0.16 : 0.16));
    set('--dsw-specific-tip', skin.palette.panelAlt);
    // New-session bar and floating pills follow the palette, or they stay on the
    // stock near-white while every surface around them turns dark.
    set('--dsw-alias-button-elevated-fill', skin.palette.panel);
    set('--dsw-alias-button-floating-fill', skin.palette.panel);
    set('--dsw-alias-button-floating-hover', skin.palette.panelAlt);
    // Buttons and interactive hover states (settings rows, menus, pills, the
    // scroll-to-bottom pill) follow the palette too; primary keeps the accent.
    set('--dsw-alias-button-primary-fill', skin.palette.accent);
    set('--dsw-alias-button-primary-hover', skin.palette.accentAlt);
    set('--dsw-alias-button-primary-dimmed', skin.palette.panelAlt);
    set('--dsw-alias-button-tool-bar-fill', skin.palette.panel);
    set('--dsw-alias-button-tool-bar-fill-invisible', skin.palette.panel);
    set('--dsw-alias-button-tool-bar-hover', skin.palette.panelAlt);
    set('--dsw-alias-button-ghost-active-fill', skin.palette.panelAlt);
    set('--dsw-alias-button-ghost-active-border', skin.palette.line);
    set('--dsw-alias-button-ghost-active-hover', skin.palette.panelAlt);
    set('--dsw-alias-interactive-bg-hover', skin.palette.panelAlt);
    set('--dsw-alias-interactive-bg-active', skin.palette.panelAlt);
    set('--dsw-alias-interactive-bg-hover-solid', skin.palette.panelAlt);
    // Global glass: any theme blurs the panels through the shared glass store.
    // Outside WE the flat surfaces go translucent so the wallpaper shows through
    // the frosted glass; WE owns its own translucent surfaces.
    applyGlass();
    const glass = readGlass();
    if (glass.blur > 0 && !weActive) {
        const alpha = 0.5 + (Math.min(glass.blur, 40) / 40) * 0.35;
        style.setProperty('--dsw-specific-input-major', hexToRgba(skin.palette.panel, alpha));
        style.setProperty('--dsw-specific-bubble', hexToRgba(skin.palette.panel, alpha));
        style.setProperty('--dsw-specific-menu', hexToRgba(skin.palette.panelAlt, alpha));
    }
}
/**
 * Register every Dream Skin preset, restore persisted state, and mount the
 * 外观 switching section.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx) {
    initWallpaperLayer(ctx);
    // Skin-independent performance overrides for the settings surface (mask
    // backdrop-filter drop + off-screen row skipping); disposed with the plugin.
    const disposeSettingsPerf = initSettingsPerf();
    // Baby-whale parade relay: current session's subagent count → DOM event.
    const disposeSubagentWatcher = initSubagentWatcher(ctx);
    const store = createDreamSkinStore();
    let bound;
    // Maid chrome (frames + ornaments / atelier layers): mounted only while one
    // of the maid themes is selected, disposed on every switch, mode follows the
    // host dark theme.
    let maid;
    let atelier;
    const syncMaidSkin = (themeId) => {
        const wantsMaid = themeId === MAID_THEME_ID;
        const wantsAtelier = themeId === MAID_ATELIER_THEME_ID;
        if (wantsMaid && maid === undefined) {
            maid = initMaidSkin();
            const dark = document.body.hasAttribute('data-ds-dark-theme');
            maid.setMode(dark ? 'dark' : 'light');
        }
        else if (!wantsMaid && maid !== undefined) {
            maid.dispose();
            maid = undefined;
        }
        if (wantsAtelier && atelier === undefined) {
            atelier = initMaidAtelier();
        }
        else if (!wantsAtelier && atelier !== undefined) {
            atelier.dispose();
            atelier = undefined;
        }
    };
    const darkObserver = new MutationObserver(() => {
        const dark = document.body.hasAttribute('data-ds-dark-theme');
        if (maid !== undefined)
            maid.setMode(dark ? 'dark' : 'light');
        if (atelier !== undefined)
            atelier.setMode(dark ? 'dark' : 'light');
    });
    darkObserver.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });
    // Restore persisted state: built-in modes via the theme service, skins via
    // direct body overrides.
    const prefs = readPrefs();
    // DeepSeek whale cursor over the app; gated by the master switch only.
    // `cursorEnabled` is a live binding so toggling it from settings re-evaluates
    // the gate without remounting the cursor.
    let cursorEnabled = prefs.cursorEnabled;
    const cursor = initWhaleCursor(() => cursorEnabled, prefs.cursorSkin, prefs.cursorSize, false);
    cursor.setStateOverrides(prefs.cursorStateOverrides);
    if (BUILTIN_MODES.has(prefs.themeId)) {
        ctx.theme.setTheme(prefs.themeId);
        applySkin('', prefs.scrimStrength, prefs.customTheme);
    }
    else {
        applySkin(prefs.themeId, prefs.scrimStrength, prefs.customTheme);
    }
    syncMaidSkin(prefs.themeId);
    // Mirror built-in-mode changes; re-apply the skin after a mode switch so the
    // theme-service presenter does not leave our token overrides behind.
    ctx.on('theme/change', (snapshot) => {
        bound?.syncPreference(snapshot.preference, snapshot.revision);
        const current = readPrefs();
        if (!BUILTIN_MODES.has(current.themeId)) {
            applySkin(current.themeId, current.scrimStrength, current.customTheme);
        }
        syncMaidSkin(current.themeId);
    });
    const injected = (actions) => {
        bound = actions;
        // Re-sync from the getter so no event is lost between registration and
        // first render (the store's revision guard drops stale duplicates).
        const snapshot = ctx.theme.getTheme();
        bound.syncPreference(snapshot.preference, snapshot.revision);
        bound.syncScrim(readPrefs().scrimStrength);
        bound.syncCursorEnabled(readPrefs().cursorEnabled);
        bound.syncCursorSkin(readPrefs().cursorSkin);
        bound.syncCursorSize(readPrefs().cursorSize);
        bound.syncCursorStateOverrides(readPrefs().cursorStateOverrides);
        return {
            presets: DREAM_SKIN_PRESETS,
            setCursorStateOverride: (state, on) => {
                const next = readPrefs();
                const overrides = { ...next.cursorStateOverrides };
                // Explicit true/false both stored: `drag` defaults to the native
                // cursor, so its enabled flag must be persisted, not omitted.
                overrides[state] = on;
                next.cursorStateOverrides = overrides;
                writePrefs(next);
                bound?.syncCursorStateOverrides(overrides);
                cursor.setStateOverrides(overrides);
            },
            setCursorEnabled: (on) => {
                const next = readPrefs();
                next.cursorEnabled = on;
                writePrefs(next);
                cursorEnabled = on;
                bound?.syncCursorEnabled(on);
                cursor.refresh();
            },
            setCursorSkin: (id) => {
                const next = readPrefs();
                next.cursorSkin = id;
                writePrefs(next);
                bound?.syncCursorSkin(id);
                cursor.setSkin(id);
            },
            setCursorSize: (px) => {
                const next = readPrefs();
                next.cursorSize = px;
                writePrefs(next);
                cursor.setSize(px);
            },
            saveCursorUpload: (state, dataUrl) => {
                const uploads = readCursorUploads();
                if (dataUrl === null) {
                    delete uploads[state];
                }
                else {
                    uploads[state] = dataUrl;
                }
                writeCursorUploads(uploads);
                // Reload the custom skin so the new art applies to the live cursor.
                cursor.setSkin('custom');
                bound?.syncCursorSkin('custom');
            },
            select: (id) => {
                const next = readPrefs();
                next.themeId = id;
                writePrefs(next);
                // A theme switch is a wallpaper-source switch: the theme's own
                // wallpaper (or pure color) wins, so any WE wallpaper closes. Last
                // selection wins; nothing is left behind.
                applySelection('');
                if (BUILTIN_MODES.has(id)) {
                    ctx.theme.setTheme(id);
                    applySkin('', next.scrimStrength, next.customTheme);
                }
                else {
                    applySkin(id, next.scrimStrength, next.customTheme);
                }
                syncMaidSkin(id);
            },
            setScrimStrength: (value) => {
                const next = readPrefs();
                next.scrimStrength = value;
                writePrefs(next);
                applySkin(next.themeId, value, next.customTheme);
            },
            saveCustomTheme: (custom) => {
                const next = readPrefs();
                next.customTheme = custom;
                next.themeId = 'custom';
                writePrefs(next);
                // Same last-wins rule: applying a custom theme (own wallpaper or pure
                // color) closes any WE wallpaper.
                applySelection('');
                applySkin('custom', next.scrimStrength, custom);
            },
            tweak: (partial) => {
                setWallpaper(partial);
                const next = readPrefs();
                applySkin(next.themeId, next.scrimStrength, next.customTheme);
            },
            resetTweak: () => {
                setWallpaper({ blur: 0, focusX: -1, focusY: -1, scrim: -1 });
                const next = readPrefs();
                applySkin(next.themeId, next.scrimStrength, next.customTheme);
            },
        };
    };
    ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'dream-skin',
        order: 25,
        label: '外观',
        store,
        inject: injected,
    }, DreamSkinSettings));
    // Shadow ui-theme's appearance row: light/dark/system + themes now live in
    // the 外观 section, so the General row would be a duplicate.
    ctx.slots.inject('settings.general.item', () => ctx.slots.register({
        name: 'settings.general.item',
        id: 'appearance',
        order: 10,
        priority: -1,
    }, HiddenAppearanceRow));
    // Retract the whale cursor and the dark-theme watcher with the plugin.
    ctx.effect(() => () => {
        disposeSettingsPerf();
        disposeSubagentWatcher();
        darkObserver.disconnect();
        cursor.dispose();
        if (maid !== undefined) {
            maid.dispose();
            maid = undefined;
        }
        if (atelier !== undefined) {
            atelier.dispose();
            atelier = undefined;
        }
    });
}
//# sourceMappingURL=index.js.map