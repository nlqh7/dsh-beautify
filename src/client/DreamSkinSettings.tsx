/**
 * 外观（Appearance）settings section: 明暗模式切换 + 本地主题网格 + 壁纸遮罩
 * 强度滑块 + 自定义主题，悬停预览壁纸。选择写入持久化 settings。
 */
import { useEffect, useState, type ChangeEvent } from 'react'
import type { InjectFace, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { createDreamSkinStore } from './settings-store.ts'
import { type DreamSkinPreset, type WallpaperKnobs } from './themes.ts'
import { CURSOR_UPLOAD_STATES, readCursorUploads, type CursorSkinId } from './cursor-images.ts'
import { Button, Knob, Modal, Segmented } from './ui/index.ts'
import { DEFAULT_SCRIM_STRENGTH } from '../dream-settings.ts'
import { readGlass, readWallpaper, setGlass, setWeEffect, useStore as useWallpaperStore, applySelection, loadInventory } from './wallpaper-layer.ts'
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
  /** Panel surface color; falls back to the background when unset. */
  panel?: string
  /** Elevated panel surface color; falls back to the background when unset. */
  panelAlt?: string
  /** Secondary text color; falls back to the text when unset. */
  muted?: string
  /** Hairline/border color; falls back to the accent when unset. */
  line?: string
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
  /** Merge global wallpaper knobs and re-apply the current skin. */
  tweak: (partial: Partial<WallpaperKnobs>) => void
  /** Reset the global wallpaper knobs to defaults. */
  resetTweak: () => void
  /** Master switch for the whale cursor; off = native OS cursor. */
  setCursorEnabled: (on: boolean) => void
  /** Persist and apply the whale-cursor art skin (whale / custom). */
  setCursorSkin: (id: CursorSkinId) => void
  /** Persist and apply the whale-cursor render size (px, 24..64). */
  setCursorSize: (px: number) => void
  /** Save (or remove with null) a user-uploaded cursor image for one state. */
  saveCursorUpload: (state: string, dataUrl: string | null) => void
  /** Toggle the whale cursor between one regular sprite and per-target states. */
  /** Always-on per-target state detection (auto-switch); per-state art toggles below. */
  setCursorStateOverride: (state: string, on: boolean) => void
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

/** Wallpaper Engine control block: pick a wallpaper in a modal; tuning lives in 美化参数. */
function WallpaperEngineBlock() {
  const sel = useWallpaperStore() as {
    id: string
    loaded: boolean
    wallpaperBlur: number
    scrim: number
    inventory: { wallpapers: Array<{ id: string; title: string; playable: boolean; preview: string | null }>; error: unknown }
  }
  const [open, setOpen] = useState(false)
  const wallpapers = Array.isArray(sel.inventory.wallpapers) ? sel.inventory.wallpapers.filter(w => w.playable) : []
  const openPicker = (): void => {
    if (!sel.loaded) void loadInventory()
    setOpen(true)
  }
  return (
    <div className={css.section}>
      <button
        type="button"
        className={css.groupHeader}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openPicker}
      >
        <span className={css.groupHeaderText}>壁纸引擎（Wallpaper Engine）</span>
        <span className={css.groupHeaderActions}>
          <span className={css.groupCount}>{wallpapers.length} 张</span>
          <span className={css.groupGo}>选择</span>
        </span>
      </button>
      <Modal open={open} title="壁纸引擎" onClose={() => { setOpen(false) }} className={css.pickerModal}>
        {sel.inventory.error
          ? <div className={css.hint}>{String(sel.inventory.error)}</div>
          : !sel.loaded
            ? <div className={css.hint}>扫描中…</div>
            : (
              <>
                <div className={css.weGrid}>
                  {wallpapers.map(w => (
                    <button
                      key={w.id}
                      type="button"
                      className={sel.id === w.id ? `${css.weTile} ${css.selected}` : css.weTile}
                      aria-pressed={sel.id === w.id}
                      onClick={() => { applySelection(w.id) }}
                      title={w.title}
                    >
                      {w.preview
                        ? <img className={css.weTileImage} src={w.preview} alt={w.title} loading="lazy" />
                        : <span className={css.weTileNoPreview}>{w.title}</span>}
                      <span className={css.weTileLabel}>{w.title}</span>
                    </button>
                  ))}
                </div>
                <Button onClick={() => { loadInventory() }}>刷新</Button>
              </>
            )}
      </Modal>
    </div>
  )
}

