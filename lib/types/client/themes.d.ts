/**
 * Local Dream Skin presets: three Codex-Dream-Skin built-ins plus three curated
 * community picks, all mapped onto the DSW alias tokens with locally embedded
 * wallpapers (no network). State colors (error/success/warn) intentionally stay
 * on the base palette so system semantics remain legible in every skin.
 */
import type { ThemeDefinition } from '@deepseek-ai/dsh-client-ui-theme/client';
import { type Wallpaper } from './wallpapers.ts';
/** One selectable Dream Skin preset. */
export interface DreamSkinPreset {
    /** theme id (the setTheme argument). */
    id: string;
    /** User-facing label. */
    label: string;
    /** Registered theme definition. */
    definition: ThemeDefinition;
    /** Preview swatches: background, accent, text. */
    swatches: readonly string[];
    /** Wallpaper metadata when this preset ships a background image. */
    wallpaper?: Wallpaper;
}
/** Shipped local presets, in display order. */
export declare const DREAM_SKIN_PRESETS: readonly DreamSkinPreset[];
//# sourceMappingURL=themes.d.ts.map