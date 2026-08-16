/**
 * Dream Skin settings store: a mirror of the theme service preference. The
 * plugin's apply-world theme/change listener is the only writer; the settings
 * component reads via props.useStore.
 */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'

/** Store state mirrored from the theme snapshot. */
export interface DreamSkinState {
  /** Persisted preference (selection state reads this, never the resolved active theme). */
  preference: string
  /** Service revision; -1 until first sync so revision 0 lands as a change. */
  revision: number
}

/** Declared action shape giving the exported factory a stable return type. */
type DreamSkinActions = {
  sync: (draft: DreamSkinState, preference: string, revision: number) => void
}

/**
 * Declares the Dream Skin settings state and write surface.
 * @returns the store handle.
 */
export function createDreamSkinStore(): EngineStoreHandle<DreamSkinState, DreamSkinActions> {
  return defineStore({
    init: (): DreamSkinState => ({ preference: 'system', revision: -1 }),
    actions: {
      sync: (d, preference: string, revision: number) => {
        if (revision <= d.revision) return
        d.preference = preference
        d.revision = revision
      },
    },
  })
}
