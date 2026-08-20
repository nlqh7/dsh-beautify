/**
 * Host registration for the Dream Skin theme layer: no-op for appearance
 * (browser localStorage), plus the vendored Wallpaper Engine bridge (inventory
 * enumeration + HTTP media routes) and the vendored DeepSeek balance whale
 * widget (pet + balance) when the webserver is composed.
 *
 * Every sub-feature is fault-isolated: a missing optional service or a failed
 * mount degrades to a warning instead of taking the whole plugin (and the dsh
 * boot) down. The per-feature status is exposed over
 * `GET /dsh-beautify/status.json` so the settings surface can show a visible
 * notice instead of leaving the user guessing why a feature is missing.
 */
import type { Context } from '@deepseek-ai/cordis'
import { registerWallpaperEngine } from './wallpaper-engine.ts'
import { apply as applyWhaleWidget } from './whale-widget.js'

export const name = 'dsh-beautify'

/**
 * Web-only bridge: the webserver serves the WE routes + whale widget + the
 * status endpoint; the credentials service feeds the whale's balance fetch. On
 * profiles without a credentials provider the loader skips this plugin with a
 * warning (never crashes the boot), per the loader's partial-failure tolerance.
 */
export const inject = ['webServer', 'credentials']

/** Per-feature health, surfaced to the settings UI via /dsh-beautify/status.json. */
export interface BeautifyFeatureStatus {
  ok: boolean
  reason?: string
}

/**
 * Mount the wallpaper-engine bridge and the balance whale widget; appearance
 * state itself persists via browser localStorage on the Client half. Each
 * mount is guarded so a failure in one surface never crashes the plugin or
 * the boot, and the failure is recorded for the settings surface to display.
 * @param ctx - Host context carrying the webserver.
 */
export function apply(ctx: Context): void {
  const status: Record<string, BeautifyFeatureStatus> = {}

  try {
    registerWallpaperEngine(ctx)
    status.wallpaper = { ok: true }
  } catch (err) {
    status.wallpaper = { ok: false, reason: String((err as Error)?.message ?? err) }
    console.warn('[dsh-beautify] 壁纸引擎加载失败，已跳过（其余功能不受影响）:', err)
  }

  try {
    const credentials = (ctx as { credentials?: unknown }).credentials
    if (credentials !== undefined && typeof (credentials as { resolve?: unknown }).resolve === 'function') {
      applyWhaleWidget(ctx)
      status.whale = { ok: true }
    } else {
      status.whale = { ok: false, reason: '未检测到凭据服务' }
      console.warn('[dsh-beautify] 未检测到凭据服务，余额小鲸鱼已跳过；皮肤/光标/设置优化不受影响。')
    }
  } catch (err) {
    status.whale = { ok: false, reason: String((err as Error)?.message ?? err) }
    console.warn('[dsh-beautify] 余额小鲸鱼加载失败，已跳过（其余功能不受影响）:', err)
  }

  // Expose the health so the settings surface can show a visible notice.
  try {
    const webServer = (ctx as { webServer?: { register?: (route: unknown) => unknown } }).webServer
    if (webServer?.register !== undefined) {
      webServer.register({
        kind: 'exact',
        path: '/dsh-beautify/status.json',
        handler: (_req: unknown, res: { writeHead: (code: number, headers: Record<string, string>) => void; end: (body: string) => void }) => {
          res.writeHead(200, { 'content-type': 'application/json' })
          res.end(JSON.stringify(status))
        },
      })
    }
  } catch (err) {
    console.warn('[dsh-beautify] 状态接口注册失败:', err)
  }
}
