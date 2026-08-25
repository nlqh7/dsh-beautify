/** Dream Skin theme preference stored in the Host user-settings document. */
import z from '@deepseek-ai/schemastery';
/** Settings namespace owned by the dream-skin plugin. */
export const DREAM_SKIN_NAMESPACE = 'dream-skin';
/** Field carrying the selected theme id. */
export const DREAM_SKIN_THEME_FIELD = 'themeId';
/** Default wallpaper scrim strength when the settings document has no override. */
export const DEFAULT_SCRIM_STRENGTH = 0.7;
/** Durable theme schema; also the wire envelope the browser scope validates against. */
export const DreamSkinSettingsSchema = z.object({
    [DREAM_SKIN_THEME_FIELD]: z.string().default('system'),
    scrimStrength: z.number().default(DEFAULT_SCRIM_STRENGTH),
    // Optional to match the interface: a minimal document without a custom theme
    // is valid, and the fallback colors are optional inside it as well.
    customTheme: z.object({
        wallpaperUrl: z.string(),
        accent: z.string(),
        background: z.string(),
        text: z.string(),
        panel: z.string().required(false),
        panelAlt: z.string().required(false),
        muted: z.string().required(false),
        line: z.string().required(false),
    }).required(false),
});
//# sourceMappingURL=dream-settings.js.map