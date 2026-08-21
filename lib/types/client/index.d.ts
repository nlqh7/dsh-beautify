/**
 * dsh-beautify client: theme skins applied the "maid-whale way" — direct body
 * token overrides, no theme-service register/setTheme for skins (which avoids
 * the registration race and change-loop entirely), persisted via localStorage.
 * Built-in light/dark/system still go through the theme service (they are
 * built-in, so no registration race).
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/** Required services: theme registry (for built-in modes), the slot system,
 * and the sessions runtime (subagent catalog for the baby-whale parade).
 * `sessions` must be injected explicitly — Cordis contexts are strict proxies
 * and reading an un-injected property throws, which would kill the plugin. */
export declare const inject: string[];
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map