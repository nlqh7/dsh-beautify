/**
 * Host registration for the Dream Skin theme layer: the durable settings
 * section carrying the selected theme id. The theme definitions and the
 * settings surface live on the Client half.
 */
import type { Context } from '@deepseek-ai/cordis'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import { DREAM_SKIN_NAMESPACE, DreamSkinSettingsSchema } from './dream-settings.ts'

export const name = 'dsh-dream-skin'

const DREAM_SKIN_NS = settingsNamespace(DREAM_SKIN_NAMESPACE)

/**
 * Register the durable Dream Skin settings section when the Host settings
 * service is composed.
 * @param ctx - Host context that may acquire the settings service.
 */
export function apply(ctx: Context): void {
  console.log('[dsh-dream-skin] host apply executing')
  ctx.effect(() => {
    console.log('[dsh-dream-skin] host effect started')
    return () => { console.log('[dsh-dream-skin] host effect disposed') }
  })
  ctx.inject(['settings'], (settingsCtx) => {
    console.log('[dsh-dream-skin] settings service available, registering namespace')
    try {
      settingsCtx.settings.register(DREAM_SKIN_NS, DreamSkinSettingsSchema)
      console.log('[dsh-dream-skin] register succeeded')
    } catch (error) {
      console.log('[dsh-dream-skin] register FAILED:', error instanceof Error ? error.message : String(error))
    }
    const svc = settingsCtx.settings as unknown as { describe?: () => Array<{ ns: string }> }
    setTimeout(() => {
      if (typeof svc.describe === 'function') {
        try {
          const descriptors = svc.describe()
          console.log('[dsh-dream-skin] host describe ns:', JSON.stringify(descriptors.map(d => d.ns)))
        } catch (error) {
          console.log('[dsh-dream-skin] host describe ERR:', error instanceof Error ? error.message : String(error))
        }
      } else {
        console.log('[dsh-dream-skin] settings has no describe; keys:', Object.keys(settingsCtx.settings as object).slice(0, 12))
      }
    }, 3000)
  })
}
