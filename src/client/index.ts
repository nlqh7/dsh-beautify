/**
 * Dream Skin client plugin: register the shipped color skins on the native
 * theme service, persist the selection to the Host settings scope, and mount
 * a settings section that switches them.
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
import { DREAM_SKIN_NAMESPACE, DREAM_SKIN_THEME_FIELD } from '../dream-settings.ts'
import type { DreamSkinSettings as DreamSkinSettingsPrefs } from '../dream-settings.ts'

/** Required services: theme registry, slot system, and the durable settings scope. */
export const inject = ['theme', 'slots', 'settingsScope']

/**
 * Register every Dream Skin preset, restore the persisted selection, and
 * mount the switching section.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => {
    const disposers = DREAM_SKIN_PRESETS.map((preset) => ctx.theme.register(preset.definition))
    return () => { for (const dispose of disposers) dispose() }
  })

  const host = ctx.settingsScope.bind<DreamSkinSettingsPrefs>({ namespace: DREAM_SKIN_NAMESPACE })

  // Restore the persisted selection once the snapshot is ready — the bind
  // starts `loading`, so a single getSnapshot can miss the saved value.
  const restore = (): void => {
    const snapshot = host.getSnapshot()
    if (snapshot.status !== 'ready') return
    const saved = snapshot.value?.themeId
    if (saved === undefined || saved === 'system') return
    const registered = ctx.theme.getTheme().themes.some((theme) => theme.id === saved)
    if (registered) ctx.theme.setTheme(saved)
  }
  restore()
  ctx.effect(() => host.subscribe(restore))

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
      select: (id: string) => {
        ctx.theme.setTheme(id)
        void host.set(DREAM_SKIN_THEME_FIELD, id)
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
}
