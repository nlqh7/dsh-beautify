/**
 * Dream Skin client plugin: register the shipped color skins on the native
 * theme service, persist the selection + scrim strength to localStorage
 * (browser-local, refresh-safe), apply the scrim as a dynamic token layer,
 * and mount the 外观 section.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the theme service Context merge (ctx.theme) and its events.
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
// Type-only: pulls the settings shell's SlotMap merge (the 'settings.section' entry).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { BoundActions } from '@deepseek-ai/dsh-client-ui-slots'
import type { ThemeSnapshot } from '@deepseek-ai/dsh-client-ui-theme/client'
import { DREAM_SKIN_PRESETS, buildScrim, buildThemeDefinition } from './themes.ts'
import type { DreamSkinPalette } from './themes.ts'
import type { Wallpaper } from './wallpapers.ts'
import { initWallpaperLayer } from './wallpaper-layer.ts'
import { createDreamSkinStore } from './settings-store.ts'
import { DreamSkinSettings } from './DreamSkinSettings.tsx'
import type { CustomThemeInput, DreamSkinInjected } from './DreamSkinSettings.tsx'
import { DEFAULT_SCRIM_STRENGTH } from '../dream-settings.ts'

/** Required services: theme registry and the slot system. */
export const inject = ['theme', 'slots']

/** Renders nothing: ui-theme's appearance row is superseded by the 外观 section. */
const HiddenAppearanceRow = (): null => null

/** localStorage key for the persisted appearance prefs. */
const STORAGE_KEY = 'dsh-beautify:prefs'

/** Persisted appearance state (browser-local, refresh-safe). */
interface StoredPrefs {
  themeId: string
  scrimStrength: number
  customTheme?: CustomThemeInput
}

/** Read persisted prefs, falling back to defaults on malformed or missing data. */
function readPrefs(): StoredPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return { themeId: 'system', scrimStrength: DEFAULT_SCRIM_STRENGTH }
    const parsed = JSON.parse(raw) as Partial<StoredPrefs>
    return {
      themeId: typeof parsed.themeId === 'string' ? parsed.themeId : 'system',
      scrimStrength: typeof parsed.scrimStrength === 'number'
        ? parsed.scrimStrength
        : DEFAULT_SCRIM_STRENGTH,
      ...(parsed.customTheme === undefined ? {} : { customTheme: parsed.customTheme }),
    }
  } catch {
    return { themeId: 'system', scrimStrength: DEFAULT_SCRIM_STRENGTH }
  }
}

/** Persist appearance prefs. */
function writePrefs(prefs: StoredPrefs): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

/**
 * Register every Dream Skin preset, restore persisted state, and mount the
 * 外观 switching section.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx: ClientContext): void {
  initWallpaperLayer(ctx)
  ctx.effect(() => {
    const disposers = DREAM_SKIN_PRESETS.map((preset) => ctx.theme.register(preset.definition))
    return () => { for (const dispose of disposers) dispose() }
  })

  const store = createDreamSkinStore()
  let bound: BoundActions<typeof store> | undefined
  let scrimDispose: (() => void) | undefined
  let customDispose: (() => void) | undefined

  // Rebuild the wallpaper scrim layer from the given strength.
  const applyScrim = (strength: number): void => {
    scrimDispose?.()
    scrimDispose = undefined
    const theme = ctx.theme.getTheme()
    const preset = DREAM_SKIN_PRESETS.find((p) => p.id === theme.preference)
    bound?.syncScrim(strength)
    if (preset?.wallpaper === undefined || strength >= 0.98) return
    const bg = buildScrim(preset.palette, preset.wallpaper, strength)
    scrimDispose = ctx.theme.overrideTokens('scrim', {
      '--dsw-alias-bg-base': { light: bg, dark: bg },
    })
  }

  // Register (or refresh) the user's custom theme.
  const applyCustomTheme = (custom: CustomThemeInput | undefined): void => {
    customDispose?.()
    customDispose = undefined
    if (custom === undefined || custom.wallpaperUrl === '') return
    const palette: DreamSkinPalette = {
      background: custom.background,
      panel: custom.background,
      panelAlt: custom.background,
      accent: custom.accent,
      accentAlt: custom.accent,
      secondary: custom.accent,
      highlight: custom.accent,
      text: custom.text,
      muted: custom.text,
      line: custom.accent,
    }
    const wallpaper: Wallpaper = { url: custom.wallpaperUrl, focusX: 0.5, focusY: 0.5 }
    customDispose = ctx.theme.register(buildThemeDefinition('custom', 'dark', palette, wallpaper))
  }

  // Restore persisted state: custom theme first, then the selection.
  const prefs = readPrefs()
  console.log('[dsh-beautify] restore prefs:', JSON.stringify(prefs), '| ls:', localStorage.getItem(STORAGE_KEY))
  applyCustomTheme(prefs.customTheme)
  if (prefs.themeId !== 'system') {
    const registered = ctx.theme.getTheme().themes.some((theme) => theme.id === prefs.themeId)
    if (registered) ctx.theme.setTheme(prefs.themeId)
  }
  applyScrim(prefs.scrimStrength)

  // Theme switch: mirror the preference and re-apply the scrim to the new theme.
  ctx.on('theme/change', (snapshot: ThemeSnapshot) => {
    bound?.syncPreference(snapshot.preference, snapshot.revision)
    applyScrim(readPrefs().scrimStrength)
  })

  const injected = (actions: BoundActions<typeof store>): DreamSkinInjected => {
    bound = actions
    // Re-sync from the getter so no event is lost between registration and
    // first render (the store's revision guard drops stale duplicates).
    const snapshot = ctx.theme.getTheme()
    bound.syncPreference(snapshot.preference, snapshot.revision)
    bound.syncScrim(readPrefs().scrimStrength)
    return {
      presets: DREAM_SKIN_PRESETS,
      select: (id: string) => {
        console.log('[dsh-beautify] select', id)
        ctx.theme.setTheme(id)
        const next = readPrefs()
        next.themeId = id
        writePrefs(next)
        console.log('[dsh-beautify] localStorage readback:', localStorage.getItem(STORAGE_KEY))
      },
      setScrimStrength: (value: number) => {
        const next = readPrefs()
        next.scrimStrength = value
        writePrefs(next)
        applyScrim(value)
      },
      saveCustomTheme: (custom: CustomThemeInput) => {
        const next = readPrefs()
        next.customTheme = custom
        next.themeId = 'custom'
        writePrefs(next)
        applyCustomTheme(custom)
        ctx.theme.setTheme('custom')
      },
    }
  }

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'dream-skin',
    order: 25,
    label: '外观',
    store,
    inject: injected,
  }, DreamSkinSettings))

  // Shadow ui-theme's appearance row: light/dark/system + themes now live in
  // the 外观 section, so the General row would be a duplicate.
  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'appearance',
    order: 10,
    priority: -1,
  }, HiddenAppearanceRow))
}
