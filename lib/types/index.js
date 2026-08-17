import { registerWallpaperEngine } from "./wallpaper-engine.js";
export const name = 'dsh-beautify';
/** Web-only bridge: the webserver is required to serve the WE inventory/media routes. */
export const inject = ['webServer'];
/**
 * Mount the wallpaper-engine bridge; appearance state itself persists via
 * browser localStorage on the Client half.
 * @param ctx - Host context carrying the webserver.
 */
export function apply(ctx) {
    registerWallpaperEngine(ctx);
}
//# sourceMappingURL=index.js.map