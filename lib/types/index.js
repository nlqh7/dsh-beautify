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
    ctx.effect(() => {
        console.log('[dsh-dream-skin] host effect started');
        return () => { console.log('[dsh-dream-skin] host effect disposed'); };
    });
    ctx.inject(['settings'], (settingsCtx) => {
        console.log('[dsh-dream-skin] settings service available, registering namespace');
        try {
            settingsCtx.settings.register(DREAM_SKIN_NS, DreamSkinSettingsSchema);
            console.log('[dsh-dream-skin] register succeeded');
        }
        catch (error) {
            console.log('[dsh-dream-skin] register FAILED:', error instanceof Error ? error.message : String(error));
        }
    });
}
//# sourceMappingURL=index.js.map