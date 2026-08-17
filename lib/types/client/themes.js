import { WALLPAPERS } from "./wallpapers.js";
import { DEFAULT_SCRIM_STRENGTH } from "../dream-settings.js";
/** Convert a hex color to rgba with the given alpha; non-hex values pass through. */
function hexToRgba(color, alpha) {
    const hex = /^#([0-9a-fA-F]{6})/.exec(color)?.[1];
    if (hex === undefined)
        return color;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
/**
 * Build the wallpaper background CSS: a left-to-right readability scrim over
 * the wallpaper, focused by the wallpaper's own focus point. Strength is
 * 0 (no scrim, wallpaper fully visible) to 1 (full default scrim).
 */
export function buildScrim(p, wallpaper, strength) {
    const s = Math.max(0, Math.min(1, strength));
    return `linear-gradient(90deg, ${hexToRgba(p.background, 0.72 * s)} 0%, ${hexToRgba(p.background, 0.42 * s)} 38%, ${hexToRgba(p.background, 0.06 * s)} 66%, transparent 84%), url("${wallpaper.url}") ${Math.round(wallpaper.focusX * 100)}% ${Math.round(wallpaper.focusY * 100)}% / cover no-repeat`;
}
/** Build the alias tokens for a palette, folding in the wallpaper when given. */
function tokensFor(p, wallpaper) {
    const base = wallpaper !== undefined ? buildScrim(p, wallpaper, DEFAULT_SCRIM_STRENGTH) : p.background;
    return {
        '--dsw-alias-bg-base': base,
        '--dsw-alias-bg-layer-1': p.panel,
        '--dsw-alias-bg-layer-2': p.panelAlt,
        '--dsw-alias-bg-overlay': p.panelAlt,
        '--dsw-alias-border-l1': p.line,
        '--dsw-alias-border-l2': p.line,
        '--dsw-alias-brand-primary': p.accent,
        '--dsw-alias-label-primary': p.text,
        '--dsw-alias-label-secondary': p.muted,
        '--dsw-specific-sidebar-fill': p.panel,
    };
}
/** Build a full theme definition from a palette and an optional wallpaper (custom themes). */
export function buildThemeDefinition(id, colorScheme, p, wallpaper) {
    return Object.freeze({ id, colorScheme, tokens: Object.freeze(tokensFor(p, wallpaper)) });
}
/** Map a shipped preset onto its alias tokens. */
function toTokens(id, p) {
    return tokensFor(p, WALLPAPERS[id]);
}
function preset(id, label, colorScheme, palette) {
    return {
        id,
        label,
        definition: Object.freeze({
            id,
            colorScheme,
            tokens: Object.freeze(toTokens(id, palette)),
        }),
        swatches: Object.freeze([palette.background, palette.accent, palette.text]),
        ...(WALLPAPERS[id] === undefined ? {} : { wallpaper: WALLPAPERS[id] }),
        palette,
    };
}
/** Shipped local presets, in display order. */
export const DREAM_SKIN_PRESETS = Object.freeze([
    preset('dream-codex', 'Codex 默认暗色', 'dark', {
        background: '#111318',
        panel: '#191c22',
        panelAlt: '#20242b',
        accent: '#8298a3',
        accentAlt: '#a0adb3',
        secondary: '#8da397',
        highlight: '#9d94a3',
        text: '#edf0f1',
        muted: '#a3aaae',
        line: 'rgba(130, 152, 163, .24)',
    }),
    preset('dream-gothic', 'Gothic Void Crusade', 'dark', {
        background: '#0d0d0e',
        panel: '#171513',
        panelAlt: '#211d18',
        accent: '#c8a55a',
        accentAlt: '#e3c27a',
        secondary: '#74352e',
        highlight: '#8a2f27',
        text: '#f3ead7',
        muted: '#b5a386',
        line: 'rgba(200, 165, 90, .28)',
    }),
    preset('dream-arina', '桥本有菜 · 柔光玫瑰', 'dark', {
        background: '#1a1216',
        panel: '#241a1e',
        panelAlt: '#2e2026',
        accent: '#e08aa0',
        accentAlt: '#f0b3c4',
        secondary: '#a86a7a',
        highlight: '#d4728a',
        text: '#f7eef0',
        muted: '#c3aab0',
        line: 'rgba(224, 138, 160, .28)',
    }),
    preset('morning-mist', '晨雾山水', 'light', {
        background: '#f2eee5',
        panel: '#fbf9f3',
        panelAlt: '#e8e2d6',
        accent: '#66776f',
        accentAlt: '#87968e',
        secondary: '#a88f5b',
        highlight: '#4f6259',
        text: '#272b28',
        muted: '#747971',
        line: 'rgba(102, 119, 111, 0.28)',
    }),
    preset('wukong', '悟空（WUKONG）', 'dark', {
        background: '#131313',
        panel: '#1d1e1d',
        panelAlt: '#2a2a2a',
        accent: '#f6c696',
        accentAlt: '#f7cea5',
        secondary: '#2c7c95',
        highlight: '#f8d4b0',
        text: '#f0f0f0',
        muted: '#939393',
        line: '#3f3f3f',
    }),
    preset('deepseek', 'DeepSeek-鲸鱼娘', 'light', {
        background: '#bd9999',
        panel: '#abb4cf',
        panelAlt: '#c3cee4',
        accent: '#7a4e29',
        accentAlt: '#ceb683',
        secondary: '#85c1cc',
        highlight: '#455b78',
        text: '#352970',
        muted: '#030303',
        line: '#d3d3d4',
    }),
]);
//# sourceMappingURL=themes.js.map