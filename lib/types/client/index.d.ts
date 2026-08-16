/**
 * Dream Skin client plugin: register the shipped color skins on the native
 * theme service and mount a settings section that switches them. The theme
 * definitions are static and immutable; the service owns the live preference,
 * so the plugin only mirrors its snapshot into the settings store.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/** Required services: the theme registry this package skins and the slot system. */
export declare const inject: string[];
/**
 * Register every Dream Skin preset and mount the switching section.
 * @param ctx - the browser plugin context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map