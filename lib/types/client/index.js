import { DREAM_SKIN_PRESETS, buildScrim } from "./themes.js";
import { initWallpaperLayer } from "./wallpaper-layer.js";
import { createDreamSkinStore } from "./settings-store.js";
import { DreamSkinSettings } from "./DreamSkinSettings.js";
import { DEFAULT_SCRIM_STRENGTH } from "../dream-settings.js";
/** Required services: theme registry (for built-in modes) and the slot system. */
export const inject = ['theme', 'slots'];
/** Renders nothing: ui-theme's appearance row is superseded by the 外观 section. */
const HiddenAppearanceRow = () => null;
/** localStorage key for the persisted appearance prefs. */
const STORAGE_KEY = 'dsh-beautify:prefs';
/** Built-in modes that ride the theme service (no skin overrides). */
const BUILTIN_MODES = new Set(['system', 'light', 'dark']);
/** DSW tokens a skin overrides directly on <body>. */
const SKIN_TOKENS = [
    '--dsw-alias-bg-base', '--dsw-alias-bg-layer-1', '--dsw-alias-bg-layer-2',
    '--dsw-alias-bg-overlay', '--dsw-alias-border-l1', '--dsw-alias-border-l2',
    '--dsw-alias-brand-primary', '--dsw-alias-label-primary',
    '--dsw-alias-label-secondary', '--dsw-specific-sidebar-fill',
];
/** Read persisted prefs, falling back to defaults on malformed or missing data. */
function readPrefs() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null)
            return { themeId: 'system', scrimStrength: DEFAULT_SCRIM_STRENGTH };
        const parsed = JSON.parse(raw);
        return {
            themeId: typeof parsed.themeId === 'string' ? parsed.themeId : 'system',
            scrimStrength: typeof parsed.scrimStrength === 'number'
                ? parsed.scrimStrength
                : DEFAULT_SCRIM_STRENGTH,
            ...(parsed.customTheme === undefined ? {} : { customTheme: parsed.customTheme }),
        };
    }
    catch {
        return { themeId: 'system', scrimStrength: DEFAULT_SCRIM_STRENGTH };
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
        panel: custom.background,
        panelAlt: custom.background,
        accent: custom.accent,
        accentAlt: custom.accent,
        secondary: custom.accent,
        highlight: custom.accent,
        text: custom.text,
        muted: custom.text,
        line: custom.accent,
    };
    return { palette, wallpaper: { url: custom.wallpaperUrl, focusX: 0.5, focusY: 0.5 } };
}
/**
 * Apply a skin by writing DSW tokens directly on <body> — the maid-whale way,
 * no theme-service registration. Empty/unknown ids clear the overrides.
 */
function applySkin(themeId, scrimStrength, custom) {
    const style = document.body.style;
    const clear = () => {
        for (const token of SKIN_TOKENS)
            style.removeProperty(token);
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
        return;
    }
    const bg = skin.wallpaper !== undefined
        ? buildScrim(skin.palette, skin.wallpaper, scrimStrength)
        : skin.palette.background;
    style.setProperty('--dsw-alias-bg-base', bg);
    style.setProperty('--dsw-alias-bg-layer-1', skin.palette.panel);
    style.setProperty('--dsw-alias-bg-layer-2', skin.palette.panelAlt);
    style.setProperty('--dsw-alias-bg-overlay', skin.palette.panelAlt);
    style.setProperty('--dsw-alias-border-l1', skin.palette.line);
    style.setProperty('--dsw-alias-border-l2', skin.palette.line);
    style.setProperty('--dsw-alias-brand-primary', skin.palette.accent);
    style.setProperty('--dsw-alias-label-primary', skin.palette.text);
    style.setProperty('--dsw-alias-label-secondary', skin.palette.muted);
    style.setProperty('--dsw-specific-sidebar-fill', skin.palette.panel);
}
/**
 * Register every Dream Skin preset, restore persisted state, and mount the
 * 外观 switching section.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx) {
    initWallpaperLayer(ctx);
    const store = createDreamSkinStore();
    let bound;
    // Restore persisted state: built-in modes via the theme service, skins via
    // direct body overrides.
    const prefs = readPrefs();
    if (BUILTIN_MODES.has(prefs.themeId)) {
        ctx.theme.setTheme(prefs.themeId);
        applySkin('', prefs.scrimStrength, prefs.customTheme);
    }
    else {
        applySkin(prefs.themeId, prefs.scrimStrength, prefs.customTheme);
    }
    // Mirror built-in-mode changes; re-apply the skin after a mode switch so the
    // theme-service presenter does not leave our token overrides behind.
    ctx.on('theme/change', (snapshot) => {
        bound?.syncPreference(snapshot.preference, snapshot.revision);
        const current = readPrefs();
        if (!BUILTIN_MODES.has(current.themeId)) {
            applySkin(current.themeId, current.scrimStrength, current.customTheme);
        }
    });
    const injected = (actions) => {
        bound = actions;
        // Re-sync from the getter so no event is lost between registration and
        // first render (the store's revision guard drops stale duplicates).
        const snapshot = ctx.theme.getTheme();
        bound.syncPreference(snapshot.preference, snapshot.revision);
        bound.syncScrim(readPrefs().scrimStrength);
        return {
            presets: DREAM_SKIN_PRESETS,
            select: (id) => {
                const next = readPrefs();
                next.themeId = id;
                writePrefs(next);
                if (BUILTIN_MODES.has(id)) {
                    ctx.theme.setTheme(id);
                    applySkin('', next.scrimStrength, next.customTheme);
                }
                else {
                    applySkin(id, next.scrimStrength, next.customTheme);
                }
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
                applySkin('custom', next.scrimStrength, custom);
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
}
//# sourceMappingURL=index.js.map