/**
 * Theme-tile grid for one group of presets.
 * @param presets - the presets to render.
 * @param preference - the currently selected theme id.
 * @param select - switch-theme callback.
 * @returns the tile grid JSX.
 */
function themeTiles(
  presets: readonly DreamSkinPreset[],
  preference: string | null,
  select: (id: string) => void,
) {
  return (
    <div className={css.grid}>
      {presets.map((p) => {
        const selected = preference === p.id
        const style = p.wallpaper !== undefined
          ? {
            backgroundImage: `url("${p.wallpaper.thumb ?? p.wallpaper.url}")`,
            backgroundSize: 'cover',
            backgroundPosition: `${Math.round(p.wallpaper.focusX * 100)}% ${Math.round(p.wallpaper.focusY * 100)}%`,
          }
          : undefined
        return (
          <button
            key={p.id}
            type="button"
            className={selected ? `${css.tile} ${css.selected}` : css.tile}
            aria-pressed={selected}
            onClick={() => { select(p.id) }}
          >
            {p.wallpaper !== undefined
              ? (
                <>
                  <span className={css.tilePreview} style={style} />
                  <span className={css.tileLabel}>{p.label}</span>
                </>
              )
              : (
                <span className={css.solidRow}>
                  <span className={css.solidLabel}>{p.label}</span>
                  <span className={css.solidSwatches}>
                    <span className={css.solidSwatch} style={{ background: p.palette.background }} title="背景" />
                    <span className={css.solidSwatch} style={{ background: p.palette.accent }} title="强调" />
                    <span className={css.solidSwatch} style={{ background: p.palette.text }} title="文字" />
                  </span>
                </span>
              )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Wallpaper-theme picker in a centered modal: the wallpaper preset grid opens
 * on demand (not on settings open), so the settings section stays light and
 * the full-size wallpaper images are only decoded while the modal is open.
 * Tiles render the downscaled `thumb`; the full image is applied on select.
 * @param props.presets - the wallpaper presets to show.
 * @param props.preference - the currently selected theme id.
 * @param props.select - switch-theme callback.
 * @returns the section with the modal-trigger row.
 */
function WallpaperThemesPicker({ presets, preference, select }: {
  presets: readonly DreamSkinPreset[]
  preference: string | null
  select: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={css.section}>
      <button
        type="button"
        className={css.groupHeader}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => { setOpen(true) }}
      >
        <span className={css.groupHeaderText}>壁纸主题</span>
        <span className={css.groupHeaderActions}>
          <span className={css.groupCount}>{presets.length} 张</span>
          <span className={css.groupGo}>选择</span>
        </span>
      </button>
      <Modal open={open} title="壁纸主题" onClose={() => { setOpen(false) }} className={css.pickerModal}>
        {themeTiles(presets, preference, (id) => { select(id); setOpen(false) })}
      </Modal>
    </div>
  )
}

/**
 * Render the appearance settings section.
 * @param props - composed slot props.
 * @returns the section element tree.
 */

/** One uploadable cursor state row inside the custom-skin section. */
function CursorUploadRow({
  state, label, onSave,
}: {
  state: string
  label: string
  onSave: (state: string, dataUrl: string | null) => void
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(() => readCursorUploads()[state] ?? null)
  const pick = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = String(reader.result)
      setDataUrl(url)
      onSave(state, url)
    }
    reader.readAsDataURL(file)
  }
  const remove = (): void => {
    setDataUrl(null)
    onSave(state, null)
  }
  return (
    <div className={css.uploadRow}>
      <span className={css.uploadLabel}>{label}</span>
      {dataUrl !== null && (
        <img className={css.uploadThumb} src={dataUrl} alt={label} />
      )}
      <label className={css.uploadBtn}>
        选择图片
        <input type="file" accept="image/png,image/webp,image/jpeg" hidden onChange={pick} />
      </label>
      {dataUrl !== null && (
        <Button onClick={remove}>移除</Button>
      )}
    </div>
  )
}

export function DreamSkinSettings({
  useStore, presets, select, saveCustomTheme, tweak, resetTweak: resetTweakFn, setCursorEnabled, setCursorSkin, setCursorSize, saveCursorUpload, setCursorStateOverride,
}: DreamSkinSettingsProps) {
  const preference = useStore(s => s.preference)
  const cursorEnabled = useStore(s => s.cursorEnabled)
  const cursorSkin = useStore(s => s.cursorSkin)
  const cursorSize = useStore(s => s.cursorSize)
  const cursorStateOverrides = useStore(s => s.cursorStateOverrides)
  const sel = useWallpaperStore()
  // Host-side feature health (wallpaper engine / balance whale), shown as a
  // visible notice when something failed to mount.
  const [featureStatus, setFeatureStatus] = useState<Record<string, { ok: boolean; reason?: string }> | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch('/dsh-beautify/status.json', { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : null))
      .then((data: Record<string, { ok: boolean; reason?: string }> | null) => {
        if (!cancelled) setFeatureStatus(data)
      })
      .catch(() => { /* status endpoint optional; skip silently */ })
    return () => { cancelled = true }
  }, [])
  const failedFeatures = featureStatus === null
    ? []
    : Object.entries(featureStatus).filter(([, s]) => !s.ok)
  const [showParams, setShowParams] = useState(false)
  const [showCursor, setShowCursor] = useState(false)
  // 液态玻璃皮肤（vendored 自 liquid-glass-theme）：独立 localStorage + 窗口事件，
  // 与 apply 里的 initLiquidGlass 联动（不经过主题 store）。档位：off/lite/standard/ultra
  const [lgLevel, setLgLevel] = useState<'off' | 'lite' | 'standard' | 'ultra'>(() => {
    try {
      const v = localStorage.getItem('dsh-beautify:liquidGlass')
      if (v === 'lite' || v === 'standard' || v === 'ultra') return v
      return 'off'
    } catch { return 'off' }
  })
  const toggleLiquidGlass = (level: 'off' | 'lite' | 'standard' | 'ultra'): void => {
    setLgLevel(level)
    try { localStorage.setItem('dsh-beautify:liquidGlass', level) } catch { /* noop */ }
    try { window.dispatchEvent(new CustomEvent('dsh:liquid-glass-toggle', { detail: { level } })) } catch { /* noop */ }
  }
  const [custom, setCustom] = useState<CustomThemeInput>({
    wallpaperUrl: '',
    accent: '#c8a55a',
    background: '#111318',
    text: '#f0f0f0',
  })
  const [showAdvancedColors, setShowAdvancedColors] = useState(false)
  const wallpaperPresets = presets.filter(p => p.wallpaper !== undefined)
  const solidPresets = presets.filter(p => p.wallpaper === undefined)
  // Per-theme wallpaper tweaks for the currently selected wallpaper preset;
  // defaults are the preset's shipped focus point and a sharp (0px) blur.
  const activePreset = presets.find(p => p.id === preference && p.wallpaper !== undefined)
  const weActive = sel.id !== ''
  const wallpaper = readWallpaper()
  const glass = readGlass()
  const onWallpaper = (partial: Partial<WallpaperKnobs>): void => {
    if (weActive) {
      if (partial.blur !== undefined) setWeEffect('wallpaperBlur', partial.blur)
      if (partial.scrim !== undefined) setWeEffect('scrim', Math.round(partial.scrim * 100))
    }
    tweak(partial)
  }
  return (
    <div className={css.root}>
      <div className={css.header}>
        <PaletteIcon />
        <span>外观</span>
      </div>
      {failedFeatures.length > 0 && (
        <div className={css.statusNotice} role="alert">
          <div className={css.statusNoticeTitle}>部分功能未加载</div>
          {failedFeatures.map(([key, s]) => (
            <div key={key} className={css.statusNoticeRow}>
              <span className={css.statusNoticeName}>
                {key === 'whale' ? '余额小鲸鱼' : key === 'wallpaper' ? '壁纸引擎' : key}
              </span>
              <span className={css.statusNoticeReason}>{s.reason ?? '未知原因'}</span>
            </div>
          ))}
          <div className={css.statusNoticeHint}>可在终端日志中查看详细错误，或修复后重启 dsh。</div>
        </div>
      )}
      <div className={css.section}>
        <div className={css.sectionTitle}>明暗模式</div>
        <Segmented label="明暗模式" value={preference} options={MODES} onSelect={select} />
      </div>
      <div className={css.section}>
        <div className={css.sectionTitle}>纯色主题</div>
        {themeTiles(solidPresets, preference, select)}
      </div>
      <div className={css.section}>
        <div className={css.sectionTitle}>主题（{wallpaperPresets.length}）</div>
        <WallpaperThemesPicker presets={wallpaperPresets} preference={preference} select={select} />
      </div>
      <div className={css.section}>
        <button
          type="button"
          className={css.groupHeader}
          aria-expanded={showCursor}
          onClick={() => { setShowCursor(v => !v) }}
        >
          <span className={css.groupHeaderText}>鼠标光标</span>
          <span className={css.groupHeaderActions}>
            <span className={css.groupCount}>{cursorEnabled ? `${cursorSkin === 'custom' ? '自定义' : '鲸鱼'} · ${cursorSize}px` : '已关闭'}</span>
            <span className={showCursor ? `${css.chevron} ${css.chevronOpen}` : css.chevron} aria-hidden="true">▾</span>
          </span>
        </button>
        <div className={css.collapse} data-open={showCursor}>
          <div className={css.collapseInner}>
            <Segmented
              label="光标美化"
              value={cursorEnabled ? 'on' : 'off'}
              options={[
                { id: 'on', label: '启用' },
                { id: 'off', label: '关闭' },
              ]}
              onSelect={(id) => { setCursorEnabled(id === 'on') }}
            />
            {cursorEnabled && (
              <>
                <Segmented
                  label="光标皮肤"
                  value={cursorSkin}
                  options={[
                    { id: 'whale', label: '鲸鱼' },
                    { id: 'custom', label: '自定义' },
                  ]}
                  onSelect={(id) => { setCursorSkin(id as CursorSkinId) }}
                />
                <div className={css.paramGroup}>
                  <div className={css.paramGroupTitle}>大小</div>
                  <Knob label="光标大小" value={cursorSize} min={24} max={64} step={4} unit="px" onChange={setCursorSize} />
                </div>
                <div className={css.paramGroup}>
                  <div className={css.paramGroupTitle}>状态开关（取消勾选 = 该状态用原光标）</div>
                  {CURSOR_UPLOAD_STATES.map(({ id, label }) => (
                    <label key={id} className={css.cursorStateRow}>
                      <span className={css.cursorStateLabel}>{label}</span>
                      <input
                        type="checkbox"
                        className={css.cursorStateToggle}
                        checked={id === 'drag'
                          ? cursorStateOverrides[id] === true
                          : cursorStateOverrides[id] !== false}
                        onChange={(e) => { setCursorStateOverride(id, e.target.checked) }}
                      />
                    </label>
                  ))}
                  <p className={css.hint}>光标始终按悬停目标自动切换形态；勾选 = 该形态用皮肤，取消 = 保留系统原生光标。「拖动」默认用系统光标（按住抓取/拖动最自然），想要皮肤版可勾上。</p>
                </div>
                {cursorSkin === 'custom' ? (
                  <div className={css.paramGroup}>
                    <div className={css.paramGroupTitle}>自定义图片（未上传的状态用鲸鱼图兜底）</div>
                    {CURSOR_UPLOAD_STATES.map(({ id, label }) => (
                      <CursorUploadRow key={id} state={id} label={label} onSave={saveCursorUpload} />
                    ))}
                  </div>
                ) : (
                  <p className={css.hint}>
                    DeepSeek 鲸鱼光标：跟随鼠标移动，悬停链接/按钮自动换态。
                  </p>
                )}
              </>
            )}
            {!cursorEnabled && (
              <p className={css.hint}>已关闭光标美化，使用系统原生光标。</p>
            )}
          </div>
        </div>
      </div>
      <div className={css.section}>
        <button
          type="button"
          className={css.groupHeader}
          aria-expanded={showParams}
          onClick={() => { setShowParams(v => !v) }}
        >
          <span className={css.groupHeaderText}>美化参数</span>
          <span className={css.groupHeaderActions}>
            <span className={css.groupCount}>玻璃 · 壁纸 · 主题</span>
            <span className={showParams ? `${css.chevron} ${css.chevronOpen}` : css.chevron} aria-hidden="true">▾</span>
          </span>
        </button>
        <div className={css.collapse} data-open={showParams}>
          <div className={css.collapseInner}>
            <div className={css.paramGroup}>
              <div className={css.paramGroupTitle}>液态玻璃</div>
              <Segmented
                label="效果档位"
                value={lgLevel}
                options={[
                  { id: 'off', label: '关闭' },
                  { id: 'lite', label: '轻量' },
                  { id: 'standard', label: '标准' },
                  { id: 'ultra', label: '极致' },
                ]}
                onSelect={(id) => { toggleLiquidGlass(id as 'off' | 'lite' | 'standard' | 'ultra') }}
              />
              <p className={css.hint}>
                WebGL 物理透镜 + 多层毛玻璃（溶入自 liquid-glass-theme，MIT）。
                <br />「档位」：<b>轻量</b>=纯毛玻璃、不跑 WebGL（低配/集显推荐，几乎不卡）；<b>标准</b>=半分辨率透镜 + 30fps；<b>极致</b>=全效果 + 60fps（仅独立显卡）。
                <br />「问题」：标准/极致在低配或集成显卡上仍可能明显掉帧；浏览器禁用 WebGL 时轻量档照常、其余档无透镜效果。
              </p>
            </div>
            <div className={css.paramGroup}>
              <div className={css.paramGroupTitle}>壁纸</div>
              <Knob label="壁纸模糊" value={wallpaper.blur} min={0} max={60} step={1} unit="px" onChange={(v) => { onWallpaper({ blur: v }) }} />
              <Knob label="焦点 · 左右" value={wallpaper.focusX >= 0 ? wallpaper.focusX : (activePreset?.wallpaper?.focusX ?? 0.5)} min={0} max={1} step={0.01} onChange={(v) => { onWallpaper({ focusX: v }) }} />
              <Knob label="焦点 · 上下" value={wallpaper.focusY >= 0 ? wallpaper.focusY : (activePreset?.wallpaper?.focusY ?? 0.5)} min={0} max={1} step={0.01} onChange={(v) => { onWallpaper({ focusY: v }) }} />
              <Knob label="暗化" value={wallpaper.scrim >= 0 ? wallpaper.scrim : DEFAULT_SCRIM_STRENGTH} min={0} max={1} step={0.01} onChange={(v) => { onWallpaper({ scrim: v }) }} />
            </div>
            <div className={css.paramGroup}>
              <div className={css.paramGroupTitle}>玻璃</div>
              <Knob label="玻璃模糊" value={glass.blur} min={0} max={40} step={1} unit="px" onChange={(v) => { setGlass('blur', v) }} />
              <Knob label="玻璃高光" value={glass.highlight} min={0} max={0.8} step={0.01} onChange={(v) => { setGlass('highlight', v) }} />
              <Knob label="玻璃饱和度" value={glass.saturate} min={1} max={3} step={0.05} onChange={(v) => { setGlass('saturate', v) }} />
              <Knob label="边框（壁纸引擎）" value={glass.border} min={0} max={1} step={0.01} onChange={(v) => { setGlass('border', v) }} disabled={!weActive} />
            </div>
            <div className={css.paramGroup}>
              <div className={css.paramGroupTitle}>自定义主题</div>
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
              <button
                type="button"
                className={css.advancedToggle}
                aria-expanded={showAdvancedColors}
                onClick={() => { setShowAdvancedColors(v => !v) }}
              >
                更多颜色（面板 / 边框 / 次级文字）
                <span className={showAdvancedColors ? `${css.chevron} ${css.chevronOpen}` : css.chevron} aria-hidden="true">▾</span>
              </button>
              {showAdvancedColors && (
                <div className={css.colorRow}>
                  <label className={css.colorField}>
                    面板
                    <input type="color" value={custom.panel ?? custom.background} onChange={(e) => { setCustom(c => ({ ...c, panel: e.target.value })) }} />
                  </label>
                  <label className={css.colorField}>
                    面板亮
                    <input type="color" value={custom.panelAlt ?? custom.background} onChange={(e) => { setCustom(c => ({ ...c, panelAlt: e.target.value })) }} />
                  </label>
                  <label className={css.colorField}>
                    次级文字
                    <input type="color" value={custom.muted ?? custom.text} onChange={(e) => { setCustom(c => ({ ...c, muted: e.target.value })) }} />
                  </label>
                  <label className={css.colorField}>
                    边框
                    <input type="color" value={custom.line ?? custom.accent} onChange={(e) => { setCustom(c => ({ ...c, line: e.target.value })) }} />
                  </label>
                </div>
              )}
              <Button onClick={() => { saveCustomTheme(custom) }}>应用自定义主题</Button>
            </div>
            <Button onClick={resetTweakFn}>恢复壁纸参数默认</Button>
          </div>
        </div>
      </div>
      <WallpaperEngineBlock />
    </div>
  )
}
