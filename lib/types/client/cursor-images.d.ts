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
 * User-authored cursor skin. The shipped art is the built-in whale sprite:
 * states the user has not uploaded keep rendering the whale (an invalid
 * placeholder data URI here would fail the img load, flip the follower's
 * error gate, and silently revert the whole custom skin to the OS cursor).
 * Runtime uploads overlay per-state data URLs from localStorage
 * ({@link readCursorUploads}); the merged skin never mutates either base map.
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