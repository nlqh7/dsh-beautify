/**
 * Dream Skin settings section: the shipped presets as cards with preview
 * swatches, plus a "follow system" reset. Selection reads the persisted
 * preference (never the resolved active theme) and writes through the injected
 * select callback.
 */
import type { InjectFace, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { createDreamSkinStore } from './settings-store.ts';
import type { DreamSkinPreset } from './themes.ts';
/** Registration-side business face: the roster and the theme write. */
export interface DreamSkinInjected {
    /** Shipped presets in display order. */
    presets: readonly DreamSkinPreset[];
    /** Switch the theme preference to a preset id, or `system` to reset. */
    select: (id: string) => void;
}
/** Full component props. */
export type DreamSkinSettingsProps = PropsRuntime<'settings.section'> & PropsStore<ReturnType<typeof createDreamSkinStore>> & InjectFace<DreamSkinInjected>;
/**
 * Render the Dream Skin settings section.
 * @param props - composed slot props.
 * @returns the section element tree.
 */
export declare function DreamSkinSettings({ useStore, presets, select }: DreamSkinSettingsProps): import("react").JSX.Element;
//# sourceMappingURL=DreamSkinSettings.d.ts.map