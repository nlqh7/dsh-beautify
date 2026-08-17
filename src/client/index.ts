/**
 * Dream Skin client plugin: register the shipped color skins on the native
 * theme service, persist the selection + scrim strength to the Host settings
 * scope, apply the scrim as a dynamic token layer, and mount the 外观 section.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the theme service Context merge (ctx.theme) and its events.
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
// Type-only: pulls the settings shell's SlotMap merge (the 'settings.section' entry).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { BoundActions } from '@deepseek-ai/dsh-client-ui-slots'
import type { ThemeSnapshot } from '@deepseek-ai/dsh-client-ui-theme/client'
import { DREAM_SKIN_PRESETS, buildScrim } from './themes.ts'
import { createDreamSkinStore } from './settings-store.ts'
import { DreamSkinSettings } from './DreamSkinSettings.tsx'
import type { DreamSkinInjected } from './DreamSkinSettings.tsx'
import {
  DREAM_SKIN_NAMESPACE, DREAM_SKIN_THEME_FIELD, DEFAULT_SCRIM_STRENGTH,
} from '../dream-settings.ts'
import type { DreamSkinSettings as DreamSkinSettingsPrefs } from '../dream-settings.ts'

/** Required services: theme registry, slot system, and the durable settings scope. */
export const inject = ['theme', 'slots', 'settingsScope']

/** Renders nothing: ui-theme's appearance row is superseded by the 外观 section. */
const HiddenAppearanceRow = (): null => null

/**
 * Register every Dream Skin preset, restore persisted state, and mount the
 * 外观 switching section.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => {
    const disposers = DREAM_SKIN_PRESETS.map((preset) => ctx.theme.register(preset.definition))
    return () => { for (const dispose of disposers) dispose() }
  })

  const host = ctx.settingsScope.bind<DreamSkinSettingsPrefs>({ namespace: DREAM_SKIN_NAMESPACE })
  const store = createDreamSkinStore()
  let bound: BoundActions<typeof store> | undefined
  let scrimDispose: (() => void) | undefined

  // Rebuild the wallpaper scrim layer from the persisted strength. The preset
  // already embeds the default-strength scrim; this layer replaces it.
  const applyScrim = (): void => {
    scrimDispose?.()
    scrimDispose = undefined
    const snapshot = host.getSnapshot()
    if (snapshot.status !== 'ready') return
    const strength = snapshot.value?.scrimStrength ?? DEFAULT_SCRIM_STRENGTH
    const theme = ctx.theme.getTheme()
    const preset = DREAM_SKIN_PRESETS.find((p) => p.id === theme.preference)
    bound?.syncScrim(strength)
    if (preset?.wallpaper === undefined || strength >= 0.98) return
    const bg = buildScrim(preset.palette, preset.wallpaper, strength)
    scrimDispose = ctx.theme.overrideTokens('scrim', {
      '--dsw-alias-bg-base': { light: bg, dark: bg },
    })
  }

  // Restore the persisted theme once the snapshot is ready — the bind starts
  // `loading`, so a single getSnapshot can miss the saved value.
  const restoreTheme = (): void => {
    const snapshot = host.getSnapshot()
    if (snapshot.status !== 'ready') return
    const saved = snapshot.value?.themeId
    if (saved === undefined || saved === 'system') return
    const registered = ctx.theme.getTheme().themes.some((theme) => theme.id === saved)
    if (registered && ctx.theme.getTheme().preference !== saved) ctx.theme.setTheme(saved)
  }
  restoreTheme()
  applyScrim()
  ctx.effect(() => host.subscribe(() => { restoreTheme(); applyScrim() }))

  // Theme switch: mirror the preference and re-apply the scrim to the new theme.
  ctx.on('theme/change', (snapshot: ThemeSnapshot) => {
    bound?.syncPreference(snapshot.preference, snapshot.revision)
    applyScrim()
  })

  const injected = (actions: BoundActions<typeof store>): DreamSkinInjected => {
    bound = actions
    // Re-sync from the getter so no event is lost between registration and
    // first render (the store's revision guard drops stale duplicates).
    const snapshot = ctx.theme.getTheme()
    bound.syncPreference(snapshot.preference, snapshot.revision)
    applyScrim()
    return {
      presets: DREAM_SKIN_PRESETS,
      select: (id: string) => {
        ctx.theme.setTheme(id)
        void host.set(DREAM_SKIN_THEME_FIELD, id)
      },
      setScrimStrength: (value: number) => {
        void host.set('scrimStrength', value)
      },
    }
  }

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'dream-skin',
    order: 25,
    label: '外观',
    store,
    inject: injected,
  }, DreamSkinSettings))

  // Shadow ui-theme's appearance row: light/dark/system + themes now live in
  // the 外观 section, so the General row would be a duplicate.
  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'appearance',
    order: 10,
    priority: -1,
  }, HiddenAppearanceRow))
}
