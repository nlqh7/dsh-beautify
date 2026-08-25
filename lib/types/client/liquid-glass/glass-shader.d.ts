/**
 * WebGL 6.0 Multi-Tier Physical Liquid Glass Optics Engine.
 * Layer 0: Full-screen Backdrop & Fluid Flow
 * Layer 1: Left Sidebar Base Frosted Glass (16-Tap Gaussian Blur + Opacity + Border)
 * Layer 2: Multi-Lens Physical Liquid Glass System (High-Performance Real-Time Motion Tracking & Fast Clean Exit)
 */
export interface ShaderOptions {
    l1Blur: number;
    modalBlur?: number;
    l1Opacity: number;
    l1Border: number;
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
    /** 极致档：1x 渲染 + 60fps（仅推荐独立显卡）。 */
    ultra?: boolean;
    /** 标准档帧率上限（帧/秒）；ultra 固定 60，lite 不跑 WebGL 不适用。默认 30。 */
    fpsCap?: number;
    background: 'gradient' | 'wallpaper';
    wallpaper: string;
    bgBlur: number;
    bgLiquidEnabled: boolean;
    bgLiquidAmp: number;
    bgLiquidScale: number;
    bgLiquidSpeed: number;
    bgLiquidDispersion: number;
}
export interface GlassShaderHandle {
    update: (opts: Partial<ShaderOptions>) => void;
    dispose: () => void;
}
/**
 * Keeps the public shader handle stable while rebuilding all WebGL resources
 * after Chromium restores a lost context.
 */
export declare function attachLiquidGlassShader(canvas: HTMLCanvasElement, currentOpts: ShaderOptions): GlassShaderHandle;
//# sourceMappingURL=glass-shader.d.ts.map