/**
 * Maid-whale skin: the full cloud-paper theme chrome for the maid-whale theme —
 * illustrated backdrop over paper gradients, mascot, favicon, sidebar ocean
 * surface, nine-grid liquid-glass frames, and ornaments. Vendored from
 * yunxiiQwQ/dsh-maid-whale-webUI (see README 来源与致谢), re-scoped onto
 * body[data-dsh-maid-skin] with plain class names. Activates only while the
 * maid-whale theme is selected; dispose() retracts everything.
 */
import { createFrameController } from "./maid-art/frames.js";
import { createOrnamentController } from "./maid-art/ornaments.js";
import { ILLUSTRATED_BACKGROUND, SIDEBAR_OCEAN_BACKGROUND } from "./maid-art/background-art.generated.js";
import { PAPER_BACKDROP_DARK, PAPER_BACKDROP_LIGHT, PET_ART } from "./maid-art/art.js";
/** Body attribute marking the maid skin chrome as active. */
const MAID_ATTR = 'data-dsh-maid-skin';
const SKIN_TITLE = 'DeepSeek 云鲸纸面';
const WIDE_QUERY = '(min-width: 960px)';
const MASCOT_WIDTH = 148;
const MASCOT_EDGE_GAP = 12;
const SIDEBAR_ATTR = 'data-dsh-sidebar-surface';
const SIDEBAR_BACKGROUND_PROPERTY = '--dsw-sidebar-ocean-background';
const BACKDROP_PROPERTIES = [
    'background-image',
    'background-position',
    'background-size',
    'background-attachment',
    'background-repeat',
];
/**
 * Scoped stylesheet: only matches while body[data-dsh-maid-skin] is set, so the
 * chrome never leaks into non-maid themes. The cloud-paper token set overrides
 * the palette applySkin writes inline (the ten tokens it owns carry
 * !important); every other token lands at stylesheet precedence.
 */
