/**
 * Night-variant companions for shipped wallpapers.
 *
 * Why this table exists
 *   A preset's wallpaper is resolved once at module load (`themes.ts`
 *   `wallpaperFor`) and then frozen into the theme definition, but the *visible*
 *   backdrop of a preset is the value `applySkin` writes into
 *   `--dsw-alias-bg-base`. That token is computed only when the theme changes,
 *   so a preset whose palette is static while its artwork is not had no way to
 *   follow the host's dark appearance: the maid-atelier skin wrote the night
 *   palace to `body.background-image` (correctly), but the light-palace scrim on
 *   `--dsw-alias-bg-base` kept painting over it — 36% of the screen stayed
 *   bright in dark mode (measured: magenta-swap probe, `maid-dark-backdrop.json`).
 *
 *   Splitting the night art out keeps `WALLPAPERS` (the table the picker and
 *   the preset definitions read) byte-identical, and gives `wallpaperForMode`
 *   one place to look for an appearance-specific source.
 *
 * Deliberately NOT a full parallel table: an id ships a night variant only when
 * someone actually drew one. Anything missing here falls back to `WALLPAPERS`.
 */
import { MAID_ATELIER_PALACE_DARK } from './maid-art/maid-atelier-background-art.generated.ts'
import type { Wallpaper } from './wallpapers.ts'

/** Wallpaper overrides used while the host is in dark appearance. */
export const WALLPAPERS_DARK: Record<string, Wallpaper> = {
  'maid-atelier': { url: MAID_ATELIER_PALACE_DARK, focusX: 0.5, focusY: 0.5 },
}
