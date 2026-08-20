/**
 * Settings-surface performance overrides, injected unconditionally (skin
 * independent). The dsh settings modal paints a full-viewport `backdrop-filter`
 * mask behind the panel; scrolling any long settings list (e.g. the plugin
 * inventory) re-blurs the whole backdrop every frame, which is why the main
 * surface stays smooth but settings jank. The blur is only 2px — visually
 * negligible — so we drop it on the mask and skip off-screen list rows.
 *
 * Selectors target stable attributes on the upstream modal (`role="dialog"`,
 * `aria-modal`, the mask sibling), not hashed CSS-module class names.
 */
/**
 * Install the settings-surface performance overrides. Idempotent; returns a
 * dispose function that removes the marker and the injected sheet.
 */
export declare function initSettingsPerf(): () => void;
//# sourceMappingURL=settings-perf.d.ts.map