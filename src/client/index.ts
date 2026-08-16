/**
 * Dream Skin client plugin: register the shipped color skins on the native
 * theme service and mount a settings section that switches them. The theme
 * definitions are static and immutable; the service owns the live preference,
 * so the plugin only mirrors its snapshot into the settings store.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the theme service Context merge (ctx.theme) and its events.
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
// Type-only: pulls the settings shell's SlotMap merge (the 'settings.section' entry).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { BoundActions } from '@deepseek-ai/dsh-client-ui-slots'
import type { ThemeSnapshot } from '@deepseek-ai/dsh-client-ui-theme/client'
import { DREAM_SKIN_PRESETS } from './themes.ts'
import { createDreamSkinStore } from './settings-store.ts'
import { DreamSkinSettings } from './DreamSkinSettings.tsx'
import type { DreamSkinInjected } from './DreamSkinSettings.tsx'

/** Required services: the theme registry this package skins and the slot system. */
export const inject = ['theme', 'slots']

/**
 * Register every Dream Skin preset and mount the switching section.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => {
    const disposers = DREAM_SKIN_PRESETS.map((preset) => ctx.theme.register(preset.definition))
    return () => { for (const dispose of disposers) dispose() }
  })

  const store = createDreamSkinStore()
  let bound: BoundActions<typeof store> | undefined
  const sync = (snapshot: ThemeSnapshot): void => {
    bound?.sync(snapshot.preference, snapshot.revision)
  }
  ctx.on('theme/change', sync)

  const injected = (actions: BoundActions<typeof store>): DreamSkinInjected => {
    bound = actions
    // Re-sync from the getter so no event is lost between registration and
    // first render (the store's revision guard drops stale duplicates).
    sync(ctx.theme.getTheme())
    return {
      presets: DREAM_SKIN_PRESETS,
      select: (id: string) => { ctx.theme.setTheme(id) },
    }
  }

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'dream-skin',
    order: 25,
    label: 'Dream Skin',
    store,
    inject: injected,
  }, DreamSkinSettings))
}
