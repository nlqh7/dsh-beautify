/** One cursor state: its 48px PNG data URI and the pointer hot spot (px, from the image top-left). */
export interface CursorState {
    /** The 48px transparent PNG as a data URI. */
    image: string;
    /** Hot spot x, px from the image left edge. */
    hotX: number;
    /** Hot spot y, px from the image top edge. */
    hotY: number;
}
/** Cursor skin id; `whale` is the built-in, `custom` is user-authored. */
export type CursorSkinId = 'whale' | 'custom';
/** Every custom cursor state keyed by its trigger (the built-in whale skin). */
export declare const CURSOR_STATES: Record<string, CursorState>;
/**
 * User-authored cursor skin. Replace each `image` below with your own 48px
 * transparent PNG as a data URI (the `default` state must be a pointer arrow;
 * the pendant/decoration can vary per state). `hotX`/`hotY` are the pointer
 * tip coordinates from the image top-left.
 *
 * To author a skin: export the PNGs (48x48 recommended, transparent), base64
 * them (e.g. `base64 -w0 default.png`), and paste each into the matching
 * state. The `link`/`text`/`busy`/`not-allowed` variants only need the base
 * art swapped — the runtime swaps per hovered element.
 */
export declare const CUSTOM_CURSOR_STATES: Record<string, CursorState>;
/** All selectable cursor skins keyed by {@link CursorSkinId}. */
export declare const CURSOR_SKINS: Record<CursorSkinId, Record<string, CursorState>>;
/** localStorage key holding user-uploaded cursor images (state -> data URL). */
export declare const CURSOR_UPLOAD_KEY = "dsh-beautify:cursor-uploads";
/** State ids in upload order with a display label for the settings UI. */
export declare const CURSOR_UPLOAD_STATES: ReadonlyArray<{
    id: string;
    label: string;
}>;
/** User-uploaded cursor images persisted in localStorage (state id -> data URL). */
export type CursorUploads = Partial<Record<string, string>>;
/** Read uploaded cursor images, tolerating missing or malformed storage. */
export declare function readCursorUploads(): CursorUploads;
/** Persist uploaded cursor images. */
export declare function writeCursorUploads(uploads: CursorUploads): void;
/** Resolve a skin by id, falling back to the built-in whale skin. */
export declare function cursorSkinFor(id: string | undefined): Record<string, CursorState>;
//# sourceMappingURL=cursor-images.d.ts.map