const MAID_CSS = `
  body[data-dsh-maid-skin] {
    color: #243746;
    background-color: #eef6f8;
    background-blend-mode: normal, normal, soft-light, normal, normal;
    font-family: "LXGW WenKai Screen", "Microsoft YaHei UI", sans-serif;
    --dsw-static-blue-50: #f2f8fa;
    --dsw-static-blue-100: #deeff4;
    --dsw-static-blue-300: #a8d1df;
    --dsw-static-blue-400: #7fb9d0;
    --dsw-static-blue-450: #69acc8;
    --dsw-static-blue-500: #5aa7d8;
    --dsw-static-blue-600: #438db8;
    --dsw-static-blue-800: #315d78;
    --dsw-static-blue-950: #243746;
    --dsw-static-deepseek-50: #f2f8fa;
    --dsw-static-deepseek-100: #deeff4;
    --dsw-static-deepseek-200: #c9e4ec;
    --dsw-static-deepseek-300: #a8d1df;
    --dsw-static-deepseek-400: #7fb9d0;
    --dsw-static-deepseek-450: #69acc8;
    --dsw-static-deepseek-500: #5aa7d8;
    --dsw-static-deepseek-600: #438db8;
    --dsw-static-deepseek-700-delete: #39779a;
    --dsw-static-deepseek-800: #315d78;
    --dsw-static-deepseek-900: #294a60;
    --dsw-static-neutral-00: #fffef9;
    --dsw-static-neutral-50: #fbfaf5;
    --dsw-static-neutral-100: #f3f3ed;
    --dsw-static-neutral-200: #e4e8e4;
    --dsw-static-neutral-300: #ccd5d2;
    --dsw-static-neutral-400: #aebdba;
    --dsw-static-neutral-500: #8d9f9d;
    --dsw-static-neutral-600: #697f80;
    --dsw-static-neutral-700: #536b6f;
    --dsw-static-neutral-800: #40565d;
    --dsw-static-neutral-900: #2d4049;
    --dsw-static-neutral-1000: #243746;
    --dsw-alias-bg-base: rgba(251, 250, 245, 0.28) !important;
    --dsw-alias-bg-layer-1: rgba(247, 249, 246, 0.97) !important;
    --dsw-alias-bg-layer-2: rgba(239, 246, 247, 0.98) !important;
    --dsw-alias-bg-layer-3: rgba(230, 241, 244, 0.98);
    --dsw-alias-bg-mask-1: rgba(36, 55, 70, 0.42);
    --dsw-alias-bg-mask-2: rgba(36, 55, 70, 0.18);
    --dsw-alias-bg-module-platform: rgba(239, 246, 247, 0.95);
    --dsw-alias-bg-multi-select: rgba(230, 241, 244, 0.95);
    --dsw-alias-bg-overlay: rgba(255, 254, 249, 0.99) !important;
    --dsw-alias-bg-skeleton: rgba(90, 167, 216, 0.12);
    --dsw-alias-brand-primary: #5aa7d8 !important;
    --dsw-alias-brand-primary-invert: #fffef9;
    --dsw-alias-brand-primary-new-colorprimary-new-color: #5aa7d8;
    --dsw-alias-brand-text: #315d78;
    --dsw-alias-label-primary: #243746 !important;
    --dsw-alias-label-primary-bluish: #3b5c78;
    --dsw-alias-label-primary-dimmed: #4a6a82;
    --dsw-alias-label-primary-foreground: #fffef9;
    --dsw-alias-label-primary-inverted: #fffef9;
    --dsw-alias-label-secondary: #486170 !important;
    --dsw-alias-label-tertiary: #5e7a8b;
    --dsw-alias-label-caption: #5e7a8b;
    --dsw-alias-label-dimmed: #82959f;
    --dsw-alias-border-l1: rgba(72, 112, 132, 0.14) !important;
    --dsw-alias-border-l2-darkmode-thin: rgba(72, 112, 132, 0.18);
    --dsw-alias-border-l2: rgba(72, 112, 132, 0.22) !important;
    --dsw-alias-border-l3: rgba(72, 112, 132, 0.32);
    --dsw-alias-border-l4: rgba(72, 112, 132, 0.42);
    --dsw-alias-border-inverted: rgba(255, 254, 249, 0.9);
    --dsw-alias-border-inverted2: rgba(255, 254, 249, 0.7);
    --dsw-alias-button-primary-fill: #5aa7d8;
    --dsw-alias-button-primary-hover: #4899cb;
    --dsw-alias-button-primary-dimmed: #dceef3;
    --dsw-alias-button-elevated-fill: #fffef9;
    --dsw-alias-button-floating-fill: #fffef9;
    --dsw-alias-button-floating-hover: #edf5f6;
    --dsw-alias-button-contrast-fill: #fffef9;
    --dsw-alias-button-ghost-active-border: rgba(72, 112, 132, 0.4);
    --dsw-alias-button-ghost-active-fill: rgba(90, 167, 216, 0.12);
    --dsw-alias-button-ghost-active-hover: rgba(90, 167, 216, 0.18);
    --dsw-alias-button-info-fill: #5aa7d8;
    --dsw-alias-button-info-hover: #4899cb;
    --dsw-alias-button-tool-bar-fill: rgba(239, 246, 247, 0.95);
    --dsw-alias-button-tool-bar-fill-invisible: rgba(239, 246, 247, 0.5);
    --dsw-alias-button-tool-bar-hover: rgba(90, 167, 216, 0.12);
    --dsw-alias-interactive-bg-hover: rgba(90, 167, 216, 0.10);
    --dsw-alias-interactive-bg-hover-accent: rgba(90, 167, 216, 0.16);
    --dsw-alias-interactive-bg-hover-danger: rgba(179, 94, 94, 0.14);
    --dsw-alias-interactive-bg-hover-solid: #eaf2f4;
    --dsw-alias-interactive-bg-active: rgba(90, 167, 216, 0.17);
    --dsw-alias-markdown-code-block: rgba(239, 246, 247, 0.98);
    --dsw-alias-markdown-code-block-banner: rgba(230, 241, 244, 0.98);
    --dsw-alias-markdown-code-segment-selected: rgba(90, 167, 216, 0.18);
    --dsw-alias-markdown-code-segment-unselected: rgba(72, 112, 132, 0.12);
    --dsw-alias-markdown-inline-code: rgba(222, 239, 244, 0.94);
    --dsw-alias-markdown-citation: rgba(90, 167, 216, 0.09);
    --dsw-alias-markdown-placeholder: #82959f;
    --dsw-alias-markdown-tag: rgba(90, 167, 216, 0.1);
    --dsw-alias-scrollbar-bg-l1: #dce6e5;
    --dsw-alias-scrollbar-bg-l2: rgba(72, 112, 132, 0.14);
    --dsw-alias-scrollbar-hover-l1: #a8d1df;
    --dsw-alias-scrollbar-hover-l2: rgba(90, 167, 216, 0.45);
    --dsw-alias-state-business-primary: #5aa7d8;
    --dsw-alias-state-business-tertiary: #dceef3;
    --dsw-alias-state-error-primary: #b35e5e;
    --dsw-alias-state-error-secondary: #e8c7c7;
    --dsw-alias-state-error-tertiary: #f5e6e6;
    --dsw-alias-state-success-primary: #5d8a6a;
    --dsw-alias-state-success-secondary: #c4dccb;
    --dsw-alias-state-success-tertiary: #e4f0e7;
    --dsw-alias-state-warn-label: #8a6d2f;
    --dsw-alias-state-warn-primary: #b8913f;
    --dsw-alias-state-warn-secondary: #e6d3a6;
    --dsw-alias-state-warn-tertiary: #f3e8cc;
    --dsw-alias-toast-bg: rgba(36, 55, 70, 0.95);
    --dsw-alias-tooltip-bg: rgba(36, 55, 70, 0.95);
    --dsw-shadow-lv1: 0 1px 3px rgba(36, 55, 70, 0.12);
    --dsw-shadow-lv1-blur: 6px;
    --dsw-shadow-lv2: 0 8px 24px rgba(36, 55, 70, 0.14);
    --dsw-shadow-lv3: 0 20px 56px rgba(36, 55, 70, 0.22);
    --dsw-specific-bubble: #e4f1f4;
    --dsw-specific-bubble-highlight: #d2e8ee;
    --dsw-specific-sidebar-fill: rgba(246, 249, 247, 0.36) !important;
    --dsw-specific-sidebar-nav-item-active: #e1f0f3;
    --dsw-specific-sidebar-nav-item-active-accent: #a8d1df;
    --dsw-specific-sidebar-nav-item-hover: #edf5f6;
    --dsw-specific-menu: rgba(251, 250, 245, 0.99);
    --dsw-specific-input-major: rgba(255, 255, 252, 0.98);
    --dsw-specific-login-input: rgba(255, 255, 252, 0.95);
    --dsw-specific-selector: rgba(235, 244, 246, 0.98);
    --dsw-specific-tip: rgba(239, 246, 247, 0.96);
  }

  body[data-dsh-maid-skin] [id='root'] {
    background: transparent;
  }

  body[data-dsh-maid-skin] :is(code, pre, kbd, samp) {
    font-family: "Cascadia Code", "JetBrains Mono", Consolas, monospace;
  }

  body[data-dsh-maid-skin][data-ds-dark-theme] {
    color: #e4edf2;
    background-color: #172435;
    --dsw-static-blue-50: #1c2d42;
    --dsw-static-blue-100: #263b53;
    --dsw-static-blue-300: #3f6380;
    --dsw-static-blue-400: #527e9d;
    --dsw-static-blue-450: #6090ae;
    --dsw-static-blue-500: #6ea3c2;
    --dsw-static-blue-600: #83bcdc;
    --dsw-static-blue-800: #b9d9ea;
    --dsw-static-blue-950: #e4edf2;
    --dsw-static-deepseek-50: #1c2d42;
    --dsw-static-deepseek-100: #263b53;
    --dsw-static-deepseek-200: #2e465f;
    --dsw-static-deepseek-300: #3f6380;
    --dsw-static-deepseek-400: #527e9d;
    --dsw-static-deepseek-450: #6090ae;
    --dsw-static-deepseek-500: #6ea3c2;
    --dsw-static-deepseek-600: #83bcdc;
    --dsw-static-deepseek-700-delete: #98c9e2;
    --dsw-static-deepseek-800: #b9d9ea;
    --dsw-static-deepseek-900: #d1e6f0;
    --dsw-static-neutral-00: #172435;
    --dsw-static-neutral-50: #1c2d42;
    --dsw-static-neutral-100: #22384f;
    --dsw-static-neutral-200: #30485f;
    --dsw-static-neutral-300: #425c73;
    --dsw-static-neutral-400: #566f84;
    --dsw-static-neutral-500: #6e8496;
    --dsw-static-neutral-600: #8a9dab;
    --dsw-static-neutral-700: #a2b1bc;
    --dsw-static-neutral-800: #b9c8d2;
    --dsw-static-neutral-900: #d5e0e6;
    --dsw-static-neutral-1000: #e4edf2;
    --dsw-alias-bg-base: rgba(23, 36, 53, 0.34) !important;
    --dsw-alias-bg-layer-1: rgba(28, 45, 66, 0.98) !important;
    --dsw-alias-bg-layer-2: rgba(34, 56, 79, 0.98) !important;
    --dsw-alias-bg-layer-3: rgba(41, 66, 91, 0.98);
    --dsw-alias-bg-mask-1: rgba(228, 237, 242, 0.42);
    --dsw-alias-bg-mask-2: rgba(228, 237, 242, 0.18);
    --dsw-alias-bg-module-platform: rgba(34, 56, 79, 0.95);
    --dsw-alias-bg-multi-select: rgba(41, 66, 91, 0.95);
    --dsw-alias-bg-overlay: rgba(28, 45, 66, 0.99) !important;
    --dsw-alias-bg-skeleton: rgba(131, 188, 220, 0.14);
    --dsw-alias-brand-primary: #83bcdc !important;
    --dsw-alias-brand-primary-invert: #172435;
    --dsw-alias-brand-primary-new-colorprimary-new-color: #83bcdc;
    --dsw-alias-brand-text: #b9d9ea;
    --dsw-alias-label-primary: #e4edf2 !important;
    --dsw-alias-label-primary-bluish: #c9dbe7;
    --dsw-alias-label-primary-dimmed: #b9c8d2;
    --dsw-alias-label-primary-foreground: #172435;
    --dsw-alias-label-primary-inverted: #172435;
    --dsw-alias-label-secondary: #b9c8d2 !important;
    --dsw-alias-label-tertiary: #a3b6c4;
    --dsw-alias-label-caption: #a3b6c4;
    --dsw-alias-label-dimmed: #7c93a3;
    --dsw-alias-border-l1: rgba(167, 199, 216, 0.12) !important;
    --dsw-alias-border-l2-darkmode-thin: rgba(167, 199, 216, 0.16);
    --dsw-alias-border-l2: rgba(167, 199, 216, 0.18) !important;
    --dsw-alias-border-l3: rgba(167, 199, 216, 0.26);
    --dsw-alias-border-l4: rgba(167, 199, 216, 0.34);
    --dsw-alias-border-inverted: rgba(23, 36, 53, 0.9);
    --dsw-alias-border-inverted2: rgba(23, 36, 53, 0.7);
    --dsw-alias-button-primary-fill: #5f9fc5;
    --dsw-alias-button-primary-hover: #73afd1;
    --dsw-alias-button-primary-dimmed: #2d4c64;
    --dsw-alias-button-elevated-fill: #22384f;
    --dsw-alias-button-floating-fill: #1c2d42;
    --dsw-alias-button-floating-hover: #29435d;
    --dsw-alias-button-contrast-fill: #172435;
    --dsw-alias-button-ghost-active-border: rgba(167, 199, 216, 0.4);
    --dsw-alias-button-ghost-active-fill: rgba(131, 188, 220, 0.14);
    --dsw-alias-button-ghost-active-hover: rgba(131, 188, 220, 0.22);
    --dsw-alias-button-info-fill: #5f9fc5;
    --dsw-alias-button-info-hover: #73afd1;
    --dsw-alias-button-tool-bar-fill: rgba(34, 56, 79, 0.95);
    --dsw-alias-button-tool-bar-fill-invisible: rgba(34, 56, 79, 0.5);
    --dsw-alias-button-tool-bar-hover: rgba(131, 188, 220, 0.14);
    --dsw-alias-interactive-bg-hover: rgba(131, 188, 220, 0.10);
    --dsw-alias-interactive-bg-hover-accent: rgba(131, 188, 220, 0.16);
    --dsw-alias-interactive-bg-hover-danger: rgba(202, 110, 110, 0.18);
    --dsw-alias-interactive-bg-hover-solid: #29435d;
    --dsw-alias-interactive-bg-active: rgba(131, 188, 220, 0.18);
    --dsw-alias-markdown-code-block: rgba(28, 45, 66, 0.98);
    --dsw-alias-markdown-code-block-banner: rgba(34, 56, 79, 0.98);
    --dsw-alias-markdown-code-segment-selected: rgba(131, 188, 220, 0.2);
    --dsw-alias-markdown-code-segment-unselected: rgba(167, 199, 216, 0.14);
    --dsw-alias-markdown-inline-code: rgba(41, 66, 91, 0.96);
    --dsw-alias-markdown-citation: rgba(131, 188, 220, 0.12);
    --dsw-alias-markdown-placeholder: #7c93a3;
    --dsw-alias-markdown-tag: rgba(131, 188, 220, 0.14);
    --dsw-alias-scrollbar-bg-l1: #2f465c;
    --dsw-alias-scrollbar-bg-l2: rgba(167, 199, 216, 0.16);
    --dsw-alias-scrollbar-hover-l1: #527e9d;
    --dsw-alias-scrollbar-hover-l2: rgba(131, 188, 220, 0.48);
    --dsw-alias-state-business-primary: #83bcdc;
    --dsw-alias-state-business-tertiary: #2d4c64;
    --dsw-alias-state-error-primary: #d98a8a;
    --dsw-alias-state-error-secondary: #7a4a4a;
    --dsw-alias-state-error-tertiary: #4a2c33;
    --dsw-alias-state-success-primary: #7fbf92;
    --dsw-alias-state-success-secondary: #3c6b4c;
    --dsw-alias-state-success-tertiary: #2b4736;
    --dsw-alias-state-warn-label: #e6cf96;
    --dsw-alias-state-warn-primary: #c9a24e;
    --dsw-alias-state-warn-secondary: #7a6230;
    --dsw-alias-state-warn-tertiary: #4a3d22;
    --dsw-alias-toast-bg: rgba(228, 237, 242, 0.96);
    --dsw-alias-tooltip-bg: rgba(228, 237, 242, 0.96);
    --dsw-shadow-lv1: 0 1px 3px rgba(0, 0, 0, 0.3);
    --dsw-shadow-lv1-blur: 6px;
    --dsw-shadow-lv2: 0 8px 24px rgba(0, 0, 0, 0.28);
    --dsw-shadow-lv3: 0 20px 56px rgba(0, 0, 0, 0.4);
    --dsw-specific-bubble: #29465f;
    --dsw-specific-bubble-highlight: #31536e;
    --dsw-specific-sidebar-fill: rgba(28, 45, 66, 0.48) !important;
    --dsw-specific-sidebar-nav-item-active: #2b465f;
    --dsw-specific-sidebar-nav-item-active-accent: #527e9d;
    --dsw-specific-sidebar-nav-item-hover: #253b53;
    --dsw-specific-menu: rgba(34, 56, 79, 0.99);
    --dsw-specific-input-major: rgba(23, 36, 53, 0.99);
    --dsw-specific-login-input: rgba(23, 36, 53, 0.95);
    --dsw-specific-selector: rgba(41, 66, 91, 0.98);
    --dsw-specific-tip: rgba(34, 56, 79, 0.96);
  }

  body[data-dsh-maid-skin] [role='tree'] {
    padding: 5px;
  }

  body[data-dsh-maid-skin] [data-dsh-sidebar-surface] {
    background-image:
      linear-gradient(rgba(247, 250, 249, 0.44), rgba(247, 250, 249, 0.44)),
      var(--dsw-sidebar-ocean-background);
    background-position: center, center bottom;
    background-size: cover, cover;
    background-repeat: no-repeat;
  }

  body[data-dsh-maid-skin][data-ds-dark-theme] [data-dsh-sidebar-surface] {
    background-image:
      linear-gradient(rgba(18, 31, 47, 0.58), rgba(18, 31, 47, 0.58)),
      var(--dsw-sidebar-ocean-background);
  }

  body[data-dsh-maid-skin] [role='treeitem'] {
    border: 2px solid transparent;
    border-radius: 13px 16px 12px 15px;
    transition: color 140ms ease, background-color 140ms ease, border-color 140ms ease;
  }

  body[data-dsh-maid-skin] [role='treeitem']:hover {
    background-color: var(--dsw-specific-sidebar-nav-item-hover);
  }

  body[data-dsh-maid-skin] [role='treeitem'][aria-selected='true'] {
    border-color: var(--dsw-alias-border-l1);
    background-color: var(--dsw-specific-sidebar-nav-item-active);
    box-shadow: inset 3px 0 0 var(--dsw-specific-sidebar-nav-item-active-accent), 0 4px 12px rgba(49, 93, 120, 0.07);
    color: var(--dsw-alias-brand-text);
    font-weight: 650;
  }

  body[data-dsh-maid-skin] :is(textarea, [contenteditable='true'], input:not([type])) {
    border: 2px solid var(--dsw-alias-border-l2);
    border-radius: 20px 23px 19px 22px;
    outline: none;
    background-color: var(--dsw-specific-input-major);
    box-shadow: 0 10px 26px rgba(49, 93, 120, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.32);
    color: var(--dsw-alias-label-primary);
    transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
  }

  body[data-dsh-maid-skin] :is(textarea, [contenteditable='true'], input:not([type])):focus {
    border-color: var(--dsw-static-blue-400);
    box-shadow: 0 12px 30px rgba(49, 93, 120, 0.13), 0 0 0 3px rgba(90, 167, 216, 0.10);
    transform: translateY(-1px);
  }

  body[data-dsh-maid-skin] [role='dialog'] {
    border: 2px solid var(--dsw-alias-border-l2);
    border-radius: 24px 27px 22px 25px;
    background-color: var(--dsw-alias-bg-overlay);
    box-shadow: 0 24px 72px rgba(36, 55, 70, 0.20), 0 3px 0 rgba(90, 167, 216, 0.07);
  }

  body[data-dsh-maid-skin] [role='menu'] {
    border: 2px solid var(--dsw-alias-border-l2);
    border-radius: 15px 18px 14px 17px;
    background-color: var(--dsw-specific-menu);
    box-shadow: 0 16px 38px rgba(36, 55, 70, 0.16);
  }

  body[data-dsh-maid-skin] :is([role='listbox'], [role='combobox']) {
    border-color: var(--dsw-alias-border-l2);
    border-radius: 13px 15px 12px 14px;
    background-color: var(--dsw-specific-selector);
  }

  body[data-dsh-maid-skin] button {
    border-radius: 12px 14px 11px 13px;
    transition: color 130ms ease, background-color 130ms ease, border-color 130ms ease, transform 130ms ease;
  }

  body[data-dsh-maid-skin] button:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  body[data-dsh-maid-skin] :is(button[type='submit'], button[data-variant='primary']) {
    border-color: transparent;
    background-color: var(--dsw-alias-button-primary-fill);
    color: var(--dsw-alias-brand-primary-invert);
    box-shadow: 0 6px 16px rgba(49, 93, 120, 0.16);
  }

  body[data-dsh-maid-skin] :is(button[type='submit'], button[data-variant='primary']):hover:not(:disabled) {
    background-color: var(--dsw-alias-button-primary-hover);
  }

  body[data-dsh-maid-skin] :is(main, [role='main']) :is(h1, h2) {
    color: var(--dsw-alias-label-primary);
    font-family: "LXGW WenKai Screen", "STKaiti", "Microsoft YaHei UI", sans-serif;
    font-weight: 650;
    letter-spacing: 0.015em;
  }

  /* ── Frames: nine-grid liquid glass borders ── */
  body[data-dsh-maid-skin] [data-dsh-frame] {
    box-sizing: border-box;
    border-width: 2px;
    border-style: solid;
    border-color: var(--dsw-alias-border-l2);
    border-image-repeat: stretch;
    border-image-slice: 90 120 90 120 fill;
    border-image-width: 19px;
    border-image-outset: 3px;
  }

  body[data-dsh-maid-skin] [data-dsh-frame='selected-nav'] {
    border-image-source: var(--dsw-frame-selected-nav);
    border-image-width: 14px;
    border-image-outset: 2px;
  }

  body[data-dsh-maid-skin] [data-dsh-frame='composer'] {
    border-image-source: var(--dsw-frame-composer);
    border-image-slice: 80 120 90 120 fill;
    border-image-width: 22px;
    border-image-outset: 4px;
    background-color: var(--dsw-specific-input-major);
    box-shadow: 0 10px 24px rgba(49, 93, 120, 0.11);
  }

  body[data-dsh-maid-skin] [data-dsh-frame='composer-shell'] {
    border-width: 1px;
    border-image-source: var(--dsw-frame-composer);
    border-image-slice: 80 120 90 120 fill;
    border-image-width: 18px;
    border-image-outset: 4px;
    background-color: var(--dsw-specific-input-major);
    box-shadow: 0 12px 30px rgba(49, 93, 120, 0.12);
  }

  body[data-dsh-maid-skin] [data-dsh-frame='dialog'] {
    border-image-source: var(--dsw-frame-dialog);
    border-image-width: 22px;
    border-image-outset: 4px;
    background-color: var(--dsw-alias-bg-overlay);
    box-shadow: 0 25px 72px rgba(36, 55, 70, 0.22), 4px 5px 0 rgba(90, 167, 216, 0.07);
  }

  body[data-dsh-maid-skin] [data-dsh-frame='menu'] {
    border-image-source: var(--dsw-frame-menu);
    border-image-width: 16px;
    border-image-outset: 3px;
    background-color: var(--dsw-specific-menu);
    box-shadow: 0 15px 36px rgba(36, 55, 70, 0.16);
  }

  body[data-dsh-maid-skin] [data-dsh-frame='panel'] {
    border: 2px solid var(--dsw-alias-border-l2);
    border-image-source: var(--dsw-frame-panel);
    border-image-slice: 80 120 90 120 fill;
    border-image-width: 22px;
    border-image-outset: 4px;
    border-radius: 19px 22px 18px 21px;
    background-color: var(--dsw-alias-bg-layer-1);
    box-shadow:
      inset 2px 0 0 color-mix(in srgb, var(--dsw-static-blue-800) 62%, transparent),
      5px 7px 24px rgba(49, 93, 120, 0.09);
  }

  body[data-dsh-maid-skin] [data-dsh-frame='primary-button'] {
    border-image-source: var(--dsw-frame-primary-button);
    border-image-slice: 55 120 55 120 fill;
    border-image-width: 14px;
    border-image-outset: 2px;
  }

  body[data-dsh-maid-skin] [data-dsh-frame='control'] {
    border-image-source: var(--dsw-frame-primary-button);
    border-image-slice: 55 120 55 120 fill;
    border-image-width: 9px;
    border-image-outset: 1px;
  }

  body[data-dsh-maid-skin] [data-dsh-frame='surface'] {
    border-image-source: var(--dsw-frame-panel);
    border-image-slice: 80 120 90 120 fill;
    border-image-width: 15px;
    border-image-outset: 2px;
    box-shadow: inset 2px 0 0 color-mix(in srgb, var(--dsw-static-blue-800) 62%, transparent);
  }

  body[data-dsh-maid-skin] [data-slot='conversation.session.header'] > [data-dsh-frame='surface'] {
    border-width: 1px;
    border-image-width: 11px;
  }

  body[data-dsh-maid-skin] [data-slot='sidebar.settings'] [data-dsh-frame] {
    border-image-outset: 0;
  }

  body[data-dsh-maid-skin] [data-dsh-frame='message'] {
    min-width: 0;
    border: 2px solid var(--dsw-alias-border-l2);
    border-image-source: var(--dsw-frame-panel);
    border-image-slice: 80 120 90 120 fill;
    border-image-width: 19px;
    border-image-outset: 3px;
    overflow-wrap: anywhere;
  }

  body[data-dsh-maid-skin] [data-dsh-frame='message'][data-dsh-message-role='user'] {
    border-radius: 20px 23px 18px 22px;
    background-color: var(--dsw-specific-bubble);
    box-shadow:
      inset 0 0 0 2px color-mix(in srgb, var(--dsw-static-blue-600) 38%, transparent),
      3px 5px 16px rgba(49, 93, 120, 0.10);
    padding: 10px 16px;
  }

  body[data-dsh-maid-skin] [data-dsh-frame='message'][data-dsh-message-role='assistant'] {
    border-radius: 21px 24px 19px 23px;
    background-color: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 88%, transparent);
    box-shadow:
      inset 0 0 0 2px color-mix(in srgb, var(--dsw-static-blue-600) 42%, transparent),
      4px 6px 22px rgba(49, 93, 120, 0.10);
    margin-block: 5px 11px;
    padding: 18px 21px 20px;
  }

  body[data-dsh-maid-skin] [data-dsh-message-role='assistant'] > * {
    min-width: 0;
  }

  body[data-dsh-maid-skin] [data-dsh-frame='primary-button']:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--dsw-static-blue-400) 46%, transparent);
    outline-offset: 4px;
  }

  /* ── Ornaments ── */
  body[data-dsh-maid-skin] .dsh-maid-ornament-layer {
    position: fixed;
    inset: 0;
    z-index: 7;
    overflow: hidden;
    pointer-events: none;
  }

  body[data-dsh-maid-skin] .dsh-maid-ornament {
    position: absolute;
    display: block;
    max-width: none;
    object-fit: contain;
    user-select: none;
    opacity: 0.94;
    filter: drop-shadow(0 5px 8px rgba(49, 93, 120, 0.12));
  }

  body[data-dsh-maid-skin] .dsh-maid-ornament-bow {
    top: calc(var(--dsw-y) - 12px);
    left: calc(var(--dsw-x) + var(--dsw-w) - 13px);
    width: 44px;
    height: 58px;
    transform: rotate(5deg) scaleX(-1);
  }

  body[data-dsh-maid-skin] .dsh-maid-ornament-whale-tail {
    top: calc(var(--dsw-y) - 11px);
    left: calc(var(--dsw-x) + var(--dsw-w) + 7px);
    width: 48px;
    height: 43px;
    transform: rotate(-3deg);
  }

  body[data-dsh-maid-skin] .dsh-maid-ornament-apron-crest {
    top: calc(var(--dsw-y) - 44px);
    left: calc(var(--dsw-x) + var(--dsw-w) - 2px);
    width: 88px;
    height: 88px;
    transform: rotate(2deg);
  }

  body[data-dsh-maid-skin] .dsh-maid-ornament-hair-wave {
    top: calc(var(--dsw-y) - 21px);
    left: calc(var(--dsw-x) + var(--dsw-w) + 10px);
    width: 104px;
    height: 54px;
    transform: rotate(-2deg);
  }

  body[data-dsh-maid-skin] .dsh-maid-ornament-bubbles {
    top: calc(var(--dsw-y) - 46px);
    left: calc(var(--dsw-x) + var(--dsw-w) - 59px);
    width: 64px;
    height: 64px;
    transform: rotate(3deg);
  }

  body[data-dsh-maid-skin] .dsh-maid-ornament-headband-corner {
    top: calc(var(--dsw-y) - 31px);
    left: calc(var(--dsw-x) + var(--dsw-w) - 51px);
    width: 70px;
    height: 82px;
    transform: rotate(4deg);
  }

  body[data-dsh-maid-skin] .dsh-maid-ornament-ribbon-tab {
    top: calc(var(--dsw-y) - 33px);
    left: calc(var(--dsw-x) + var(--dsw-w) - 91px);
    width: 112px;
    height: 58px;
    transform: rotate(-2deg);
  }

  body[data-dsh-maid-skin] .dsh-maid-ornament-cloud-tide {
    top: calc(var(--dsw-y) + var(--dsw-h) - 90px);
    left: calc(var(--dsw-x) - 19px);
    width: 126px;
    height: 62px;
    transform: rotate(-2deg);
  }

  /* ── Mascot ── */
  body[data-dsh-maid-skin] .dsh-maid-mascot {
    position: fixed;
    bottom: max(20px, env(safe-area-inset-bottom));
    left: max(18px, env(safe-area-inset-left));
    z-index: 8;
    width: 148px;
    height: 160px;
    opacity: 0.96;
    pointer-events: none;
  }

  body[data-dsh-maid-skin] .dsh-maid-mascot-image {
    display: block;
    width: 148px;
    height: 160px;
    object-fit: contain;
    object-position: center bottom;
    filter: drop-shadow(0 8px 10px rgba(49, 93, 120, 0.16));
  }

  @media (max-width: 959px) {
    body[data-dsh-maid-skin] {
      background-position: center, calc(50% + 80px) center, center, center, center !important;
    }

    body[data-dsh-maid-skin] [data-dsh-frame] {
      border-image-width: 12px;
      border-image-outset: 1px;
    }

    body[data-dsh-maid-skin] :is(
      [data-dsh-frame='composer-shell'],
      [data-slot='conversation.session.header'] > [data-dsh-frame='surface']
    ) {
      border-width: 1px;
      border-image-width: 9px;
    }

    body[data-dsh-maid-skin] :is(
      [data-dsh-frame='composer'],
      [data-dsh-frame='dialog'],
      [data-dsh-frame='menu'],
      [data-dsh-frame='message']
    ) {
      box-shadow: 0 7px 18px rgba(36, 55, 70, 0.09);
    }

    body[data-dsh-maid-skin] [data-dsh-frame='panel'] {
      box-shadow:
        inset 2px 0 0 color-mix(in srgb, var(--dsw-static-blue-800) 62%, transparent),
        0 7px 18px rgba(36, 55, 70, 0.09);
    }

    body[data-dsh-maid-skin] [data-dsh-message-role='assistant'] {
      padding: 14px 15px 16px;
    }
  }

  @media (max-width: 959px), print {
    body[data-dsh-maid-skin] .dsh-maid-mascot,
    body[data-dsh-maid-skin] .dsh-maid-ornament-apron-crest,
    body[data-dsh-maid-skin] .dsh-maid-ornament-hair-wave,
    body[data-dsh-maid-skin] .dsh-maid-ornament-bubbles,
    body[data-dsh-maid-skin] .dsh-maid-ornament-ribbon-tab,
    body[data-dsh-maid-skin] .dsh-maid-ornament-cloud-tide {
      display: none;
    }
  }

  @media print {
    body[data-dsh-maid-skin] {
      background-image: none !important;
    }

    body[data-dsh-maid-skin] [data-dsh-frame] {
      border-image-source: none !important;
      box-shadow: none !important;
    }

    body[data-dsh-maid-skin] .dsh-maid-ornament-layer {
      display: none;
    }

    body[data-dsh-maid-skin] [data-dsh-sidebar-surface] {
      background-image: none !important;
    }
  }
`;
const MAID_CSS_TAG = "dsh-beautify/maid-skin";
if (typeof document !== "undefined" &&
    document.querySelector("style[data-plugin-css=" + JSON.stringify(MAID_CSS_TAG) + "]") === null) {
    const tag = document.createElement("style");
    tag.dataset.plugin = "dsh-beautify";
    tag.dataset.pluginCss = MAID_CSS_TAG;
    tag.textContent = MAID_CSS;
    document.head.appendChild(tag);
}
/**
 * Mount the maid-whale chrome (backdrop, mascot, favicon, sidebar surface,
 * frames, ornaments) and return its controller. The caller owns mode
 * propagation; the chrome retracts fully on dispose.
 */
