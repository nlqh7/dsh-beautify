import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "@deepseek-ai/schemastery";
//#region lib/types/dream-settings.js
/** Dream Skin theme preference stored in the Host user-settings document. */
/** Settings namespace owned by the dream-skin plugin. */
const DREAM_SKIN_NAMESPACE = "dream-skin";
/** Field carrying the selected theme id. */
const DREAM_SKIN_THEME_FIELD = "themeId";
/** Default wallpaper scrim strength when the settings document has no override. */
const DEFAULT_SCRIM_STRENGTH = .7;
/** Durable theme schema; also the wire envelope the browser scope validates against. */
const DreamSkinSettingsSchema = z.object({
	[DREAM_SKIN_THEME_FIELD]: z.string().default("system"),
	scrimStrength: z.number().default(DEFAULT_SCRIM_STRENGTH),
	customTheme: z.object({
		wallpaperUrl: z.string(),
		accent: z.string(),
		background: z.string(),
		text: z.string()
	})
});
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
	console.log("[dsh-dream-skin] host apply executing");
	ctx.effect(() => {
		console.log("[dsh-dream-skin] host effect started");
		return () => {
			console.log("[dsh-dream-skin] host effect disposed");
		};
	});
	ctx.inject(["settings"], (settingsCtx) => {
		console.log("[dsh-dream-skin] settings service available, registering namespace");
		try {
			settingsCtx.settings.register(DREAM_SKIN_NS, DreamSkinSettingsSchema);
			console.log("[dsh-dream-skin] register succeeded");
		} catch (error) {
			console.log("[dsh-dream-skin] register FAILED:", error instanceof Error ? error.message : String(error));
		}
		const svc = settingsCtx.settings;
		setTimeout(() => {
			if (typeof svc.describe === "function") try {
				const descriptors = svc.describe();
				console.log("[dsh-dream-skin] host describe ns:", JSON.stringify(descriptors.map((d) => d.ns)));
			} catch (error) {
				console.log("[dsh-dream-skin] host describe ERR:", error instanceof Error ? error.message : String(error));
			}
			else console.log("[dsh-dream-skin] settings has no describe; keys:", Object.keys(settingsCtx.settings).slice(0, 12));
		}, 3e3);
	});
}
//#endregion
export { apply, name };
