/**
 * Dream Skin client plugin: register the shipped color skins on the native
 * theme service, persist the selection + scrim strength to the Host settings
 * scope, apply the scrim as a dynamic token layer, and mount the 外观 section.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/** Required services: theme registry, slot system, and the durable settings scope. */
export declare const inject: string[];
/**
 * Register every Dream Skin preset, restore persisted state, and mount the
 * 外观 switching section.
 * @param ctx - the browser plugin context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map