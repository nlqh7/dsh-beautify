import { DREAM_SKIN_PRESETS } from "./themes.js";
import { createDreamSkinStore } from "./settings-store.js";
import { DreamSkinSettings } from "./DreamSkinSettings.js";
import { DREAM_SKIN_NAMESPACE, DREAM_SKIN_THEME_FIELD } from "../dream-settings.js";
/** Required services: theme registry, slot system, and the durable settings scope. */
export const inject = ['theme', 'slots', 'settingsScope'];
/** Renders nothing: ui-theme's appearance row is superseded by the 外观 section. */
const HiddenAppearanceRow = () => null;
/**
 * Register every Dream Skin preset, restore the persisted selection, and
 * mount the switching section.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx) {
    ctx.effect(() => {
        const disposers = DREAM_SKIN_PRESETS.map((preset) => ctx.theme.register(preset.definition));
        return () => { for (const dispose of disposers)
            dispose(); };
    });
    const host = ctx.settingsScope.bind({ namespace: DREAM_SKIN_NAMESPACE });
    // Restore the persisted selection once the snapshot is ready — the bind
    // starts `loading`, so a single getSnapshot can miss the saved value.
    const restore = () => {
        const snapshot = host.getSnapshot();
        if (snapshot.status !== 'ready')
            return;
        const saved = snapshot.value?.themeId;
        if (saved === undefined || saved === 'system')
            return;
        const registered = ctx.theme.getTheme().themes.some((theme) => theme.id === saved);
        if (registered)
            ctx.theme.setTheme(saved);
    };
    restore();
    ctx.effect(() => host.subscribe(restore));
    const store = createDreamSkinStore();
    let bound;
    const sync = (snapshot) => {
        bound?.sync(snapshot.preference, snapshot.revision);
    };
    ctx.on('theme/change', sync);
    const injected = (actions) => {
        bound = actions;
        // Re-sync from the getter so no event is lost between registration and
        // first render (the store's revision guard drops stale duplicates).
        sync(ctx.theme.getTheme());
        return {
            presets: DREAM_SKIN_PRESETS,
            select: (id) => {
                ctx.theme.setTheme(id);
                void host.set(DREAM_SKIN_THEME_FIELD, id);
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