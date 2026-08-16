/**
 * Host registration for the Dream Skin theme layer. The theme definitions and
 * the settings surface live entirely on the Client half; this node half is a
 * no-op so the package stays mountable in headless profiles without a browser.
 */
import type { Context } from '@deepseek-ai/cordis';
export declare const name = "dsh-dream-skin";
/**
 * Host half is intentionally empty: no Host service, event, or bootstrap step
 * is required for color-only theme skins.
 * @param _ctx - unused host context.
 */
export declare function apply(_ctx: Context): void;
//# sourceMappingURL=index.d.ts.map