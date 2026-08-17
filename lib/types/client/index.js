import { DREAM_SKIN_PRESETS, buildScrim, buildThemeDefinition } from "./themes.js";
import { createDreamSkinStore } from "./settings-store.js";
import { DreamSkinSettings } from "./DreamSkinSettings.js";
import { DEFAULT_SCRIM_STRENGTH } from "../dream-settings.js";
/** Required services: theme registry and the slot system. */
export const inject = ['theme', 'slots'];
/** Renders nothing: ui-theme's appearance row is superseded by the 外观 section. */
const HiddenAppearanceRow = () => null;
/** localStorage key for the persisted appearance prefs. */
const STORAGE_KEY = 'dsh-beautify:prefs';
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
/**
 * Register every Dream Skin preset, restore persisted state, and mount the
 * 外观 switching section.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx) {
    ctx.effect(() => {
        const disposers = DREAM_SKIN_PRESETS.map((preset) => ctx.theme.register(preset.definition));
        return () => { for (const dispose of disposers)
            dispose(); };
    });
    const store = createDreamSkinStore();
    let bound;
    let scrimDispose;
    let customDispose;
    // Rebuild the wallpaper scrim layer from the given strength.
    const applyScrim = (strength) => {
        scrimDispose?.();
        scrimDispose = undefined;
        const theme = ctx.theme.getTheme();
        const preset = DREAM_SKIN_PRESETS.find((p) => p.id === theme.preference);
        bound?.syncScrim(strength);
        if (preset?.wallpaper === undefined || strength >= 0.98)
            return;
        const bg = buildScrim(preset.palette, preset.wallpaper, strength);
        scrimDispose = ctx.theme.overrideTokens('scrim', {
            '--dsw-alias-bg-base': { light: bg, dark: bg },
        });
    };
    // Register (or refresh) the user's custom theme.
    const applyCustomTheme = (custom) => {
        customDispose?.();
        customDispose = undefined;
        if (custom === undefined || custom.wallpaperUrl === '')
            return;
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
        const wallpaper = { url: custom.wallpaperUrl, focusX: 0.5, focusY: 0.5 };
        customDispose = ctx.theme.register(buildThemeDefinition('custom', 'dark', palette, wallpaper));
    };
    // Restore persisted state: custom theme first, then the selection.
    const prefs = readPrefs();
    console.log('[dsh-beautify] restore prefs:', JSON.stringify(prefs), '| ls:', localStorage.getItem(STORAGE_KEY));
    applyCustomTheme(prefs.customTheme);
    if (prefs.themeId !== 'system') {
        const registered = ctx.theme.getTheme().themes.some((theme) => theme.id === prefs.themeId);
        if (registered)
            ctx.theme.setTheme(prefs.themeId);
    }
    applyScrim(prefs.scrimStrength);
    // Theme switch: mirror the preference and re-apply the scrim to the new theme.
    ctx.on('theme/change', (snapshot) => {
        bound?.syncPreference(snapshot.preference, snapshot.revision);
        applyScrim(readPrefs().scrimStrength);
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
                console.log('[dsh-beautify] select', id);
                ctx.theme.setTheme(id);
                const next = readPrefs();
                next.themeId = id;
                writePrefs(next);
                console.log('[dsh-beautify] localStorage readback:', localStorage.getItem(STORAGE_KEY));
            },
            setScrimStrength: (value) => {
                const next = readPrefs();
                next.scrimStrength = value;
                writePrefs(next);
                applyScrim(value);
            },
            saveCustomTheme: (custom) => {
                const next = readPrefs();
                next.customTheme = custom;
                next.themeId = 'custom';
                writePrefs(next);
                applyCustomTheme(custom);
                ctx.theme.setTheme('custom');
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