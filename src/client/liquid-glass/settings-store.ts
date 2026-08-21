import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'

export interface LiquidGlassSettings {
  enabled: boolean
  l1Blur: number
  l1Opacity: number
  l1Border: number
  modalBlur: number
  l3MaskOpacity: number
  ior: number
  bulge: number
  dispersion: number
  bevel: number
  lensBlur: number
  darkening: number
  rimIntensity: number
  lightAngle: number
  vibrancy: number
  rippleAmp: number
  dropShadowOpacity: number
  dropShadowBlur: number
  dropShadowY: number
  background: 'gradient' | 'wallpaper'
  wallpaper: string
  bgBlur: number
  bgLiquidEnabled: boolean
  bgLiquidAmp: number
  bgLiquidScale: number
  bgLiquidSpeed: number
  bgLiquidDispersion: number
}

export const LIQUID_GLASS_DEFAULTS: LiquidGlassSettings = {
  enabled: false,  // 默认关闭：全屏 WebGL + 毛玻璃对低配/集显开销过大（曾卡死浏览器）
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
  bgLiquidEnabled: false,   // 默认关闭背景噪声水波（每帧最贵的 shader 部分，卡顿主因之一）
  bgLiquidAmp: 0.2,
  bgLiquidScale: 0.3,
  bgLiquidSpeed: 0.06,
  bgLiquidDispersion: 0.02,
}

export const USER_PRESET_KEY = 'dsh.ui-liquid-glass.user_preset'

export interface LiquidGlassRowState extends LiquidGlassSettings {
  revision: number
}

export interface LiquidGlassSettingsPayload extends LiquidGlassSettings {}

type LiquidGlassRowActions = {
  sync: (draft: LiquidGlassRowState, next: LiquidGlassSettingsPayload, revision: number) => void
}

export function createLiquidGlassRowStore(): EngineStoreHandle<LiquidGlassRowState, LiquidGlassRowActions> {
  return defineStore({
    init: () => ({ ...LIQUID_GLASS_DEFAULTS, revision: -1 }),
    actions: {
      sync: (draft, next, revision) => {
        if (revision <= draft.revision) return
        Object.assign(draft, next)
        draft.revision = revision
      },
    },
  })
}
