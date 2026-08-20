/**
 * Dream Skin settings store: a mirror of the theme preference and the scrim
 * strength. The plugin's apply-world listeners are the only writers; the
 * settings component reads via props.useStore.
 */
import { defineStore } from '@deepseek-ai/dsh-client-runtime/client';
/**
 * Declares the Dream Skin settings state and write surface.
 * @returns the store handle.
 */
export function createDreamSkinStore() {
    return defineStore({
        init: () => ({ preference: 'system', scrimStrength: 0.7, cursorEnabled: true, cursorSkin: 'whale', cursorSize: 48, cursorStateOverrides: {}, revision: -1 }),
        actions: {
            syncPreference: (d, preference, revision) => {
                if (revision <= d.revision)
                    return;
                d.preference = preference;
                d.revision = revision;
            },
            syncScrim: (d, scrimStrength) => {
                d.scrimStrength = scrimStrength;
            },
            syncCursorEnabled: (d, cursorEnabled) => {
                d.cursorEnabled = cursorEnabled;
            },
            syncCursorSkin: (d, cursorSkin) => {
                d.cursorSkin = cursorSkin;
            },
            syncCursorSize: (d, cursorSize) => {
                d.cursorSize = cursorSize;
            },
            syncCursorStateOverrides: (d, cursorStateOverrides) => {
                d.cursorStateOverrides = cursorStateOverrides;
            },
        },
    });
}
//# sourceMappingURL=settings-store.js.map