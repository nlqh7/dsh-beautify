/**
 * DeepSeek ocean cursor: a blue pointer arrow with a Q-chibi maid pendant
 * replaces the native pointer inside the app and disappears the moment the
 * pointer leaves the window. A single fixed follower <img> (pointer-events:
 * none, top z-index) tracks the pointer via rAF-merged transform writes; a
 * gated `* { cursor: none }` rule hides the native pointer only while the
 * effect is live. Reduced motion keeps the native cursor instead.
 *
 * The image swaps per state, detected from the hovered element (text / link /
 * disabled) or set explicitly by the application (busy / background / precision /
 * pen). Each state carries its own hot spot so the arrow tip stays on the
 * pointer even though the pendant extends the sprite.
 */
import { cursorSkinFor, type CursorSkinId } from './cursor-images.ts'

export const WHALE_CURSOR_ATTRIBUTE = 'data-dsh-whale-cursor'

/** Attribute marking the follower div itself (distinct from the html gate). */
const WHALE_MARK = 'data-dsh-whale-mark'

/** Default state used when the pointer is over neutral surface. */
const DEFAULT_STATE = 'default'

/** The mounted whale cursor controller. */
export interface WhaleCursorController {
  /** Re-evaluate the gate (e.g. after an operation style toggles). */
  refresh: () => void
  /** Set the cursor state explicitly (busy / background / precision / pen). */
  setState: (state: string | null) => void
  /** Switch the cursor art skin at runtime (whale / custom). */
  setSkin: (id: CursorSkinId) => void
  /** Resize the rendered sprite (px, 32..64; hot spot scales proportionally). */
  setSize: (px: number) => void
  /**
   * Replace the per-state enable map. A state whose flag is `false` keeps the
   * native OS cursor instead of the whale sprite (the follower hides and the
   * `cursor: none` gate drops for that state).
   */
  setStateOverrides: (overrides: Record<string, boolean>) => void
  /** Drop listeners, the follower, and the native-cursor rule. */
  dispose: () => void
}

/** The follower + native-cursor-hide CSS, gated on the html attribute. */
function whaleCursorCss(): string {
  return `
html[${WHALE_CURSOR_ATTRIBUTE}] * {
  cursor: none !important;
}
[${WHALE_MARK}] {
  display: none;
}
[${WHALE_MARK}][data-dsh-whale-visible] {
  display: block !important;
}
[${WHALE_MARK}] img {
  display: block;
  pointer-events: none;
  /* Sharpen scaled rendering: the source art is 48px, so any upscale beyond
     that benefits from contrast-preserving resampling over the default smooth
     filter, and the drop shadow is dropped (it fuzzes a small sprite). */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}
`
}

/** Whether an element should present the text cursor. */
function isTextTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    return !target.disabled && target.type !== 'checkbox' && target.type !== 'radio' && target.type !== 'range'
  }
  if (target instanceof HTMLSelectElement) return false
  return target.isContentEditable
}

/** Whether an element should present the not-allowed cursor. */
function isDisabledTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.hasAttribute('disabled') || target.getAttribute('aria-disabled') === 'true'
}

/** Whether an element should present the pointer cursor. */
function isLinkTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.closest(
    'a[href], button, [role="button"], [role="link"], input[type="submit"], input[type="button"], [data-cursor="pointer"]',
  ) !== null
}

/** Whether an element should present the crosshair cursor. */
function isPrecisionTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.closest('canvas, [data-cursor="crosshair"]') !== null
}

/** Resolve the cursor state for a hovered element. */
function stateForTarget(target: EventTarget | null): string {
  if (isDisabledTarget(target)) return 'not-allowed'
  if (isTextTarget(target)) return 'text'
  if (isPrecisionTarget(target)) return 'precision'
  if (isLinkTarget(target)) return 'link'
  return DEFAULT_STATE
}

/**
 * Attach the image cursor follower with per-state swapping.
 * @param gated - returns whether the effect should be live right now.
 * @returns the controller.
 */
