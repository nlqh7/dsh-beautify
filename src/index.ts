/**
 * Host registration for the Dream Skin theme layer: no-op for appearance
 * (browser localStorage), plus the vendored Wallpaper Engine bridge (inventory
 * enumeration + HTTP media routes) when the webserver is composed.
 */
import type { Context } from '@deepseek-ai/cordis'
import { registerWallpaperEngine } from './wallpaper-engine.ts'

export const name = 'dsh-beautify'

/** Web-only bridge: the webserver is required to serve the WE inventory/media routes. */
export const inject = ['webServer']

/**
 * Mount the wallpaper-engine bridge; appearance state itself persists via
 * browser localStorage on the Client half.
 * @param ctx - Host context carrying the webserver.
 */
export function apply(ctx: Context): void {
  registerWallpaperEngine(ctx)
}
