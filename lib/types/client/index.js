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
    // 诊断：describe 返回的 namespaces 列表（确认 dream-skin 是否在 Host 侧注册）
    {
        const connection = ctx.get('connection');
        const timer = ctx.get('timer');
        if (connection !== undefined && timer !== undefined) {
            timer.setTimeout(() => {
                void connection.api.settings.describe({}).then((raw) => {
                    const value = raw.result?.value;
                    console.log('[dsh-dream-skin] describe namespaces:', JSON.stringify(value?.namespaces?.map((n) => n.ns)));
                }).catch((error) => {
                    console.log('[dsh-dream-skin] describe ERR:', error instanceof Error ? error.message : String(error));
                });
            }, 1500);
        }
    }
    const host = ctx.settingsScope.bind({ namespace: DREAM_SKIN_NAMESPACE });
    {
        const scopeSnap = host.getSnapshot();
        console.log(`[dsh-dream-skin] settings scope: status=${scopeSnap.status} mode=${scopeSnap.mode} writable=${scopeSnap.writable}`);
    }
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
    ctx.effect(() => host.subscribe(() => {
        const snap = host.getSnapshot();
        console.log(`[dsh-dream-skin] scope change: status=${snap.status} writable=${snap.writable} mode=${snap.mode}`);
    }));
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
                const snap = host.getSnapshot();
                console.log(`[dsh-dream-skin] select ${id}: status=${snap.status} writable=${snap.writable}`);
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