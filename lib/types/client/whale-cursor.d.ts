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
import { type CursorSkinId } from './cursor-images.ts';
export declare const WHALE_CURSOR_ATTRIBUTE = "data-dsh-whale-cursor";
/** The mounted whale cursor controller. */
export interface WhaleCursorController {
    /** Re-evaluate the gate (e.g. after an operation style toggles). */
    refresh: () => void;
    /** Set the cursor state explicitly (busy / background / precision / pen). */
    setState: (state: string | null) => void;
    /** Switch the cursor art skin at runtime (whale / custom). */
    setSkin: (id: CursorSkinId) => void;
    /** Resize the rendered sprite (px, 32..64; hot spot scales proportionally). */
    setSize: (px: number) => void;
    /**
     * Replace the per-state enable map. A state whose flag is `false` keeps the
     * native OS cursor instead of the whale sprite (the follower hides and the
     * `cursor: none` gate drops for that state).
     */
    setStateOverrides: (overrides: Record<string, boolean>) => void;
    /** Drop listeners, the follower, and the native-cursor rule. */
    dispose: () => void;
}
/**
 * Attach the image cursor follower with per-state swapping.
 * @param gated - returns whether the effect should be live right now.
 * @returns the controller.
 */
export declare function initWhaleCursor(gated: () => boolean, skinId?: CursorSkinId, size?: number, staticState?: boolean): WhaleCursorController;
//# sourceMappingURL=whale-cursor.d.ts.map