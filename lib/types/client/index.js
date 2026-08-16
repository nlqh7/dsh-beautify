import { DREAM_SKIN_PRESETS } from "./themes.js";
import { createDreamSkinStore } from "./settings-store.js";
import { DreamSkinSettings } from "./DreamSkinSettings.js";
import { DREAM_SKIN_NAMESPACE, DREAM_SKIN_THEME_FIELD } from "../dream-settings.js";
/** Required services: theme registry, slot system, and the durable settings scope. */
export const inject = ['theme', 'slots', 'settingsScope'];
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
    // Restore the persisted selection once the presets above are registered.
    const saved = host.getSnapshot().value?.themeId;
    if (saved !== undefined && saved !== 'system' && DREAM_SKIN_PRESETS.some((preset) => preset.id === saved)) {
        ctx.theme.setTheme(saved);
    }
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
        label: 'Dream Skin',
        store,
        inject: injected,
    }, DreamSkinSettings));
}
//# sourceMappingURL=index.js.map