/**
 * Dream Skin client plugin: register the shipped color skins on the native
 * theme service, persist the selection to the Host settings scope, and mount
 * a settings section that switches them.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/** Required services: theme registry, slot system, and the durable settings scope. */
export declare const inject: string[];
/**
 * Register every Dream Skin preset, restore the persisted selection, and
 * mount the switching section.
 * @param ctx - the browser plugin context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map