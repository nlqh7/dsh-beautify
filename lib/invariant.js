//#region lib/types/invariant.js
/**
* Package-owned invariant companion for `@deepseek-ai/dsh-dream-skin`.
* @module @deepseek-ai/dsh-dream-skin/invariant
*/
const PACKAGE_NAME = "@deepseek-ai/dsh-dream-skin";
/** Cordis companion plugin name. */
const name = "dsh-dream-skin-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/**
* No runtime invariant: the theme registry emits `theme/change` synchronously
* with its own mutations, and every Dream Skin theme is a static, immutable
* definition with no separate store to drift out of agreement.
*/
const install = () => {};
/**
* Register this package's invariant companion.
* @param ctx - Cordis context carrying the invariant service.
* @returns the installed registration's disposer after setup succeeds.
*/
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
