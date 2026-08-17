/**
 * 外观（Appearance）settings section: 明暗模式切换 + 本地主题网格 + 壁纸遮罩
 * 强度滑块 + 自定义主题，悬停预览壁纸。选择写入持久化 settings。
 */
import { useState } from 'react'
import type { InjectFace, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { createDreamSkinStore } from './settings-store.ts'
import type { DreamSkinPreset } from './themes.ts'
import { Button, Slider } from './ui/index.ts'
import css from './DreamSkinSettings.module.css'

/** Custom-theme form shape persisted to the settings document. */
export interface CustomThemeInput {
  /** Wallpaper image URL (data URI or http(s)). */
  wallpaperUrl: string
  /** Accent (brand) color. */
  accent: string
  /** Background color. */
  background: string
  /** Text color. */
  text: string
}

/** Registration-side business face: the roster, theme write, scrim write, custom write. */
export interface DreamSkinInjected {
  /** Shipped presets in display order. */
  presets: readonly DreamSkinPreset[]
  /** Switch the theme preference to a preset id, a built-in mode, or `system`. */
  select: (id: string) => void
  /** Persist the wallpaper scrim strength (0..1). */
  setScrimStrength: (value: number) => void
  /** Persist the custom theme and apply it. */
  saveCustomTheme: (custom: CustomThemeInput) => void
}

/** Full component props. */
export type DreamSkinSettingsProps =
  PropsRuntime<'settings.section'>
  & PropsStore<ReturnType<typeof createDreamSkinStore>>
  & InjectFace<DreamSkinInjected>

/** Built-in light/dark/system modes shown above the theme grid. */
const MODES: readonly { id: string; label: string }[] = [
  { id: 'system', label: '跟随系统' },
  { id: 'light', label: '浅色' },
  { id: 'dark', label: '深色' },
]

/** Lucide-style palette icon. */
function PaletteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22a10 10 0 1 1 10-10c0 1.7-1.3 3-3 3h-2.5a2.5 2.5 0 0 0-2.5 2.5c0 .7.3 1.3.7 1.7.4.4.6.9.6 1.4A1.4 1.4 0 0 1 12 22z" />
      <circle cx="7.5" cy="11.5" r="1.5" />
      <circle cx="11" cy="7.5" r="1.5" />
      <circle cx="15.5" cy="8.5" r="1.5" />
    </svg>
  )
}

/**
 * Render the appearance settings section.
 * @param props - composed slot props.
 * @returns the section element tree.
 */
export function DreamSkinSettings({
  useStore, presets, select, setScrimStrength, saveCustomTheme,
}: DreamSkinSettingsProps) {
  const preference = useStore(s => s.preference)
  const scrimStrength = useStore(s => s.scrimStrength)
  const [hovered, setHovered] = useState<string | null>(null)
  const [custom, setCustom] = useState<CustomThemeInput>({
    wallpaperUrl: '',
    accent: '#c8a55a',
    background: '#111318',
    text: '#f0f0f0',
  })
  const hoveredPreset = hovered === null
    ? undefined
    : presets.find(p => p.id === hovered && p.wallpaper !== undefined)
  return (
    <div className={css.root}>
      <div className={css.header}>
        <PaletteIcon />
        <span>外观</span>
      </div>
      <div className={css.section}>
        <div className={css.sectionTitle}>明暗模式</div>
        <div className={css.modeRow}>
          {MODES.map((mode) => {
            const selected = preference === mode.id
            return (
              <button
                key={mode.id}
                type="button"
                className={selected ? `${css.modeButton} ${css.selected}` : css.modeButton}
                aria-pressed={selected}
                onClick={() => { select(mode.id) }}
              >
                {mode.label}
              </button>
            )
          })}
        </div>
      </div>
      <div className={css.section}>
        <div className={css.sectionTitle}>主题</div>
        <div className={css.grid}>
          {presets.map((p) => {
            const selected = preference === p.id
            const style = p.wallpaper !== undefined
              ? {
                backgroundImage: `url("${p.wallpaper.url}")`,
                backgroundSize: 'cover',
                backgroundPosition: `${Math.round(p.wallpaper.focusX * 100)}% ${Math.round(p.wallpaper.focusY * 100)}%`,
              }
              : { background: `linear-gradient(135deg, ${p.swatches[0]}, ${p.swatches[1]})` }
            return (
              <button
                key={p.id}
                type="button"
                className={selected ? `${css.tile} ${css.selected}` : css.tile}
                aria-pressed={selected}
                onClick={() => { select(p.id) }}
                onMouseEnter={() => { setHovered(p.id) }}
                onMouseLeave={() => { setHovered(null) }}
              >
                <span className={css.tilePreview} style={style} />
                <span className={css.tileLabel}>{p.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className={css.section}>
        <div className={css.sectionTitle}>细节</div>
        <Slider label="壁纸遮罩强度" value={scrimStrength} onChange={setScrimStrength} />
      </div>
      <div className={css.section}>
        <div className={css.sectionTitle}>自定义主题</div>
        <input
          className={css.textInput}
          type="text"
          placeholder="壁纸 URL（https:// 或 data:image/...）"
          value={custom.wallpaperUrl}
          onChange={(e) => { setCustom(c => ({ ...c, wallpaperUrl: e.target.value })) }}
        />
        <div className={css.colorRow}>
          <label className={css.colorField}>
            强调
            <input type="color" value={custom.accent} onChange={(e) => { setCustom(c => ({ ...c, accent: e.target.value })) }} />
          </label>
          <label className={css.colorField}>
            背景
            <input type="color" value={custom.background} onChange={(e) => { setCustom(c => ({ ...c, background: e.target.value })) }} />
          </label>
          <label className={css.colorField}>
            文字
            <input type="color" value={custom.text} onChange={(e) => { setCustom(c => ({ ...c, text: e.target.value })) }} />
          </label>
        </div>
        <Button onClick={() => { saveCustomTheme(custom) }}>应用自定义主题</Button>
      </div>
      {hoveredPreset?.wallpaper !== undefined && (
        <div className={css.preview}>
          <img src={hoveredPreset.wallpaper.url} alt="" draggable={false} />
        </div>
      )}
    </div>
  )
}
