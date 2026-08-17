import { DREAM_SKIN_PRESETS, buildScrim, buildThemeDefinition } from "./themes.js";
import { createDreamSkinStore } from "./settings-store.js";
import { DreamSkinSettings } from "./DreamSkinSettings.js";
import { DREAM_SKIN_NAMESPACE, DREAM_SKIN_THEME_FIELD, DEFAULT_SCRIM_STRENGTH, } from "../dream-settings.js";
/** Required services: theme registry, slot system, and the durable settings scope. */
export const inject = ['theme', 'slots', 'settingsScope'];
/** Renders nothing: ui-theme's appearance row is superseded by the 外观 section. */
const HiddenAppearanceRow = () => null;
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
    const host = ctx.settingsScope.bind({ namespace: DREAM_SKIN_NAMESPACE });
    const store = createDreamSkinStore();
    let bound;
    let scrimDispose;
    // Rebuild the wallpaper scrim layer from the persisted strength. The preset
    // already embeds the default-strength scrim; this layer replaces it.
    const applyScrim = () => {
        scrimDispose?.();
        scrimDispose = undefined;
        const snapshot = host.getSnapshot();
        if (snapshot.status !== 'ready')
            return;
        const strength = snapshot.value?.scrimStrength ?? DEFAULT_SCRIM_STRENGTH;
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
    // Restore the persisted theme once the snapshot is ready — the bind starts
    // `loading`, so a single getSnapshot can miss the saved value.
    const restoreTheme = () => {
        const snapshot = host.getSnapshot();
        if (snapshot.status !== 'ready')
            return;
        const saved = snapshot.value?.themeId;
        if (saved === undefined || saved === 'system')
            return;
        const registered = ctx.theme.getTheme().themes.some((theme) => theme.id === saved);
        if (registered && ctx.theme.getTheme().preference !== saved)
            ctx.theme.setTheme(saved);
    };
    // Register (or refresh) the user's custom theme from persisted settings.
    let customDispose;
    const applyCustomTheme = () => {
        customDispose?.();
        customDispose = undefined;
        const custom = host.getSnapshot().value?.customTheme;
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
    applyCustomTheme();
    restoreTheme();
    applyScrim();
    ctx.effect(() => host.subscribe(() => { applyCustomTheme(); restoreTheme(); applyScrim(); }));
    // Theme switch: mirror the preference and re-apply the scrim to the new theme.
    ctx.on('theme/change', (snapshot) => {
        bound?.syncPreference(snapshot.preference, snapshot.revision);
        applyScrim();
    });
    const injected = (actions) => {
        bound = actions;
        // Re-sync from the getter so no event is lost between registration and
        // first render (the store's revision guard drops stale duplicates).
        const snapshot = ctx.theme.getTheme();
        bound.syncPreference(snapshot.preference, snapshot.revision);
        applyScrim();
        return {
            presets: DREAM_SKIN_PRESETS,
            select: (id) => {
                ctx.theme.setTheme(id);
                void host.set(DREAM_SKIN_THEME_FIELD, id);
            },
            setScrimStrength: (value) => {
                void host.set('scrimStrength', value);
            },
            saveCustomTheme: (custom) => {
                void host.set('customTheme', custom);
                void host.set(DREAM_SKIN_THEME_FIELD, 'custom');
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