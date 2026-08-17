/**
 * dsh-wallpaper-engine — client (browser) half source.
 *
 * CANONICAL source; `scripts/build-client.mjs` emits `lib/client.js`. Edit this
 * file, run `npm run build`. Do not hand-edit `lib/client.js`.
 *
 * The plugin:
 *   1. Fetches the wallpaper inventory from the host half's same-origin route
 *      (GET /wallpaper-engine/inventory). A "刷新" button refetches on demand so
 *      newly downloaded Wallpaper Engine wallpapers appear without a page reload.
 *   2. Renders the selected wallpaper BEHIND the DSH GUI: a `position:fixed;
 *      z-index:-1` child of `document.body`, plus a scrim (darkened overlay). The
 *      app frame + sidebar backgrounds are made transparent so the wallpaper
 *      shows through the whole frame while the scrim keeps text readable.
 *   3. Applies four user-adjustable effects, each with its own slider:
 *      - 壁纸模糊 (wallpaper blur) → `--we-wallpaper-blur`
 *      - 暗化 (scrim strength)      → `--we-scrim-color`
 *      - 边框 (border emphasis)     → `--dsw-alias-border-l1/l2` alpha
 *      - 玻璃 (glass blur on panels)→ `--we-blur` + frosted-glass backgrounds
 *      The "glass" effect turns the opaque conversation surfaces (composer card,
 *      message bubbles, raised panels) into translucent frosted glass backed by
 *      `backdrop-filter`, so the wallpaper shows through them softly.
 *   4. Automatic rotation over USER-DEFINED carousel lists (轮播列表): the user
 *      can create any number of lists, pick wallpapers into each from the
 *      inventory, and give each list its own switch interval and order. Lists
 *      are persisted client-side (localStorage), so rotation never depends on
 *      Wallpaper Engine's own config.json playlist paths. A playable WE
 *      playlist is imported as the first list on first run so the feature
 *      starts working out of the box.
 */
export declare function useStore(): {
    url: null;
    type: null;
    playing: boolean;
    loading: boolean;
    rotationTimer: null;
    editing: null;
    inventory: {
        installDir: null;
        wallpapers: never[];
        total: number;
        portableCount: number;
        playlists: never[];
        error: null;
    };
    loaded: boolean;
    scrim: number;
    border: number;
    blur: number;
    wallpaperBlur: number;
    rotationEnabled: boolean;
    rotationInterval: number;
    rotationGroupId: string;
    rotationGroups: never[];
    rotationSeeded: boolean;
    id: string;
} | {
    url: null;
    type: null;
    playing: boolean;
    loading: boolean;
    rotationTimer: null;
    editing: null;
    inventory: {
        installDir: null;
        wallpapers: never[];
        total: number;
        portableCount: number;
        playlists: never[];
        error: null;
    };
    loaded: boolean;
    id: any;
    scrim: any;
    border: any;
    blur: any;
    wallpaperBlur: any;
    rotationEnabled: boolean;
    rotationGroupId: any;
    rotationGroups: {
        id: any;
        name: any;
        interval: any;
        order: string;
        wallpaperIds: any;
    }[];
    rotationSeeded: boolean;
};
export declare function loadInventory(): Promise<void>;
export declare function applySelection(id: any): void;
/** Set one effect knob by kind: 'scrim' | 'border' | 'blur' | 'wallpaperBlur'. */
export declare function setWeEffect(kind: any, value: any): void;
/** Toggle play/pause of the active wallpaper. */
export declare function toggleWePlay(): void;
export declare function initWallpaperLayer(ctx: any): void;
//# sourceMappingURL=wallpaper-layer.d.ts.map