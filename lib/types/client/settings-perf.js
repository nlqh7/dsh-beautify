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
/** Style tag identity used for re-entrancy (HMR / double mount). */
const SETTINGS_PERF_TAG = 'dsh-settings-perf';
const SETTINGS_PERF_CSS = `
/* Settings mask: the full-viewport blur behind the modal. Dropping it turns
   scrolling a long settings list from a per-frame backdrop re-blur into a
   plain composited scroll. The mask background color stays, so the dimming
   effect is unchanged. The mask is the modal overlay's direct aria-hidden
   child sitting before the dialog. */
[data-dsh-settings-perf] [role="presentation"] > [aria-hidden="true"] {
  backdrop-filter: none !important;
}

/* The maid-atelier skin is a full glass theme: ~18 backdrop-filter layers
   (blur 6-16px) over the sidebar, panels and floating surfaces. On the main
   surface the glass composites once and idles, but while the settings modal
   is open those layers show through the translucent mask and every scroll
   frame re-blurs the whole stack. The modal covers the app anyway, so drop
   every glass blur while it is open — the backdrop stays visible (just not
   frosted), and scrolling collapses to cheap layers. */
[data-dsh-settings-perf] body:has([role="dialog"][aria-modal="true"])[data-dsh-maid-atelier] *,
[data-dsh-settings-perf] body:has([role="dialog"][aria-modal="true"])[data-dsh-maid-atelier] *::before,
[data-dsh-settings-perf] body:has([role="dialog"][aria-modal="true"])[data-dsh-maid-atelier] *::after {
  backdrop-filter: none !important;
}

/* The atelier skin makes its background tokens translucent (bg-base is even
   transparent) so the palace shows through the app shell. The settings panel
   paints with --dsw-alias-bg-layer-2 (rgba 0.84-0.92), so without the glass
   the modal content reads straight through. Restore opaque surfaces on the
   dialog while it is open. Dark detection uses the theme's own mode marker
   (data-dsh-skin-mode, set by the beautify skin) first, then falls back to
   the host preference — a dark beautify theme with a light host must still
   get a dark settings panel. */
[data-dsh-settings-perf] body:has([role="dialog"][aria-modal="true"])[data-dsh-skin-mode="dark"] [role="dialog"][aria-modal="true"],
[data-dsh-settings-perf] body:has([role="dialog"][aria-modal="true"])[data-ds-dark-theme]:not([data-dsh-skin-mode="light"]) [role="dialog"][aria-modal="true"] {
  --dsw-alias-bg-base: #10172b !important;
  --dsw-alias-bg-layer-2: #10172b !important;
}
[data-dsh-settings-perf] body:has([role="dialog"][aria-modal="true"]) [role="dialog"][aria-modal="true"] {
  --dsw-alias-bg-base: #f6f8fd !important;
  --dsw-alias-bg-layer-2: #f6f8fd !important;
}

/* While the settings modal is open, drop the full-viewport character stage
   (two ~2000px WEBP maid layers) from the compositor. Under the modal's
   semi-transparent mask, Chromium re-composites those large textures while
   the list scrolls, which janks long lists; the stage is invisible behind the
   modal anyway, so removing it is visually lossless. */
[data-dsh-settings-perf] body:has([role="dialog"][aria-modal="true"]) [data-skin-chrome="character-stage"] {
  display: none !important;
}

/* The maid sprites carry a large drop-shadow (20px 24px) that keeps a huge
   intermediate blur texture alive whenever the layer is in the pipeline.
   It is barely visible against the palace; drop it to keep the stage cheap
   on the main surface too. */
[data-dsh-settings-perf] [data-maid-character] {
  filter: none !important;
}

/* Long lists inside settings (plugin inventory cards, session lists):
   render only the rows near the viewport. Plugin cards carry a stable
   data-plugin-entry attribute; keep the fallback li rule for other long
   lists without their own marker. */
[data-dsh-settings-perf] [role="dialog"] li[data-plugin-entry],
[data-dsh-settings-perf] [role="dialog"] ul li {
  content-visibility: auto;
  contain-intrinsic-size: auto 64px;
}

/* The scroll container itself: keep it a composited scroller. */
[data-dsh-settings-perf] [role="dialog"] [class*="options"] {
  overscroll-behavior: contain;
}
`;
/**
 * Install the settings-surface performance overrides. Idempotent; returns a
 * dispose function that removes the marker and the injected sheet.
 */
export function initSettingsPerf() {
    const root = document.documentElement;
    if (document.querySelector(`style[data-plugin-css=${JSON.stringify(SETTINGS_PERF_TAG)}]`) !== null) {
        // Already installed (HMR re-apply); return a no-op dispose so the caller's
        // bookkeeping stays balanced.
        return () => {
            root.removeAttribute('data-dsh-settings-perf');
        };
    }
    root.setAttribute('data-dsh-settings-perf', '');
    const tag = document.createElement('style');
    tag.dataset.plugin = 'dsh-beautify';
    tag.dataset.pluginCss = SETTINGS_PERF_TAG;
    tag.textContent = SETTINGS_PERF_CSS;
    document.head.appendChild(tag);
    return () => {
        root.removeAttribute('data-dsh-settings-perf');
        tag.remove();
    };
}
//# sourceMappingURL=settings-perf.js.map