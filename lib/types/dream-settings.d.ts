/** Dream Skin theme preference stored in the Host user-settings document. */
import z from '@deepseek-ai/schemastery';
/** Settings namespace owned by the dream-skin plugin. */
export declare const DREAM_SKIN_NAMESPACE = "dream-skin";
/** Field carrying the selected theme id. */
export declare const DREAM_SKIN_THEME_FIELD = "themeId";
/** Durable theme section shared by the Host schema and the browser scope. */
export interface DreamSkinSettings {
    /** Selected theme id, or `system` for the built-in scheme. */
    themeId: string;
}
/** Durable theme schema; also the wire envelope the browser scope validates against. */
export declare const DreamSkinSettingsSchema: z<DreamSkinSettings>;
//# sourceMappingURL=dream-settings.d.ts.map