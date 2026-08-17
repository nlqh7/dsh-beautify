/**
 * Host registration for the Dream Skin theme layer. The theme definitions and
 * the 外观 surface live on the Client half; the node half is a no-op so the
 * package stays mountable in headless profiles without a browser.
 */
import type { Context } from '@deepseek-ai/cordis';
export declare const name = "dsh-beautify";
/** Host half is a no-op: appearance state persists via browser localStorage. */
export declare function apply(_ctx: Context): void;
//# sourceMappingURL=index.d.ts.map