export function initMaidSkin() {
    const body = document.body;
    const originalTitle = document.title;
    const previous = new Map();
    for (const property of BACKDROP_PROPERTIES) {
        previous.set(property, body.style.getPropertyValue(property));
    }
    body.setAttribute(MAID_ATTR, '');
    const mascot = document.createElement('div');
    mascot.className = 'dsh-maid-mascot';
    mascot.dataset.skinChrome = 'mascot';
    const image = document.createElement('img');
    image.className = 'dsh-maid-mascot-image';
    image.src = PET_ART;
    image.alt = '';
    image.setAttribute('aria-hidden', 'true');
    mascot.append(image);
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/webp';
    favicon.href = PET_ART;
    favicon.dataset.deepseekWorkshopIcon = '';
    document.head.append(favicon);
    const media = typeof window.matchMedia === 'function' ? window.matchMedia(WIDE_QUERY) : undefined;
    let sidebarSurface;
    const clearSidebarSurface = () => {
        sidebarSurface?.removeAttribute(SIDEBAR_ATTR);
        sidebarSurface?.style.removeProperty(SIDEBAR_BACKGROUND_PROPERTY);
        sidebarSurface = undefined;
    };
    const findSidebarSurface = () => {
        const tree = body.querySelector('[role="tree"]');
        if (!tree)
            return undefined;
        const treeBounds = tree.getBoundingClientRect();
        const maximumSidebarWidth = Math.max(480, treeBounds.width * 1.75);
        let candidate = tree;
        for (let parent = tree.parentElement; parent && parent !== body; parent = parent.parentElement) {
            const bounds = parent.getBoundingClientRect();
            if (bounds.width <= 0)
                continue;
            if (treeBounds.width > 0 && bounds.width > maximumSidebarWidth)
                break;
            candidate = parent;
        }
        return candidate;
    };
    const syncSidebarSurface = () => {
        const next = findSidebarSurface();
        if (next === sidebarSurface && next?.isConnected)
            return;
        clearSidebarSurface();
        if (!next)
            return;
        sidebarSurface = next;
        sidebarSurface.setAttribute(SIDEBAR_ATTR, '');
        sidebarSurface.style.setProperty(SIDEBAR_BACKGROUND_PROPERTY, `url("${SIDEBAR_OCEAN_BACKGROUND}")`);
    };
    const syncMascotPosition = () => {
        const workspace = body.querySelector('[role="tree"]');
        if (!workspace || !mascot.isConnected)
            return;
        const bounds = workspace.getBoundingClientRect();
        if (bounds.width <= 0)
            return;
        const left = Math.round(Math.max(bounds.left + MASCOT_EDGE_GAP, bounds.right - MASCOT_WIDTH - MASCOT_EDGE_GAP));
        const value = `${left}px`;
        if (mascot.style.left !== value)
            mascot.style.left = value;
    };
    const syncMascotMount = () => {
        if (media?.matches ?? true) {
            if (!mascot.isConnected)
                body.append(mascot);
            syncMascotPosition();
        }
        else {
            mascot.remove();
        }
    };
    syncMascotMount();
    syncSidebarSurface();
    const ornaments = createOrnamentController(body, { wide: media?.matches ?? true });
    const frames = createFrameController(body);
    const setBackdrop = () => {
        const dark = body.hasAttribute('data-ds-dark-theme');
        const mode = dark ? 'dark' : 'light';
        const haze = dark
            ? 'linear-gradient(rgba(18, 31, 47, 0.52), rgba(18, 31, 47, 0.52))'
            : 'linear-gradient(rgba(255, 254, 249, 0.60), rgba(255, 254, 249, 0.60))';
        const paper = dark ? PAPER_BACKDROP_DARK : PAPER_BACKDROP_LIGHT;
        body.style.setProperty('background-image', `${haze}, url("${ILLUSTRATED_BACKGROUND}"), ${paper}`);
        body.style.setProperty('background-position', 'center, calc(50% + 80px) calc(100% - 80px), center, center, center');
        body.style.setProperty('background-size', 'cover, cover, cover, cover, cover');
        body.style.setProperty('background-attachment', 'fixed');
        body.style.setProperty('background-repeat', 'no-repeat');
        mascot.dataset.theme = mode;
        ornaments.setMode(mode);
        frames.setMode(mode);
    };
    const syncViewport = () => {
        syncMascotMount();
        ornaments.setWide(media?.matches ?? true);
    };
    const syncChrome = () => {
        syncMascotPosition();
        syncSidebarSurface();
    };
    // rAF-coalesce the subtree observer: opening a large surface (settings
    // modal, panel swap) mutates the tree in one burst, and running
    // syncMascotPosition per batch forces a layout read (getBoundingClientRect)
    // each time — visibly janky. One pass per frame keeps the hot path cheap.
    let chromeFrame = 0;
    const queueSyncChrome = () => {
        if (chromeFrame !== 0)
            return;
        chromeFrame = requestAnimationFrame(() => {
            chromeFrame = 0;
            syncChrome();
        });
    };
    const mascotObserver = new MutationObserver(queueSyncChrome);
    mascotObserver.observe(body, { childList: true, subtree: true });
    window.addEventListener('resize', syncChrome);
    setBackdrop();
    document.title = SKIN_TITLE;
    const observer = new MutationObserver(setBackdrop);
    observer.observe(body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] });
    media?.addEventListener('change', syncViewport);
    return {
        setMode(mode) {
            frames.setMode(mode);
            ornaments.setMode(mode);
        },
        setWide(wide) {
            ornaments.setWide(wide);
        },
        dispose() {
            frames.dispose();
            ornaments.dispose();
            observer.disconnect();
            mascotObserver.disconnect();
            if (chromeFrame !== 0) {
                cancelAnimationFrame(chromeFrame);
                chromeFrame = 0;
            }
            media?.removeEventListener('change', syncViewport);
            window.removeEventListener('resize', syncChrome);
            clearSidebarSurface();
            body.removeAttribute(MAID_ATTR);
            mascot.remove();
            favicon.remove();
            for (const [property, value] of previous) {
                if (value === '')
                    body.style.removeProperty(property);
                else
                    body.style.setProperty(property, value);
            }
            if (document.title === SKIN_TITLE)
                document.title = originalTitle;
        },
    };
}
//# sourceMappingURL=maid-skin.js.map