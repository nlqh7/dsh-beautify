/**
 * Dream Skin settings store: a mirror of the theme preference plus the scrim
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
        init: () => ({ preference: 'system', scrimStrength: 0.7, revision: -1 }),
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
        },
    });
}
//# sourceMappingURL=settings-store.js.map