export function initWhaleCursor(
  gated: () => boolean,
  skinId: CursorSkinId = 'whale',
  size = 48,
  staticState = true,
): WhaleCursorController {
  const root = document.documentElement
  let raf = 0
  let enabled = false
  let explicit: string | null = null
  // Per-target state detection off by default: one regular sprite at all
  // times (dragging stays on the same art, the whale pet remains pettable).
  let staticMode = staticState
  // Per-state enable map: a state whose flag is `false` falls back to the
  // native OS cursor. Absent keys default to enabled — except `drag`, which
  // defaults to disabled: dragging (pressing to grab / move) feels most
  // natural with the system cursor, and the user can opt back into the art.
  const DISABLED_BY_DEFAULT = new Set(['drag'])
  let stateOverrides: Record<string, boolean> = {}
  const isStateEnabled = (state: string): boolean =>
    stateOverrides[state] === true || (stateOverrides[state] !== false && !DISABLED_BY_DEFAULT.has(state))
  // Active art skin; swap via setSkin, then re-apply the current state.
  let skin = cursorSkinFor(skinId)
  // Render size; hot spot scales proportionally from the 48px source art.
  let spriteSize = Math.min(64, Math.max(24, size))
  // Sentinel (not a real state) so the first applyState(DEFAULT_STATE) at boot
  // does not early-return and actually assigns img.src — otherwise the default
  // sprite is never loaded and the whole effect stays disabled.
  let current = ''
  let imageReady = false
  let placed = false
  let lastX = 0
  let lastY = 0
  // Last element the cursor state was detected from; re-detection is skipped
  // while pointermove keeps firing on the same element.
  let stateTarget: EventTarget | null = null
  // Mirror of the whale-widget's pet-hover flag (html[data-dsh-whale-hover]):
  // while the pointer pets the whale, the whale gate closes so the widget's
  // native hand cursor (body cursor: grab) shows instead of the art.
  let lastWhaleHover = false
  let hoverNative = false
  // True while a primary button is held: the sprite switches to the drag
  // state (or falls back to the native cursor when drag is disabled).
  let dragging = false

  // Query once and cache the boolean. Reading `matchMedia(...).matches` on
  // every pointermove forces a style recalc per event, which competes with
  // the follower's rAF and makes the sprite visibly lag behind the pointer.
  // Registered after setGate below; change is rare, so the listener cost is nil.
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  let reducedMotion = reducedMotionQuery.matches
  const onReducedMotionChange = (): void => {
    reducedMotion = reducedMotionQuery.matches
    setGate()
  }

  const whale = document.createElement('div')
  whale.setAttribute(WHALE_MARK, '')
  whale.style.cssText =
    'position:fixed;left:0;top:0;pointer-events:none;z-index:100000;' +
    'will-change:transform'
  const img = document.createElement('img')
  img.alt = ''
  img.draggable = false
  whale.appendChild(img)
  document.body.appendChild(whale)

  const styleEl = document.createElement('style')
  styleEl.textContent = whaleCursorCss()
  document.head.appendChild(styleEl)

  const hide = (): void => {
    if (raf !== 0) { cancelAnimationFrame(raf); raf = 0 }
    whale.removeAttribute('data-dsh-whale-visible')
  }

  const setGate = (): void => {
    // A state disabled by the user falls back to the native OS cursor, so the
    // whale gate must close while that state is active. Petting the whale
    // (hoverNative) also closes the gate so the widget's hand cursor shows.
    const stateOk = isStateEnabled(current)
    const nextEnabled = imageReady && placed && gated() && !reducedMotion && stateOk && !hoverNative
    // State unchanged: nothing to write. This runs on every pointermove, so
    // early-returning keeps the hot path to a couple of boolean reads instead
    // of repeated attribute writes and transform churn.
    if (nextEnabled === enabled) return
    enabled = nextEnabled
    if (enabled) {
      root.setAttribute(WHALE_CURSOR_ATTRIBUTE, '')
      // Gate may have opened after the sprite decoded and a move already
      // happened; draw the follower at the last known position immediately.
      if (placed) {
        const hotX = Number(img.dataset.hotX ?? 0)
        const hotY = Number(img.dataset.hotY ?? 0)
        whale.style.transform =
          `translate3d(${lastX - hotX}px, ${lastY - hotY}px, 0)`
        whale.setAttribute('data-dsh-whale-visible', '')
      }
    } else {
      root.removeAttribute(WHALE_CURSOR_ATTRIBUTE)
      hide()
    }
  }

  const applyState = (state: string): void => {
    if (state === current) return
    const next = skin[state]
    if (next === undefined) return
    current = state
    // Publish the active state so the gate can honor per-state overrides and
    // future CSS can target it; the attribute name matches the html gate.
    root.setAttribute(WHALE_CURSOR_ATTRIBUTE + '-state', state)
    // A state disabled by the user keeps the native OS cursor: hide the
    // follower and drop the `cursor: none` gate for as long as it is active.
    if (!isStateEnabled(state)) {
      hide()
      setGate()
      return
    }
    img.src = next.image
    img.style.width = `${spriteSize}px`
    img.style.height = `${spriteSize}px`
    // Store the hot spot scaled to the rendered sprite size, so the move
    // handler can use it directly without per-frame math.
    const scale = spriteSize / 48
    img.dataset.hotX = String(next.hotX * scale)
    img.dataset.hotY = String(next.hotY * scale)
    setGate()
  }
  applyState(DEFAULT_STATE)
  // Park the follower off-screen and hidden; the first pointermove places it
  // under the pointer and only then does the gate hide the native cursor.
  whale.style.transform = 'translate(-10000px, -10000px)'

  const onMove = (event: PointerEvent): void => {
    lastX = event.clientX
    lastY = event.clientY
    placed = true
    // State / pet detection runs BEFORE the gate early-return: once the gate
    // closes (petting, disabled state) the follower stops drawing, but we must
    // keep tracking the pointer so leaving the whale re-opens the gate.
    if (!staticMode && !dragging) {
      const whaleHover = document.documentElement.hasAttribute('data-dsh-whale-hover')
      if (event.target !== stateTarget || whaleHover !== lastWhaleHover) {
        stateTarget = event.target
        lastWhaleHover = whaleHover
        if (whaleHover) {
          // Petting: release the gate (the widget already set the native
          // grab hand on body) and hide the follower.
          hoverNative = true
          current = ''
          hide()
        } else {
          hoverNative = false
          const state = explicit ?? stateForTarget(event.target)
          if (state !== current) applyState(state)
        }
      }
    }
    setGate()
    if (!enabled) return
    if (raf !== 0) return
    raf = requestAnimationFrame(() => {
      raf = 0
      const hotX = Number(img.dataset.hotX ?? 0)
      const hotY = Number(img.dataset.hotY ?? 0)
      whale.style.transform =
        `translate3d(${lastX - hotX}px, ${lastY - hotY}px, 0)`
      whale.setAttribute('data-dsh-whale-visible', '')
    })
  }

  const onLeave = (): void => { hide() }

  // Primary-button press switches to the drag state; release returns to
  // automatic target detection. A disabled drag state falls back to the
  // native OS cursor (the grab/grabbing hand) via the per-state gate.
  const onPointerDown = (event: PointerEvent): void => {
    if (dragging) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    dragging = true
    current = ''
    applyState('drag')
  }
  const onPointerUp = (): void => {
    if (!dragging) return
    dragging = false
    current = ''
    applyState(explicit ?? DEFAULT_STATE)
    stateTarget = null
  }

  // Warm the default sprite's decode before hiding the native cursor, so a
  // refresh never shows a gap where neither cursor is visible.
  img.decode().then((): void => {
    imageReady = true
    setGate()
  }).catch((): void => {
    // Keep the native cursor if the sprite cannot decode.
    imageReady = false
  })
  setGate()
  reducedMotionQuery.addEventListener('change', onReducedMotionChange)

  document.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerleave', onLeave)
  document.addEventListener('pointerdown', onPointerDown, { passive: true })
  document.addEventListener('pointerup', onPointerUp, { passive: true })
  document.addEventListener('pointercancel', onPointerUp)

  return {
    refresh: setGate,
    setState: (state: string | null): void => {
      explicit = state
      if (!enabled) return
      if (state !== null) {
        applyState(state)
      } else {
        // Back to auto detection; the next pointermove picks the element state.
        applyState(DEFAULT_STATE)
      }
    },
    setSkin: (id: CursorSkinId): void => {
      skin = cursorSkinFor(id)
      // Re-apply the current state so the new art takes effect immediately
      // (force by clearing `current`; a state name match would otherwise skip).
      current = ''
      applyState(explicit ?? DEFAULT_STATE)
    },
    setSize: (px: number): void => {
      const clamped = Math.min(64, Math.max(24, px))
      if (clamped === spriteSize) return
      spriteSize = clamped
      // Re-apply so the sprite and scaled hot spot update together.
      current = ''
      applyState(explicit ?? DEFAULT_STATE)
    },
    setStateOverrides: (overrides: Record<string, boolean>): void => {
      stateOverrides = overrides
      // Re-evaluate the active state against the new map: force re-draw so a
      // toggled-off state drops the sprite (native cursor returns) and a
      // toggled-on state restores it immediately.
      const active = current || DEFAULT_STATE
      current = ''
      applyState(active)
    },
    dispose: () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('pointerup', onPointerUp)
      document.removeEventListener('pointercancel', onPointerUp)
      reducedMotionQuery.removeEventListener('change', onReducedMotionChange)
      if (raf !== 0) cancelAnimationFrame(raf)
      root.removeAttribute(WHALE_CURSOR_ATTRIBUTE)
      whale.remove()
      styleEl.remove()
    },
  }
}
