import { settingsNamespace } from '@deepseek-ai/dsh-settings';
import { DREAM_SKIN_NAMESPACE, DreamSkinSettingsSchema } from "./dream-settings.js";
export const name = 'dsh-dream-skin';
const DREAM_SKIN_NS = settingsNamespace(DREAM_SKIN_NAMESPACE);
/**
 * Register the durable Dream Skin settings section when the Host settings
 * service is composed.
 * @param ctx - Host context that may acquire the settings service.
 */
export function apply(ctx) {
    console.log('[dsh-dream-skin] host apply executing');
    ctx.inject(['settings'], (settingsCtx) => {
        console.log('[dsh-dream-skin] settings service available, registering namespace');
        settingsCtx.settings.register(DREAM_SKIN_NS, DreamSkinSettingsSchema);
    });
}
//# sourceMappingURL=index.js.map