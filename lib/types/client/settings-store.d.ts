/**
 * Dream Skin settings store: a mirror of the theme preference plus the scrim
 * strength. The plugin's apply-world listeners are the only writers; the
 * settings component reads via props.useStore.
 */
import { type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client';
/** Store state mirrored from the theme + settings snapshots. */
export interface DreamSkinState {
    /** Persisted preference (selection state reads this, never the resolved active theme). */
    preference: string;
    /** Wallpaper scrim strength, 0..1. */
    scrimStrength: number;
    /** Service revision; -1 until first sync so revision 0 lands as a change. */
    revision: number;
}
/** Declared action shape giving the exported factory a stable return type. */
type DreamSkinActions = {
    syncPreference: (draft: DreamSkinState, preference: string, revision: number) => void;
    syncScrim: (draft: DreamSkinState, scrimStrength: number) => void;
};
/**
 * Declares the Dream Skin settings state and write surface.
 * @returns the store handle.
 */
export declare function createDreamSkinStore(): EngineStoreHandle<DreamSkinState, DreamSkinActions>;
export {};
//# sourceMappingURL=settings-store.d.ts.map