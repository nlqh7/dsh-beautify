/**
 * Local Dream Skin presets: three Codex-Dream-Skin built-ins plus three curated
 * community picks, all mapped onto the DSW alias tokens with locally embedded
 * wallpapers (no network). State colors (error/success/warn) intentionally stay
 * on the base palette so system semantics remain legible in every skin.
 */
import type { ThemeDefinition } from '@deepseek-ai/dsh-client-ui-theme/client';
import { type Wallpaper } from './wallpapers.ts';
/** Dream Skin palette: the ten colors the source themes declare. */
export interface DreamSkinPalette {
    background: string;
    panel: string;
    panelAlt: string;
    accent: string;
    accentAlt: string;
    secondary: string;
    highlight: string;
    text: string;
    muted: string;
    line: string;
}
/**
 * Build the wallpaper background CSS: a left-to-right readability scrim over
 * the wallpaper, focused by the wallpaper's own focus point. Strength is
 * 0 (no scrim, wallpaper fully visible) to 1 (full default scrim).
 */
export declare function buildScrim(p: DreamSkinPalette, wallpaper: Wallpaper, strength: number): string;
/** Build a full theme definition from a palette and an optional wallpaper (custom themes). */
export declare function buildThemeDefinition(id: string, colorScheme: 'light' | 'dark', p: DreamSkinPalette, wallpaper?: Wallpaper): ThemeDefinition;
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
    /** Original palette, for dynamic scrim rebuilds. */
    palette: DreamSkinPalette;
}
/** Shipped local presets, in display order. */
export declare const DREAM_SKIN_PRESETS: readonly DreamSkinPreset[];
//# sourceMappingURL=themes.d.ts.map