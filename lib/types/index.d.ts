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
import type { Context } from '@deepseek-ai/cordis';
export declare const name = "dsh-beautify";
/**
 * Web-only bridge: the webserver serves the WE routes + whale widget + the
 * status endpoint; the credentials service feeds the whale's balance fetch. On
 * profiles without a credentials provider the loader skips this plugin with a
 * warning (never crashes the boot), per the loader's partial-failure tolerance.
 */
export declare const inject: string[];
/** Per-feature health, surfaced to the settings UI via /dsh-beautify/status.json. */
export interface BeautifyFeatureStatus {
    ok: boolean;
    reason?: string;
}
/**
 * Mount the wallpaper-engine bridge and the balance whale widget; appearance
 * state itself persists via browser localStorage on the Client half. Each
 * mount is guarded so a failure in one surface never crashes the plugin or
 * the boot, and the failure is recorded for the settings surface to display.
 * @param ctx - Host context carrying the webserver.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map