/**
 * Host registration for the Dream Skin theme layer. The theme definitions and
 * the 外观 surface live on the Client half; the node half is a no-op so the
 * package stays mountable in headless profiles without a browser.
 */
import type { Context } from '@deepseek-ai/cordis'

export const name = 'dsh-dream-skin'

/** Host half is a no-op: appearance state persists via browser localStorage. */
export function apply(_ctx: Context): void {}
