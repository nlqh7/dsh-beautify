import type { InjectFace, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { createDreamSkinStore } from './settings-store.ts';
import { type DreamSkinPreset, type WallpaperKnobs } from './themes.ts';
import { type CursorSkinId } from './cursor-images.ts';
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
    /** Panel surface color; falls back to the background when unset. */
    panel?: string;
    /** Elevated panel surface color; falls back to the background when unset. */
    panelAlt?: string;
    /** Secondary text color; falls back to the text when unset. */
    muted?: string;
    /** Hairline/border color; falls back to the accent when unset. */
    line?: string;
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
    /** Merge global wallpaper knobs and re-apply the current skin. */
    tweak: (partial: Partial<WallpaperKnobs>) => void;
    /** Reset the global wallpaper knobs to defaults. */
    resetTweak: () => void;
    /** Master switch for the whale cursor; off = native OS cursor. */
    setCursorEnabled: (on: boolean) => void;
    /** Persist and apply the whale-cursor art skin (whale / custom). */
    setCursorSkin: (id: CursorSkinId) => void;
    /** Persist and apply the whale-cursor render size (px, 24..64). */
    setCursorSize: (px: number) => void;
    /** Save (or remove with null) a user-uploaded cursor image for one state. */
    saveCursorUpload: (state: string, dataUrl: string | null) => void;
    /** Toggle the whale cursor between one regular sprite and per-target states. */
    /** Always-on per-target state detection (auto-switch); per-state art toggles below. */
    setCursorStateOverride: (state: string, on: boolean) => void;
}
/** Full component props. */
export type DreamSkinSettingsProps = PropsRuntime<'settings.section'> & PropsStore<ReturnType<typeof createDreamSkinStore>> & InjectFace<DreamSkinInjected>;
export declare function DreamSkinSettings({ useStore, presets, select, saveCustomTheme, tweak, resetTweak: resetTweakFn, setCursorEnabled, setCursorSkin, setCursorSize, saveCursorUpload, setCursorStateOverride, }: DreamSkinSettingsProps): import("react").JSX.Element;
//# sourceMappingURL=DreamSkinSettings.d.ts.map