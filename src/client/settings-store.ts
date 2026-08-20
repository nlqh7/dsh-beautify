/**
 * Dream Skin settings store: a mirror of the theme preference and the scrim
 * strength. The plugin's apply-world listeners are the only writers; the
 * settings component reads via props.useStore.
 */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'
import type { CursorSkinId } from './cursor-images.ts'

/** Store state mirrored from the theme + settings snapshots. */
export interface DreamSkinState {
  /** Persisted preference (selection state reads this, never the resolved active theme). */
  preference: string
  /** Wallpaper scrim strength, 0..1. */
  scrimStrength: number
  /** Whale-cursor master switch; false = native OS cursor. */
  cursorEnabled: boolean
  /** Whale-cursor art skin (whale / custom). */
  cursorSkin: CursorSkinId
  /** Whale-cursor render size (px, 24..64). */
  cursorSize: number
  /**
   * Per-state enable map: a state whose flag is `false` keeps the native OS
   * cursor instead of the whale sprite. Absent keys default to enabled.
   */
  cursorStateOverrides: Record<string, boolean>
  /** Service revision; -1 until first sync so revision 0 lands as a change. */
  revision: number
}

/** Declared action shape giving the exported factory a stable return type. */
type DreamSkinActions = {
  syncPreference: (draft: DreamSkinState, preference: string, revision: number) => void
  syncScrim: (draft: DreamSkinState, scrimStrength: number) => void
  syncCursorEnabled: (draft: DreamSkinState, cursorEnabled: boolean) => void
  syncCursorSkin: (draft: DreamSkinState, cursorSkin: CursorSkinId) => void
  syncCursorSize: (draft: DreamSkinState, cursorSize: number) => void
  syncCursorStateOverrides: (draft: DreamSkinState, cursorStateOverrides: Record<string, boolean>) => void
}

/**
 * Declares the Dream Skin settings state and write surface.
 * @returns the store handle.
 */
export function createDreamSkinStore(): EngineStoreHandle<DreamSkinState, DreamSkinActions> {
  return defineStore({
    init: (): DreamSkinState => ({ preference: 'system', scrimStrength: 0.7, cursorEnabled: true, cursorSkin: 'whale', cursorSize: 48, cursorStateOverrides: {}, revision: -1 }),
    actions: {
      syncPreference: (d, preference: string, revision: number) => {
        if (revision <= d.revision) return
        d.preference = preference
        d.revision = revision
      },
      syncScrim: (d, scrimStrength: number) => {
        d.scrimStrength = scrimStrength
      },
      syncCursorEnabled: (d, cursorEnabled: boolean) => {
        d.cursorEnabled = cursorEnabled
      },
      syncCursorSkin: (d, cursorSkin: CursorSkinId) => {
        d.cursorSkin = cursorSkin
      },
      syncCursorSize: (d, cursorSize: number) => {
        d.cursorSize = cursorSize
      },
      syncCursorStateOverrides: (d, cursorStateOverrides: Record<string, boolean>) => {
        d.cursorStateOverrides = cursorStateOverrides
      },
    },
  })
}
