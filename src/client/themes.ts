/**
 * Local Dream Skin presets: three Codex-Dream-Skin built-ins plus three curated
 * community picks, all mapped onto the DSW alias tokens with locally embedded
 * wallpapers (no network). State colors (error/success/warn) intentionally stay
 * on the base palette so system semantics remain legible in every skin.
 */
import type { ThemeDefinition, ThemeTokens } from '@deepseek-ai/dsh-client-ui-theme/client'
import { WALLPAPERS, type Wallpaper } from './wallpapers.ts'
import { DEFAULT_SCRIM_STRENGTH } from '../dream-settings.ts'

/** Dream Skin palette: the ten colors the source themes declare. */
export interface DreamSkinPalette {
  background: string
  panel: string
  panelAlt: string
  accent: string
  accentAlt: string
  secondary: string
  highlight: string
  text: string
  muted: string
  line: string
}

/** Convert a hex color to rgba with the given alpha; non-hex values pass through. */
function hexToRgba(color: string, alpha: number): string {
  const hex = /^#([0-9a-fA-F]{6})/.exec(color)?.[1]
  if (hex === undefined) return color
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Build the wallpaper background CSS: a left-to-right readability scrim over
 * the wallpaper, focused by the wallpaper's own focus point. Strength is
 * 0 (no scrim, wallpaper fully visible) to 1 (full default scrim).
 */
export function buildScrim(p: DreamSkinPalette, wallpaper: Wallpaper, strength: number): string {
  const s = Math.max(0, Math.min(1, strength))
  // 基础遮罩下限：即使 strength 为 0，左侧文字区也保留一层遮罩保证可读。
  const a1 = Math.min(0.95, 0.72 * s + 0.18)
  const a2 = Math.min(0.9, 0.42 * s + 0.14)
  const a3 = 0.06 * s + 0.08
  return `linear-gradient(90deg, ${hexToRgba(p.background, a1)} 0%, ${hexToRgba(p.background, a2)} 38%, ${hexToRgba(p.background, a3)} 66%, transparent 84%), url("${wallpaper.url}") ${Math.round(wallpaper.focusX * 100)}% ${Math.round(wallpaper.focusY * 100)}% / cover no-repeat`
}

/** Build the alias tokens for a palette, folding in the wallpaper when given. */
function tokensFor(p: DreamSkinPalette, wallpaper: Wallpaper | undefined): ThemeTokens {
  const base = wallpaper !== undefined ? buildScrim(p, wallpaper, DEFAULT_SCRIM_STRENGTH) : p.background
  return {
    '--dsw-alias-bg-base': base,
    '--dsw-alias-bg-layer-1': p.panel,
    '--dsw-alias-bg-layer-2': p.panelAlt,
    '--dsw-alias-bg-overlay': p.panelAlt,
    '--dsw-alias-border-l1': p.line,
    '--dsw-alias-border-l2': p.line,
    '--dsw-alias-brand-primary': p.accent,
    '--dsw-alias-label-primary': p.text,
    '--dsw-alias-label-secondary': p.muted,
    '--dsw-specific-sidebar-fill': p.panel,
  }
}

/** Build a full theme definition from a palette and an optional wallpaper (custom themes). */
export function buildThemeDefinition(
  id: string,
  colorScheme: 'light' | 'dark',
  p: DreamSkinPalette,
  wallpaper?: Wallpaper,
): ThemeDefinition {
  return Object.freeze({ id, colorScheme, tokens: Object.freeze(tokensFor(p, wallpaper)) })
}

/** Map a shipped preset onto its alias tokens. */
function toTokens(id: string, p: DreamSkinPalette): ThemeTokens {
  return tokensFor(p, WALLPAPERS[id])
}

/** One selectable Dream Skin preset. */
export interface DreamSkinPreset {
  /** theme id (the setTheme argument). */
  id: string
  /** User-facing label. */
  label: string
  /** Registered theme definition. */
  definition: ThemeDefinition
  /** Preview swatches: background, accent, text. */
  swatches: readonly string[]
  /** Wallpaper metadata when this preset ships a background image. */
  wallpaper?: Wallpaper
  /** Original palette, for dynamic scrim rebuilds. */
  palette: DreamSkinPalette
}

function preset(id: string, label: string, colorScheme: 'light' | 'dark', palette: DreamSkinPalette): DreamSkinPreset {
  return {
    id,
    label,
    definition: Object.freeze({
      id,
      colorScheme,
      tokens: Object.freeze(toTokens(id, palette)),
    }),
    swatches: Object.freeze([palette.background, palette.accent, palette.text]),
    ...(WALLPAPERS[id] === undefined ? {} : { wallpaper: WALLPAPERS[id] }),
    palette,
  }
}

/** Shipped local presets, in display order. */
export const DREAM_SKIN_PRESETS: readonly DreamSkinPreset[] = Object.freeze([
  // ── 内置 ──
  preset('dream-codex', 'Codex 榛樿鏆楄壊', 'dark', {
    background: '#111318',
    panel: '#191c22',
    panelAlt: '#20242b',
    accent: '#8298a3',
    accentAlt: '#a0adb3',
    secondary: '#8da397',
    highlight: '#9d94a3',
    text: '#edf0f1',
    muted: '#a3aaae',
    line: 'rgba(130, 152, 163, .24)',
  }),
  preset('dream-gothic', 'Gothic Void Crusade', 'dark', {
    background: '#0d0d0e',
    panel: '#171513',
    panelAlt: '#211d18',
    accent: '#c8a55a',
    accentAlt: '#e3c27a',
    secondary: '#74352e',
    highlight: '#8a2f27',
    text: '#f3ead7',
    muted: '#b5a386',
    line: 'rgba(200, 165, 90, .28)',
  }),
  preset('dream-arina', '妗ユ湰鏈夎彍 路 鏌斿厜鐜懓', 'dark', {
    background: '#1a1216',
    panel: '#241a1e',
    panelAlt: '#2e2026',
    accent: '#e08aa0',
    accentAlt: '#f0b3c4',
    secondary: '#a86a7a',
    highlight: '#d4728a',
    text: '#f7eef0',
    muted: '#c3aab0',
    line: 'rgba(224, 138, 160, .28)',
  }),
  // ── dreamskin.cc 社区（下载前 30）──
  preset('morning-mist', '晨雾山水', 'light', {
    background: '#f2eee5',
    panel: '#fbf9f3',
    panelAlt: '#e8e2d6',
    accent: '#66776f',
    accentAlt: '#87968e',
    secondary: '#a88f5b',
    highlight: '#4f6259',
    text: '#272b28',
    muted: '#747971',
    line: 'rgba(102, 119, 111, 0.28)',
  }),
  preset('cecilylove002', '休闲室内居家', 'dark', {
    background: '#131313',
    panel: '#1e1e1e55',
    panelAlt: '#2a2a2a',
    accent: '#4b75a6',
    accentAlt: '#6488b2',
    secondary: '#b9a788',
    highlight: '#7898bc',
    text: '#f0f0f0',
    muted: '#939393',
    line: '#3f3f3f',
  }),
  preset('lucy-moon', '露西', 'dark', {
    background: '#131214',
    panel: '#1d1d1e',
    panelAlt: '#29292b',
    accent: '#23eaee',
    accentAlt: '#42edf0',
    secondary: '#dacf3b',
    highlight: '#5aeff2',
    text: '#efeff0',
    muted: '#939294',
    line: '#3f3e40',
  }),
  preset('moonlit-pine', '月下松岚', 'dark', {
    background: '#0c1118',
    panel: '#151c25',
    panelAlt: '#202a35',
    accent: '#8095a5',
    accentAlt: '#a4b4c0',
    secondary: '#687f73',
    highlight: '#a4afb5',
    text: '#edf1f3',
    muted: '#9aa5ad',
    line: 'rgba(128, 149, 165, 0.30)',
  }),
  preset('wukong', '悟空（WUKONG）', 'dark', {
    background: '#131313',
    panel: '#1d1e1d',
    panelAlt: '#2a2a2a',
    accent: '#f6c696',
    accentAlt: '#f7cea5',
    secondary: '#2c7c95',
    highlight: '#f8d4b0',
    text: '#f0f0f0',
    muted: '#939393',
    line: '#3f3f3f',
  }),
  preset('dreamskin-2560x1440', '保险柜 办公室 卡通 DreamSkin 2560x1440', 'dark', {
    background: '#131313',
    panel: '#1e1e1d',
    panelAlt: '#2b2b2a',
    accent: '#d04f37',
    accentAlt: '#d76853',
    secondary: '#bcd08d',
    highlight: '#dc7b69',
    text: '#f0f0ef',
    muted: '#939393',
    line: '#3f3f3f',
  }),
  preset('deepseek', 'DeepSeek-鲸鱼娘', 'light', {
    background: '#bd9999',
    panel: '#abb4cf',
    panelAlt: '#c3cee4',
    accent: '#7a4e29',
    accentAlt: '#ceb683',
    secondary: '#85c1cc',
    highlight: '#455b78',
    text: '#352970',
    muted: '#030303',
    line: '#d3d3d4',
  }),
  preset('mikuu-full-background', 'mikuu full background', 'light', {
    background: '#f5f6f7',
    panel: '#ffffff',
    panelAlt: '#e7e9eb',
    accent: '#0e8fbf',
    accentAlt: '#0c7ba4',
    secondary: '#5575d1',
    highlight: '#0b6b8f',
    text: '#191b1f',
    muted: '#68696c',
    line: '#d2d3d4',
  }),
  preset('poster', '三上悠亚', 'light', {
    background: '#f2e5d4',
    panel: '#eed8e3',
    panelAlt: '#eae9e8',
    accent: '#b471c6',
    accentAlt: '#ceb4a1',
    secondary: '#704e35',
    highlight: '#462f3a',
    text: '#43382d',
    muted: '#e8bfd1',
    line: '#d4d3d3',
  }),
  preset('reze', '蕾塞', 'dark', {
    background: '#541d28',
    panel: '#18292a',
    panelAlt: '#2b2a29',
    accent: '#d8d0ca',
    accentAlt: '#7e553a',
    secondary: '#4a7c6f',
    highlight: '#b48d74',
    text: '#f0f0ef',
    muted: '#949392',
    line: '#403f3e',
  }),
  preset('firefly', 'firefly', 'light', {
    background: 'rgba(230, 239, 240, 0.04)',
    panel: 'rgba(189, 204, 209, 0.26)',
    panelAlt: 'rgba(224, 237, 240, 0.68)',
    accent: '#f59e0b',
    accentAlt: '#e63983',
    secondary: '#08a9b9',
    highlight: '#fff0c7',
    text: '#263b42',
    muted: '#4f6971',
    line: 'rgba(78, 121, 131, 0.38)',
  }),
  preset('juzizhoutou', '橘子洲头-毛主席', 'dark', {
    background: '#131313',
    panel: '#1d1d1d',
    panelAlt: '#2a2a2a',
    accent: '#ebb273',
    accentAlt: '#eebd87',
    secondary: '#2a7aa4',
    highlight: '#f0c596',
    text: '#f0f0f0',
    muted: '#939393',
    line: '#3f3f3f',
  }),
  preset('republic', '人民的AI', 'light', {
    background: '#f7f5f5',
    panel: '#fefefe',
    panelAlt: '#ece8e7',
    accent: '#f04a3b',
    accentAlt: '#ce4033',
    secondary: '#dd5c50',
    highlight: '#b4382c',
    text: '#201918',
    muted: '#6d6868',
    line: '#d5d2d2',
  }),
  preset('111', '大肥鱼（8.1）', 'light', {
    background: '#ffffff',
    panel: '#84b4e1',
    panelAlt: '#7da2d9',
    accent: '#405377',
    accentAlt: '#2e74ff',
    secondary: '#35589c',
    highlight: '#2a4d92',
    text: '#000000',
    muted: '#65676c',
    line: '#d2d3d5',
  }),
  preset('quiet-orbit', '寂静星轨', 'dark', {
    background: '#070d20',
    panel: '#0d1630',
    panelAlt: '#151f3c',
    accent: '#758df5',
    accentAlt: '#9b83e9',
    secondary: '#55b6e8',
    highlight: '#a7b8ff',
    text: '#f0f3ff',
    muted: '#98a5c6',
    line: 'rgba(117, 141, 245, 0.28)',
  }),
  preset('123456', '芙宁娜 小白袜', 'light', {
    background: '#f6f6f6',
    panel: '#fefefe',
    panelAlt: '#e9e9e9',
    accent: '#308cca',
    accentAlt: '#2978ae',
    secondary: '#a67d66',
    highlight: '#0099ff',
    text: '#000000',
    muted: '#696969',
    line: '#80c8ff',
  }),
  preset('idea-engine', '灵感小宇宙', 'light', {
    background: '#f1faf8',
    panel: '#ffffff',
    panelAlt: '#e2f3f0',
    accent: '#2dbdb7',
    accentAlt: '#f0c928',
    secondary: '#53a9df',
    highlight: '#ef7064',
    text: '#173033',
    muted: '#567a77',
    line: '#2dbdb7',
  }),
  preset('forest', '安静氛围 森林', 'dark', {
    background: '#131412',
    panel: '#1d1e1c',
    panelAlt: '#292c29',
    accent: '#ca9055',
    accentAlt: '#d1a06d',
    secondary: '#308351',
    highlight: '#d7ac80',
    text: '#eff0ef',
    muted: '#939492',
    line: '#3f403e',
  }),
  preset('violet-evergarden', 'Cyber · 紫罗兰永恒花园 · Violet Evergarden', 'dark', {
    background: '#34323e',
    panel: '#625F73',
    panelAlt: '#5D5F70',
    accent: '#FBEDF1',
    accentAlt: '#5D676F',
    secondary: '#88E0A1',
    highlight: '#7BAFDD',
    text: '#FFFFFF',
    muted: '#A6A6A6',
    line: '#B5B2D7',
  }),
  preset('claude-eva-warm', 'Claude EVA 暖奶油', 'light', {
    background: '#F4F1EA',
    panel: '#FAF7F0',
    panelAlt: '#EFEAE0',
    accent: '#D97757',
    accentAlt: '#E28C6E',
    secondary: '#8B95A1',
    highlight: '#F5E7DC',
    text: '#3D3A33',
    muted: '#8A8477',
    line: '#E3DCD0',
  }),
  preset('46-morning-4k', '46 morning 4k', 'dark', {
    background: '#131313',
    panel: '#1d1d1d',
    panelAlt: '#2a2a2a',
    accent: '#a46151',
    accentAlt: '#b17769',
    secondary: '#52788b',
    highlight: '#bb897d',
    text: '#f0f0f0',
    muted: '#939393',
    line: '#3f3f3f',
  }),
  preset('cloud-ascent', '云上仙途', 'light', {
    background: '#f1f7f3',
    panel: '#e2eee7',
    panelAlt: '#e2eee7',
    accent: '#69b99a',
    accentAlt: '#9bd8ba',
    secondary: '#73b8c2',
    highlight: '#d9b86c',
    text: '#24332e',
    muted: '#657b73',
    line: '#69b99a',
  }),
  preset('quiet-paper', '清透定制', 'light', {
    background: '#f5f6ee',
    panel: '#e9ede1',
    panelAlt: '#e9ede1',
    accent: '#91a176',
    accentAlt: '#b1bd91',
    secondary: '#c7ceb0',
    highlight: '#6f8057',
    text: '#252a20',
    muted: '#68705d',
    line: '#91a176',
  }),
  preset('miku', 'miku-猛男版', 'light', {
    background: '#a0b9cd',
    panel: '#f8f8f8',
    panelAlt: '#e4e4e4',
    accent: '#9c8c55',
    accentAlt: '#887946',
    secondary: '#b88381',
    highlight: '#7a6c3e',
    text: '#181818',
    muted: '#646464',
    line: '#cbcbcb',
  }),
  preset('jimeng-2026-08-04-5645', '蓬松栗棕色长卷发小美女', 'dark', {
    background: '#131313',
    panel: '#1d1d1d',
    panelAlt: '#2a2a2a',
    accent: '#996c4b',
    accentAlt: '#a78164',
    secondary: '#6c97a9',
    highlight: '#b39178',
    text: '#f0f0f0',
    muted: '#939393',
    line: '#3f3f3f',
  }),
  preset('rainwashed-celadon', '雨过青瓷', 'light', {
    background: '#edf2ee',
    panel: '#f8faf7',
    panelAlt: '#dde8e2',
    accent: '#63877e',
    accentAlt: '#85a39b',
    secondary: '#93a9a1',
    highlight: '#496d65',
    text: '#24312d',
    muted: '#6e7f78',
    line: 'rgba(99, 135, 126, 0.28)',
  }),
  preset('cecilylove003', '好看户外治愈', 'light', {
    background: 'rgba(205, 231, 242, 0)',
    panel: 'rgba(245, 250, 252, 0.25)',
    panelAlt: 'rgba(248, 252, 253, 0.72)',
    accent: '#176b99',
    accentAlt: '#2f83ae',
    secondary: '#55733b',
    highlight: '#0f587d',
    text: '#17323f',
    muted: 'rgba(36, 69, 84, 0.74)',
    line: 'rgba(31, 82, 107, 0.22)',
  }),
  preset('20250906191759-6023-71', '202509061917596371', 'dark', {
    background: '#141213',
    panel: '#1f1c1d',
    panelAlt: '#2d2729',
    accent: '#eb1241',
    accentAlt: '#ee335c',
    secondary: '#9c5c8b',
    highlight: '#f1597b',
    text: '#f1efef',
    muted: '#949293',
    line: '#403e3f',
  }),
  preset('art', 'art', 'dark', {
    background: '#121314',
    panel: '#1c1d1f',
    panelAlt: '#282a2d',
    accent: '#1c75c3',
    accentAlt: '#3c88cb',
    secondary: '#ccb7a5',
    highlight: '#5598d2',
    text: '#eff0f1',
    muted: '#929394',
    line: '#3e3f40',
  }),
  preset('redline-breakout', 'SPIDER-MAN', 'dark', {
    background: '#090808',
    panel: '#151112',
    panelAlt: '#241a1b',
    accent: '#e64835',
    accentAlt: '#ff7566',
    secondary: '#d6cbbd',
    highlight: '#921f24',
    text: '#f5efe5',
    muted: '#b9aea1',
    line: 'rgba(227, 63, 54, 0.30)',
  }),
  // ── 女仆装 ──
  preset('maid-whale', '云鲸纸面 · 女仆装', 'light', {
    background: '#eef4f7',
    panel: '#f7fafb',
    panelAlt: '#e3eef2',
    accent: '#3d7a99',
    accentAlt: '#6ba3c2',
    secondary: '#88b4cd',
    highlight: '#2d5f7a',
    text: '#1d2b33',
    muted: '#6b7c85',
    line: 'rgba(61, 122, 153, 0.25)',
  }),])
