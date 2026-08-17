import type { InjectFace, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { createDreamSkinStore } from './settings-store.ts';
import type { DreamSkinPreset } from './themes.ts';
/** Custom-theme form shape persisted to the settings document. */
export interface CustomThemeInput {
    /** Wallpaper image URL (data URI or http(s)). */
    wallpaperUrl: string;
    /** Accent (brand) color. */
    accent: string;
    /** Background color. */
    background: string;
    /** Text color. */
    text: string;
}
/** Registration-side business face: the roster, theme write, scrim write, custom write. */
export interface DreamSkinInjected {
    /** Shipped presets in display order. */
    presets: readonly DreamSkinPreset[];
    /** Switch the theme preference to a preset id, a built-in mode, or `system`. */
    select: (id: string) => void;
    /** Persist the wallpaper scrim strength (0..1). */
    setScrimStrength: (value: number) => void;
    /** Persist the custom theme and apply it. */
    saveCustomTheme: (custom: CustomThemeInput) => void;
}
/** Full component props. */
export type DreamSkinSettingsProps = PropsRuntime<'settings.section'> & PropsStore<ReturnType<typeof createDreamSkinStore>> & InjectFace<DreamSkinInjected>;
/**
 * Render the appearance settings section.
 * @param props - composed slot props.
 * @returns the section element tree.
 */
export declare function DreamSkinSettings({ useStore, presets, select, setScrimStrength, saveCustomTheme, }: DreamSkinSettingsProps): import("react").JSX.Element;
//# sourceMappingURL=DreamSkinSettings.d.ts.map