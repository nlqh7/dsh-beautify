export interface MaidSkinController {
    setMode(mode: 'light' | 'dark'): void;
    setWide(wide: boolean): void;
    dispose(): void;
}
/**
 * Mount the maid-whale chrome (backdrop, mascot, favicon, sidebar surface,
 * frames, ornaments) and return its controller. The caller owns mode
 * propagation; the chrome retracts fully on dispose.
 */
export declare function initMaidSkin(): MaidSkinController;
//# sourceMappingURL=maid-skin.d.ts.map