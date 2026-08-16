import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "@deepseek-ai/schemastery";
//#region lib/types/dream-settings.js
/** Dream Skin theme preference stored in the Host user-settings document. */
/** Settings namespace owned by the dream-skin plugin. */
const DREAM_SKIN_NAMESPACE = "dream-skin";
/** Durable theme schema; also the wire envelope the browser scope validates against. */
const DreamSkinSettingsSchema = z.object({ ["themeId"]: z.string().default("system") });
//#endregion
//#region lib/types/index.js
const name = "dsh-dream-skin";
const DREAM_SKIN_NS = settingsNamespace(DREAM_SKIN_NAMESPACE);
/**
* Register the durable Dream Skin settings section when the Host settings
* service is composed.
* @param ctx - Host context that may acquire the settings service.
*/
function apply(ctx) {
	ctx.inject(["settings"], (settingsCtx) => {
		settingsCtx.settings.register(DREAM_SKIN_NS, DreamSkinSettingsSchema);
	});
}
//#endregion
export { apply, name };
