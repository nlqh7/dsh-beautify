/**
 * dsh-beautify client: theme skins applied the "maid-whale way" — direct body
 * token overrides, no theme-service register/setTheme for skins (which avoids
 * the registration race and change-loop entirely), persisted via localStorage.
 * Built-in light/dark/system still go through the theme service (they are
 * built-in, so no registration race).
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/** Required services: theme registry (for built-in modes) and the slot system. */
export declare const inject: string[];
/**
 * Register every Dream Skin preset, restore persisted state, and mount the
 * 外观 switching section.
 * @param ctx - the browser plugin context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map