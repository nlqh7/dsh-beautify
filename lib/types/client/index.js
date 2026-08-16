import { DREAM_SKIN_PRESETS } from "./themes.js";
import { createDreamSkinStore } from "./settings-store.js";
import { DreamSkinSettings } from "./DreamSkinSettings.js";
/** Required services: the theme registry this package skins and the slot system. */
export const inject = ['theme', 'slots'];
/**
 * Register every Dream Skin preset and mount the switching section.
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
            select: (id) => { ctx.theme.setTheme(id); },
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