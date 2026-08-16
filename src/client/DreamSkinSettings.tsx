/**
 * Dream Skin settings section: the shipped presets as cards with preview
 * swatches, plus a "follow system" reset. Selection reads the persisted
 * preference (never the resolved active theme) and writes through the injected
 * select callback.
 */
import type { InjectFace, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { createDreamSkinStore } from './settings-store.ts'
import type { DreamSkinPreset } from './themes.ts'
import css from './DreamSkinSettings.module.css'

/** Registration-side business face: the roster and the theme write. */
export interface DreamSkinInjected {
  /** Shipped presets in display order. */
  presets: readonly DreamSkinPreset[]
  /** Switch the theme preference to a preset id, or `system` to reset. */
  select: (id: string) => void
}

/** Full component props. */
export type DreamSkinSettingsProps =
  PropsRuntime<'settings.section'>
  & PropsStore<ReturnType<typeof createDreamSkinStore>>
  & InjectFace<DreamSkinInjected>

/** Preference ids that mean "not a Dream Skin preset". */
const DEFAULT_IDS = new Set(['system', 'light', 'dark'])

/**
 * Render the Dream Skin settings section.
 * @param props - composed slot props.
 * @returns the section element tree.
 */
export function DreamSkinSettings({ useStore, presets, select }: DreamSkinSettingsProps) {
  const preference = useStore(s => s.preference)
  const isDefault = DEFAULT_IDS.has(preference)
  return (
    <div className={css.root}>
      <div className={css.hint}>选择一套 Dream Skin 主题，点击即应用。</div>
      <button
        type="button"
        className={isDefault ? `${css.card} ${css.selected}` : css.card}
        aria-pressed={isDefault}
        onClick={() => { select('system') }}
      >
        <span className={css.swatchRow}>
          <span
            className={css.swatch}
            style={{ background: 'transparent', border: '1px dashed var(--dsw-alias-label-secondary)' }}
          />
        </span>
        跟随系统
      </button>
      {presets.map((p) => {
        const selected = preference === p.id
        return (
          <button
            key={p.id}
            type="button"
            className={selected ? `${css.card} ${css.selected}` : css.card}
            aria-pressed={selected}
            onClick={() => { select(p.id) }}
          >
            <span className={css.swatchRow}>
              {p.swatches.map((color) => (
                <span key={color} className={css.swatch} style={{ background: color }} />
              ))}
            </span>
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
