/** Dream Skin theme preference stored in the Host user-settings document. */
import z from '@deepseek-ai/schemastery';
/** Settings namespace owned by the dream-skin plugin. */
export declare const DREAM_SKIN_NAMESPACE = "dream-skin";
/** Field carrying the selected theme id. */
export declare const DREAM_SKIN_THEME_FIELD = "themeId";
/** Default wallpaper scrim strength when the settings document has no override. */
export declare const DEFAULT_SCRIM_STRENGTH = 0.7;
/** Durable theme section shared by the Host schema and the browser scope. */
export interface DreamSkinSettings {
    /** Selected theme id, or `system` for the built-in scheme. */
    themeId: string;
    /** Wallpaper scrim (readability overlay) strength, 0..1. */
    scrimStrength: number;
}
/** Durable theme schema; also the wire envelope the browser scope validates against. */
export declare const DreamSkinSettingsSchema: z<DreamSkinSettings>;
//# sourceMappingURL=dream-settings.d.ts.map