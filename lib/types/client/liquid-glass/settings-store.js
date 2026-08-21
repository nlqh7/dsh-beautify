import { defineStore } from '@deepseek-ai/dsh-client-runtime/client';
export const LIQUID_GLASS_LEVELS = {
    lite: {
        enabled: true, lite: true, ultra: false,
        l1Blur: 8, l1Opacity: 0.6, l1Border: 0.1,
        modalBlur: 6, l3MaskOpacity: 0.3,
        lensBlur: 0, rippleAmp: 0, bgLiquidEnabled: false,
        dispersion: 0.04, bevel: 0.2, vibrancy: 1.05,
        dropShadowBlur: 8, dropShadowY: 6, dropShadowOpacity: 0.03,
    },
    standard: {
        enabled: true, lite: false, ultra: false,
        l1Blur: 10, l1Opacity: 0.75, l1Border: 0.12,
        modalBlur: 8, l3MaskOpacity: 0.35,
        lensBlur: 4, rippleAmp: 0.2, bgLiquidEnabled: false,
        dispersion: 0.06, bevel: 0.3, vibrancy: 1.15,
        dropShadowBlur: 16, dropShadowY: 12, dropShadowOpacity: 0.05,
    },
    ultra: {
        enabled: true, lite: false, ultra: true,
        l1Blur: 20, l1Opacity: 0.85, l1Border: 0.15,
        modalBlur: 24, l3MaskOpacity: 0.45,
        lensBlur: 8, rippleAmp: 0.5, bgLiquidEnabled: true,
        dispersion: 0.08, bevel: 0.35, vibrancy: 1.25,
        dropShadowBlur: 48, dropShadowY: 16, dropShadowOpacity: 0.05,
    },
};
export const LIQUID_GLASS_DEFAULTS = {
    enabled: false, // 默认关闭：全屏 WebGL + 毛玻璃对低配/集显开销过大（曾卡死浏览器）
    l1Blur: 10,
    l1Opacity: 0.75,
    l1Border: 0.12,
    modalBlur: 8,
    l3MaskOpacity: 0.35,
    ior: 1.45,
    bulge: 0.25,
    dispersion: 0.06,
    bevel: 0.3,
    lensBlur: 4,
    darkening: 0.04,
    rimIntensity: 0.55,
    lightAngle: 45,
    vibrancy: 1.15,
    rippleAmp: 0.2,
    dropShadowOpacity: 0.05,
    dropShadowBlur: 16,
    dropShadowY: 12,
    background: 'wallpaper',
    wallpaper: "",
    bgBlur: 0,
    bgLiquidEnabled: false, // 默认关闭背景噪声水波（每帧最贵的 shader 部分，卡顿主因之一）
    bgLiquidAmp: 0.2,
    bgLiquidScale: 0.3,
    bgLiquidSpeed: 0.06,
    bgLiquidDispersion: 0.02,
};
export const USER_PRESET_KEY = 'dsh.ui-liquid-glass.user_preset';
export function createLiquidGlassRowStore() {
    return defineStore({
        init: () => ({ ...LIQUID_GLASS_DEFAULTS, revision: -1 }),
        actions: {
            sync: (draft, next, revision) => {
                if (revision <= draft.revision)
                    return;
                Object.assign(draft, next);
                draft.revision = revision;
            },
        },
    });
}
//# sourceMappingURL=settings-store.js.map