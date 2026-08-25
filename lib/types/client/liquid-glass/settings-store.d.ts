import { type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client';
export interface LiquidGlassSettings {
    enabled: boolean;
    l1Blur: number;
    l1Opacity: number;
    l1Border: number;
    modalBlur: number;
    l3MaskOpacity: number;
    ior: number;
    bulge: number;
    dispersion: number;
    bevel: number;
    lensBlur: number;
    darkening: number;
    rimIntensity: number;
    lightAngle: number;
    vibrancy: number;
    rippleAmp: number;
    dropShadowOpacity: number;
    dropShadowBlur: number;
    dropShadowY: number;
    background: 'gradient' | 'wallpaper';
    wallpaper: string;
    bgBlur: number;
    bgLiquidEnabled: boolean;
    bgLiquidAmp: number;
    bgLiquidScale: number;
    bgLiquidSpeed: number;
    bgLiquidDispersion: number;
    /** 轻量档：只应用 CSS 毛玻璃，不挂载每帧 WebGL shader（低配/集显可用）。 */
    lite?: boolean;
    /** 极致档：恢复全效果（1x 渲染、60fps、开水波），仅推荐独立显卡。 */
    ultra?: boolean;
    /** 标准档帧率上限（帧/秒）；ultra 固定 60，lite 不适用。默认 30。 */
    fpsCap?: number;
}
/** 液态玻璃档位：off(关闭) / lite(轻量·纯毛玻璃) / standard(标准·降级透镜) / ultra(极致·全效果) */
export type LiquidGlassLevel = 'off' | 'lite' | 'standard' | 'ultra';
export declare const LIQUID_GLASS_LEVELS: Record<Exclude<LiquidGlassLevel, 'off'>, Partial<LiquidGlassSettings>>;
export declare const LIQUID_GLASS_DEFAULTS: LiquidGlassSettings;
export declare const USER_PRESET_KEY = "dsh.ui-liquid-glass.user_preset";
export interface LiquidGlassRowState extends LiquidGlassSettings {
    revision: number;
}
export interface LiquidGlassSettingsPayload extends LiquidGlassSettings {
}
type LiquidGlassRowActions = {
    sync: (draft: LiquidGlassRowState, next: LiquidGlassSettingsPayload, revision: number) => void;
};
export declare function createLiquidGlassRowStore(): EngineStoreHandle<LiquidGlassRowState, LiquidGlassRowActions>;
export {};
//# sourceMappingURL=settings-store.d.ts.map