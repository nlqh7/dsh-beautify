/**
 * Liquid Glass Theme Layer — Multi-Tier Optics Engine.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { ThemeTokenOverrides } from '@deepseek-ai/dsh-client-ui-theme/client';
import { type LiquidGlassSettings } from './settings-store.ts';
export declare const LIQUID_GLASS_ATTRIBUTE = "data-dsh-liquid-glass";
export declare const LIQUID_GLASS_ENABLED_KEY = "dsh.ui-liquid-glass.enabled";
export declare const LIQUID_GLASS_TOKEN_OVERRIDES: ThemeTokenOverrides;
export declare class LiquidGlassLayer {
    private enabled;
    private settings;
    private shaderHandle;
    private tokenDisposer;
    private seamDisposer;
    private readonly ctx;
    private saveDebounceTimer;
    private popoverBlurRaf;
    private disposed;
    constructor(ctx: Context);
    private initBootSequence;
    private hydrateSettingsFromDisk;
    private hydrateWallpaperOnBoot;
    private loadState;
    private saveState;
    sync(): void;
    private updateLayerCssVariables;
    private sidebarObserver;
    private chatMaskDisposer;
    private popoverObserver;
    private mount;
    private applySettings;
    private applyPopoverBlur;
    private unmount;
    getEnabled(): boolean;
    /** Full teardown (used when the hosting plugin unloads). */
    dispose(): void;
    setEnabled(val: boolean): void;
    getSettings(): LiquidGlassSettings;
    updateSettings(partial: Partial<LiquidGlassSettings>): void;
}
//# sourceMappingURL=theme-layer.d.ts.map