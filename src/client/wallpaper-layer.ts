// @ts-nocheck — vendored client layer from elysia395/dsh-wallpaper-engine (MIT), kept JS-style for faithful port.
/**
 * dsh-wallpaper-engine — client (browser) half source.
 *
 * CANONICAL source; `scripts/build-client.mjs` emits `lib/client.js`. Edit this
 * file, run `npm run build`. Do not hand-edit `lib/client.js`.
 *
 * The plugin:
 *   1. Fetches the wallpaper inventory from the host half's same-origin route
 *      (GET /wallpaper-engine/inventory). A "刷新" button refetches on demand so
 *      newly downloaded Wallpaper Engine wallpapers appear without a page reload.
 *   2. Renders the selected wallpaper BEHIND the DSH GUI: a `position:fixed;
 *      z-index:-1` child of `document.body`, plus a scrim (darkened overlay). The
 *      app frame + sidebar backgrounds are made transparent so the wallpaper
 *      shows through the whole frame while the scrim keeps text readable.
 *   3. Applies four user-adjustable effects, each with its own slider:
 *      - 壁纸模糊 (wallpaper blur) → `--we-wallpaper-blur`
 *      - 暗化 (scrim strength)      → `--we-scrim-color`
 *      - 边框 (border emphasis)     → `--dsw-alias-border-l1/l2` alpha
 *      - 玻璃 (glass blur on panels)→ `--we-blur` + frosted-glass backgrounds
 *      The "glass" effect turns the opaque conversation surfaces (composer card,
 *      message bubbles, raised panels) into translucent frosted glass backed by
 *      `backdrop-filter`, so the wallpaper shows through them softly.
 *   4. Automatic rotation over USER-DEFINED carousel lists (轮播列表): the user
 *      can create any number of lists, pick wallpapers into each from the
 *      inventory, and give each list its own switch interval and order. Lists
 *      are persisted client-side (localStorage), so rotation never depends on
 *      Wallpaper Engine's own config.json playlist paths. A playable WE
 *      playlist is imported as the first list on first run so the feature
 *      starts working out of the box.
 */

import React from 'react'

const SETTINGS_KEY = "dsh-beautify:we-selection";
const INVENTORY_URL = "/wallpaper-engine/inventory";
// Body attribute set while a wallpaper is active; CSS uses it to make the frame
// background transparent so the behind-body layer shows through.
const ACTIVE_ATTR = "data-we-wallpaper";
const LAYER_ID = "dsh-wallpaper-engine-layer";
const SCRIM_ID = "dsh-wallpaper-engine-scrim";

// ── Defaults ─────────────────────────────────────────────────────────────────
// scrim default is intentionally LOW now: iOS liquid glass needs the wallpaper
// colour to pass through the glass, so we no longer crush it behind a near-black
// scrim. Users can raise it back via the 暗化 slider for busy wallpapers.
const DEFAULTS = {
  scrim: 0.25,
  border: 0.35,
  blur: 24,
  wallpaperBlur: 0,
  rotationEnabled: false,
  rotationInterval: 30,
  rotationGroupId: "",
  rotationGroups: [],
  rotationSeeded: false,
};

// ── Persisted selection ─────────────────────────────────────────────────────
function clampNum(v, lo, hi, fallback) {
  return typeof v === "number" && v >= lo && v <= hi ? v : fallback;
}

// Rotation groups are user-defined carousel lists: each holds a set of
// wallpaper ids picked from the inventory, its own switch interval (minutes),
// and its own playback order. They are fully client-side (localStorage), so
// rotation never depends on Wallpaper Engine's own config.json paths.
function readRotationGroups(raw) {
  if (!Array.isArray(raw)) return [];
  const groups = [];
  for (const g of raw) {
    if (!g || typeof g !== "object") continue;
    const id = typeof g.id === "string" && g.id ? g.id : "";
    if (!id) continue;
    groups.push({
      id,
      name: typeof g.name === "string" && g.name.trim() ? g.name.trim() : "轮播列表",
      interval: clampNum(g.interval, 1, 1440, DEFAULTS.rotationInterval),
      order: g.order === "random" ? "random" : "sequence",
      wallpaperIds: Array.isArray(g.wallpaperIds)
        ? g.wallpaperIds.filter((x) => typeof x === "string" && x)
        : [],
    });
  }
  return groups;
}

function readPersisted() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { id: "", ...DEFAULTS };
    const o = JSON.parse(raw);
    return {
      id: typeof o.id === "string" ? o.id : "",
      scrim: clampNum(o.scrim, 0, 1, DEFAULTS.scrim),
      border: clampNum(o.border, 0, 1, DEFAULTS.border),
      blur: clampNum(o.blur, 0, 40, DEFAULTS.blur),
      wallpaperBlur: clampNum(o.wallpaperBlur, 0, 60, DEFAULTS.wallpaperBlur),
      rotationEnabled: o.rotationEnabled === true,
      rotationGroupId: typeof o.rotationGroupId === "string" ? o.rotationGroupId : "",
      rotationGroups: readRotationGroups(o.rotationGroups),
      rotationSeeded: o.rotationSeeded === true,
    };
  } catch {
    return { id: "", ...DEFAULTS };
  }
}

// ── Shared selection store (React + DOM layer share it) ────────────────────
const selection = {
  ...readPersisted(),
  url: null,
  type: null,
  playing: true,
  loading: false,
  rotationTimer: null,
  // Draft of the rotation group currently being created/edited in the picker
  // (null when the editor is closed). Mutated live; committed on 保存.
  editing: null,
  inventory: { installDir: null, wallpapers: [], total: 0, portableCount: 0, playlists: [], error: null },
  loaded: false,
};

const listeners = new Set();
function emit() { for (const fn of [...listeners]) fn(); }
function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

// ── React hook for the picker UI ────────────────────────────────────────────
export function useStore() {
  const [, setTick] = React.useState(0);
  React.useEffect(() => subscribe(() => setTick((n) => n + 1)), []);
  return selection;
}

function persistSelection() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      id: selection.id,
      scrim: selection.scrim,
      border: selection.border,
      blur: selection.blur,
      wallpaperBlur: selection.wallpaperBlur,
      rotationEnabled: selection.rotationEnabled,
      rotationGroupId: selection.rotationGroupId,
      rotationGroups: selection.rotationGroups,
      rotationSeeded: selection.rotationSeeded,
    }));
  } catch { /* ignore */ }
}

export async function loadInventory() {
  selection.loading = true;
  emit();
  try {
    const res = await fetch(INVENTORY_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("inventory HTTP " + res.status);
    const data = await res.json();
    selection.inventory = {
      installDir: data.installDir,
      wallpapers: data.wallpapers || [],
      total: data.total || 0,
      portableCount: data.portableCount || 0,
      playlists: Array.isArray(data.playlists) ? data.playlists : [],
      error: null,
    };
  } catch (err) {
    selection.inventory = {
      installDir: null,
      wallpapers: [],
      total: 0,
      portableCount: 0,
      playlists: [],
      error: String(err && err.message ? err.message : err),
    };
  }
  selection.loading = false;
  selection.loaded = true;

  // inventory 拉取失败（WE 后端没启动/网络断了/等）时不要清空已持久化的选择
  // —— 否则用户重启页面或开关液态玻璃时，已选的壁纸会被丢掉，"WE 持久化"失效。
  // 仅在**成功拿到清单且里面真的没有**时才清 selection.id。
  if (selection.inventory.error) {
    if (selection.id) {
      // 保留原选择，UI 显示"后端未连接"提示即可；下次 init 成功时再校验。
      applySelection(selection.id);
    }
    emit();
    return;
  }

  // Rotation groups: validate the active one and seed a first group from a
  // playable Wallpaper Engine playlist when the user has none yet (so the
  // rotation feature starts working out of the box, using ids the host already
  // resolved — no WE config.json path matching involved). Seeding happens once
  // (`rotationSeeded`), so deleting every list stays respected on refresh.
  if (!selection.rotationGroups.length && !selection.rotationSeeded) {
    selection.rotationSeeded = true;
    seedGroupsFromPlaylists();
    persistSelection();
  }
  if (selection.rotationGroupId && !activeRotationGroup()) {
    selection.rotationGroupId = "";
    persistSelection();
  }
  if (selection.rotationEnabled) {
    if (!selection.rotationGroupId) {
      const usable = firstUsableGroup();
      if (usable) selection.rotationGroupId = usable.id;
      else selection.rotationEnabled = false;
    } else if (rotationCandidates().length < 2) {
      const usable = firstUsableGroup();
      if (usable && usable.id !== selection.rotationGroupId) selection.rotationGroupId = usable.id;
      else if (!usable) selection.rotationEnabled = false;
    }
    persistSelection();
  }

  // After a refresh, drop the selection if the chosen wallpaper vanished or is
  // no longer playable (avoids a dangling media URL).
  if (selection.id && !selection.inventory.wallpapers.some((w) => w.id === selection.id && isRotatableWallpaper(w))) {
    selection.id = "";
    persistSelection();
  }
  if (selection.rotationEnabled && selection.id && !rotationCandidates().some((w) => w.id === selection.id)) {
    selection.id = "";
    persistSelection();
  }
  if (!selection.id && selection.rotationEnabled) {
    const first = rotationCandidates()[0];
    if (first) selection.id = first.id;
  }
  applySelection(selection.id);
  emit();
}

function isRotatableWallpaper(w) {
  return Boolean(w && w.playable && (w.type === "video" || w.type === "web"));
}

function playableInventory() {
  return selection.inventory.wallpapers.filter(isRotatableWallpaper);
}

// ── Rotation groups (user-defined carousel lists) ───────────────────────────
function activeRotationGroup() {
  return selection.rotationGroups.find((g) => g.id === selection.rotationGroupId) || null;
}

function groupWallpapers(group) {
  if (!group || !Array.isArray(group.wallpaperIds)) return [];
  const byId = new Map(selection.inventory.wallpapers.map((w) => [w.id, w]));
  return group.wallpaperIds.map((id) => byId.get(id)).filter(isRotatableWallpaper);
}

function rotationCandidates() {
  return groupWallpapers(activeRotationGroup());
}

function firstUsableGroup() {
  return selection.rotationGroups.find((g) => groupWallpapers(g).length >= 2) || null;
}

// First run / upgrade path: turn the first playable Wallpaper Engine playlist
// into a rotation group so existing setups keep working without any WE-side
// configuration. Returns true when a group was created.
function seedGroupsFromPlaylists() {
  const playable = selection.inventory.playlists.filter((p) => (p.portableCount || 0) >= 2);
  const source = playable[0];
  if (!source) return false;
  const ids = Array.isArray(source.wallpaperIds) ? source.wallpaperIds.slice() : [];
  if (!ids.length) return false;
  selection.rotationGroups.push({
    id: nextGroupId(),
    name: typeof source.name === "string" && source.name.trim() ? source.name.trim() : "轮播列表",
    interval: DEFAULTS.rotationInterval,
    order: source.order === "random" ? "random" : "sequence",
    wallpaperIds: ids,
  });
  selection.rotationGroupId = selection.rotationGroups[selection.rotationGroups.length - 1].id;
  return true;
}

function nextGroupId() {
  return "grp-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

function nextRotationWallpaper() {
  const list = rotationCandidates();
  if (list.length < 2) return null;
  const group = activeRotationGroup();
  if (group && group.order === "random") {
    const candidates = list.filter((w) => w.id !== selection.id);
    return candidates[Math.floor(Math.random() * candidates.length)] || null;
  }
  const current = list.findIndex((w) => w.id === selection.id);
  return list[(current + 1 + list.length) % list.length] || null;
}

function clearRotationTimer() {
  if (selection.rotationTimer === null) return;
  if (typeof window !== "undefined" && typeof window.clearTimeout === "function") {
    window.clearTimeout(selection.rotationTimer);
  }
  selection.rotationTimer = null;
}

function syncRotationTimer() {
  clearRotationTimer();
  if (!selection.rotationEnabled || !selection.id) return;
  if (rotationCandidates().length < 2) return;
  if (typeof window === "undefined" || typeof window.setTimeout !== "function") return;
  const group = activeRotationGroup();
  const minutes = group ? group.interval : DEFAULTS.rotationInterval;
  selection.rotationTimer = window.setTimeout(() => {
    selection.rotationTimer = null;
    if (!selection.rotationEnabled || !selection.id) return;
    const next = nextRotationWallpaper();
    if (next) applySelection(next.id);
  }, minutes * 60 * 1000);
}

// ── Rotation group CRUD (draft-based editor) ────────────────────────────────
function startEditGroup(id) {
  const group = selection.rotationGroups.find((g) => g.id === id);
  if (!group) return;
  selection.editing = JSON.parse(JSON.stringify(group));
  emit();
}

function startCreateGroup() {
  selection.editing = {
    id: nextGroupId(),
    name: "轮播列表 " + (selection.rotationGroups.length + 1),
    interval: DEFAULTS.rotationInterval,
    order: "sequence",
    wallpaperIds: [],
  };
  emit();
}

function saveEditingGroup() {
  const draft = selection.editing;
  if (!draft) return;
  const idx = selection.rotationGroups.findIndex((g) => g.id === draft.id);
  const cleaned = {
    id: draft.id,
    name: typeof draft.name === "string" && draft.name.trim() ? draft.name.trim() : "轮播列表",
    interval: clampNum(draft.interval, 1, 1440, DEFAULTS.rotationInterval),
    order: draft.order === "random" ? "random" : "sequence",
    wallpaperIds: Array.isArray(draft.wallpaperIds)
      ? draft.wallpaperIds.filter((x) => typeof x === "string" && x)
      : [],
  };
  if (idx >= 0) selection.rotationGroups[idx] = cleaned;
  else selection.rotationGroups.push(cleaned);
  selection.rotationGroupId = cleaned.id;
  selection.editing = null;
  if (selection.rotationEnabled && !rotationCandidates().some((w) => w.id === selection.id)) {
    const first = rotationCandidates()[0];
    applySelection(first ? first.id : "");
    return;
  }
  persistSelection();
  syncRotationTimer();
  emit();
}

function cancelEditGroup() {
  selection.editing = null;
  emit();
}

function deleteGroup(id) {
  const idx = selection.rotationGroups.findIndex((g) => g.id === id);
  if (idx < 0) return;
  selection.rotationGroups.splice(idx, 1);
  if (selection.rotationGroupId === id) {
    selection.rotationGroupId = "";
    if (selection.rotationEnabled) {
      const fallback = firstUsableGroup();
      if (fallback) selection.rotationGroupId = fallback.id;
      else selection.rotationEnabled = false;
    }
  }
  if (selection.editing && selection.editing.id === id) selection.editing = null;
  persistSelection();
  syncRotationTimer();
  emit();
}

function importPlaylistIntoDraft(playlist) {
  if (!selection.editing || !playlist || !Array.isArray(playlist.wallpaperIds)) return;
  selection.editing.wallpaperIds = playlist.wallpaperIds.slice();
  emit();
}

export function applySelection(id) {
  selection.id = id || "";
  persistSelection();
  if (!selection.id) {
    selection.url = null;
    selection.type = null;
    syncRotationTimer();
    emit();
    return;
  }
  const w = selection.inventory.wallpapers.find((x) => x.id === selection.id);
  if (!w || !isRotatableWallpaper(w)) {
    selection.url = null;
    selection.type = null;
    syncRotationTimer();
    emit();
    return;
  }
  selection.url = w.media;
  selection.type = w.type;
  syncRotationTimer();
  emit();
}

/** Set one effect knob by kind: 'scrim' | 'border' | 'blur' | 'wallpaperBlur'. */
export function setWeEffect(kind, value) {
  if (kind === 'scrim') selection.scrim = value / 100;
  else if (kind === 'border') selection.border = value / 100;
  else if (kind === 'blur') selection.blur = value;
  else if (kind === 'wallpaperBlur') selection.wallpaperBlur = value;
  persistSelection();
  applyEffects();
  emit();
}

// ── Global wallpaper knobs (blur/focus/scrim apply to any wallpaper) ────────
const WALLPAPER_KEY = 'dsh-beautify:wallpaper';
// -1 sentinels for focusX/focusY/scrim mean "use the preset default" until the
// user first drags that knob; blur defaults to a sharp 0px.
const WALLPAPER_DEFAULTS = { blur: 0, focusX: -1, focusY: -1, scrim: -1 };

/** Read the global wallpaper knobs; malformed or missing data yields the defaults. */
export function readWallpaper() {
  try {
    const raw = JSON.parse(localStorage.getItem(WALLPAPER_KEY) || 'null');
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return { ...WALLPAPER_DEFAULTS };
    return {
      blur: clampNum(raw.blur, 0, 60, WALLPAPER_DEFAULTS.blur),
      focusX: typeof raw.focusX === 'number' ? Math.max(-1, Math.min(1, raw.focusX)) : WALLPAPER_DEFAULTS.focusX,
      focusY: typeof raw.focusY === 'number' ? Math.max(-1, Math.min(1, raw.focusY)) : WALLPAPER_DEFAULTS.focusY,
      scrim: typeof raw.scrim === 'number' ? Math.max(-1, Math.min(1, raw.scrim)) : WALLPAPER_DEFAULTS.scrim,
    };
  } catch { return { ...WALLPAPER_DEFAULTS }; }
}

/** Merge wallpaper knob overrides ('blur' | 'focusX' | 'focusY' | 'scrim'). */
export function setWallpaper(partial) {
  const w = readWallpaper();
  for (const k of Object.keys(partial)) {
    w[k] = partial[k];
  }
  try { localStorage.setItem(WALLPAPER_KEY, JSON.stringify(w)); } catch { /* ignore */ }
  emit();
}

/** Toggle play/pause of the active wallpaper. */
export function toggleWePlay() {
  selection.playing = !selection.playing;
  emit();
  syncLayers();
}

// ── Behind-body layer: wallpaper + scrim (plain DOM, NOT a slot) ───────────
function buildMedia(sel) {
  const media = sel.type === "video"
    ? document.createElement("video")
    : document.createElement("iframe");
  if (sel.type === "video") {
    media.src = sel.url;
    media.autoplay = true;
    media.loop = true;
    media.muted = true;
    media.setAttribute("playsinline", "");
    media.className = "we-media";
  } else {
    media.src = sel.url;
    media.setAttribute("frameborder", "0");
    media.setAttribute("scrolling", "no");
    media.className = "we-media we-iframe";
  }
  return media;
}

function syncLayers() {
  // 1. Wallpaper element.
  const existing = document.getElementById(LAYER_ID);
  if (selection.url) {
    const wantKey = selection.type + "\u0000" + selection.url;
    const gotKey = existing && existing.dataset.weKey;
    if (existing && gotKey !== wantKey) existing.remove();
    let node = document.getElementById(LAYER_ID);
    if (!node) {
      node = document.createElement("div");
      node.id = LAYER_ID;
      node.className = "we-layer";
      node.dataset.weKey = wantKey;
      node.appendChild(buildMedia(selection));
      document.body.appendChild(node);
    }
    const video = node.querySelector("video");
    if (video) {
      if (selection.playing) { try { video.play().catch(() => {}); } catch {} }
      else video.pause();
    }
  } else if (existing) {
    existing.remove();
  }

  // 2. Scrim element (always present while a wallpaper is active).
  const scrim = document.getElementById(SCRIM_ID);
  if (selection.url) {
    if (!scrim) {
      const s = document.createElement("div");
      s.id = SCRIM_ID;
      s.className = "we-scrim";
      document.body.appendChild(s);
    }
    document.body.setAttribute(ACTIVE_ATTR, "on");
  } else {
    if (scrim) scrim.remove();
    document.body.removeAttribute(ACTIVE_ATTR);
  }
}

// ── Effect application: push the knobs into CSS variables ───────────────────
// Glass knobs (blur/highlight/saturate/border) are global: they live in the
// shared glass store and apply to every theme, not just WE wallpapers. The WE
// per-selection store keeps only wallpaper-scoped knobs (scrim, wallpaperBlur).
const GLASS_KEY = "dsh-beautify:glass";
const GLASS_DEFAULTS = { blur: 0, saturate: 1.8, highlight: 0.3, border: 0.35 }; // 默认关闭毛玻璃（避免开机整片白雾）

/** Read the global glass knobs; malformed or missing data yields the defaults. */
export function readGlass() {
  try {
    const raw = JSON.parse(localStorage.getItem(GLASS_KEY) || "null");
    if (raw === null) {
      // First run: inherit the legacy WE glass knobs so existing setups keep
      // their look after the knobs moved from the WE picker to the global block.
      const migrated = {
        blur: clampNum(selection.blur, 0, 40, GLASS_DEFAULTS.blur),
        saturate: GLASS_DEFAULTS.saturate,
        highlight: GLASS_DEFAULTS.highlight,
        border: clampNum(selection.border, 0, 1, GLASS_DEFAULTS.border),
      };
      try { localStorage.setItem(GLASS_KEY, JSON.stringify(migrated)); } catch { /* ignore */ }
      return migrated;
    }
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return { ...GLASS_DEFAULTS };
    return {
      blur: clampNum(raw.blur, 0, 40, GLASS_DEFAULTS.blur),
      saturate: clampNum(raw.saturate, 1, 3, GLASS_DEFAULTS.saturate),
      highlight: clampNum(raw.highlight, 0, 0.8, GLASS_DEFAULTS.highlight),
      border: clampNum(raw.border, 0, 1, GLASS_DEFAULTS.border),
    };
  } catch { return { ...GLASS_DEFAULTS }; }
}

/** Set one glass knob by kind: 'blur' | 'saturate' | 'highlight' | 'border'. */
export function setGlass(kind, value) {
  const g = readGlass();
  g[kind] = value;
  try { localStorage.setItem(GLASS_KEY, JSON.stringify(g)); } catch { /* ignore */ }
  applyGlass();
  emit();
}

/** Push the glass knobs into body CSS variables and gate the glass rules. */
let glassStyleEl = null;
function ensureGlassStyle() {
  if (glassStyleEl && document.head.contains(glassStyleEl)) return glassStyleEl;
  if (glassStyleEl && !document.head.contains(glassStyleEl)) { glassStyleEl.remove(); glassStyleEl = null; }
  glassStyleEl = document.createElement("style");
  glassStyleEl.dataset.dshGlass = "rules";
  glassStyleEl.textContent = [
    "body[data-ds-glass] [data-composer-card],",
    "body[data-ds-glass] [data-input-mirror],",
    "body[data-ds-glass] [class*='composerSeat'],",
    "body[data-ds-glass] [class*='MessageRow'] [class*='card']",
    "{",
    "  backdrop-filter: blur(var(--we-blur, 24px)) saturate(var(--we-saturate, 1.8)) !important;",
    "  -webkit-backdrop-filter: blur(var(--we-blur, 24px)) saturate(var(--we-saturate, 1.8)) !important;",
    "  background-color: rgba(255,255,255,0.045) !important;",
    "}",
    "body[data-ds-glass] [class*='composerSeat'] {",
    "  background-image: linear-gradient(135deg, rgba(255,255,255, calc(var(--we-glass-highlight, 0.3) * 0.5)) 0%, rgba(255,255,255,0.01) 100%) !important;",
    "  border-color: rgba(255,255,255, var(--we-border-alpha, 0.35)) !important;",
    "}",
  ].join("\n");
  document.head.appendChild(glassStyleEl);
  return glassStyleEl;
}
export function applyGlass() {
  const g = readGlass();
  const s = document.body.style;
  if (g.blur > 0) {
    document.body.setAttribute("data-ds-glass", "on");
    s.setProperty("--we-blur", g.blur + "px");
    s.setProperty("--we-saturate", String(g.saturate));
    s.setProperty("--we-glass-highlight", String(g.highlight));
    s.setProperty("--we-glass-shadow", "0.14");
    s.setProperty("--we-border-alpha", String(g.border));
    ensureGlassStyle();
  } else {
    document.body.removeAttribute("data-ds-glass");
    s.removeProperty("--we-blur");
    s.removeProperty("--we-saturate");
    s.removeProperty("--we-glass-highlight");
    s.removeProperty("--we-glass-shadow");
    s.removeProperty("--we-border-alpha");
  }
}

function applyEffects() {
  const s = document.body.style;
  s.setProperty("--we-scrim-color", "rgba(0,0,0," + selection.scrim + ")");
  // Wallpaper blur strength in px (blurs the wallpaper itself).
  s.setProperty("--we-wallpaper-blur", selection.wallpaperBlur + "px");
  // Compensate for the fringe the blur reveals by scaling the layer up.
  const scale = (1 + selection.wallpaperBlur * 0.006).toFixed(4);
  s.setProperty("--we-wallpaper-scale", scale);

  // Scrim immediacy: some composited/kiosk environments do not repaint a
  // z-index:-1 layer promptly when only an inherited CSS variable changes.
  // Write the resolved color DIRECTLY onto the scrim element's inline style and
  // then force a synchronous layout, so the change is visible on this frame no
  // matter how the browser layers the page.
  const scrim = document.getElementById(SCRIM_ID);
  if (scrim) {
    scrim.style.background = "rgba(0,0,0," + selection.scrim + ")";
  }
  // Force reflow so a stalled compositor picks up the new value immediately.
  if (document.body && document.body.offsetHeight !== undefined) {
    void document.body.offsetHeight;
  }
}

function clearEffects() {
  const s = document.body.style;
  s.removeProperty("--we-scrim-color");
  s.removeProperty("--we-wallpaper-blur");
  s.removeProperty("--we-wallpaper-scale");
  const scrim = document.getElementById(SCRIM_ID);
  if (scrim) scrim.style.background = "";
}

// ── Settings picker ─────────────────────────────────────────────────────────
function SliderRow(label, min, max, step, value, onInput, suffix) {
  return React.createElement("div", { className: "we-picker__row we-picker__slider-row" },
    React.createElement("span", { className: "we-picker__hint we-picker__label" }, label),
    React.createElement("input", {
      className: "we-picker__slider", type: "range",
      min: String(min), max: String(max), step: String(step),
      value: String(value),
      // onInput fires continuously while dragging a range input (onChange may
      // only fire on release in some engines) — this is what makes the knob
      // feedback instant. onChange stays as a final commit fallback.
      onInput: (e) => onInput(Number(e.target.value)),
      onChange: (e) => onInput(Number(e.target.value)),
    }),
    React.createElement("span", { className: "we-picker__hint we-picker__value" }, suffix),
  );
}

function WallpaperPicker() {
  const sel = useStore();
  const onChange = (e) => applySelection(e.target.value);
  const onTogglePlay = () => { selection.playing = !selection.playing; emit(); };
  const onClear = () => applySelection("");
  const onRefresh = () => loadInventory();
  const onGroupChange = (e) => {
    selection.rotationGroupId = e.target.value;
    if (selection.rotationEnabled) {
      const first = rotationCandidates()[0];
      if (first) applySelection(first.id);
      else applySelection("");
      return;
    }
    persistSelection();
    syncRotationTimer();
    emit();
  };
  const onToggleRotation = () => {
    selection.rotationEnabled = !selection.rotationEnabled;
    if (selection.rotationEnabled) {
      if (!selection.rotationGroupId) {
        const usable = firstUsableGroup();
        if (usable) selection.rotationGroupId = usable.id;
      }
      if (!rotationCandidates().some((w) => w.id === selection.id)) {
        const first = rotationCandidates()[0];
        if (first) {
          applySelection(first.id);
          return;
        }
      }
    }
    persistSelection();
    syncRotationTimer();
    emit();
  };
  // Per-group interval: writes straight into the active group so each rotation
  // list keeps its own switch cadence.
  const onGroupInterval = (e) => {
    const group = activeRotationGroup();
    if (!group) return;
    group.interval = clampNum(Number(e.target.value), 1, 1440, DEFAULTS.rotationInterval);
    persistSelection();
    syncRotationTimer();
    emit();
  };
  const onDeleteGroup = () => {
    const group = activeRotationGroup();
    if (!group) return;
    if (typeof window !== "undefined" && typeof window.confirm === "function") {
      if (!window.confirm("删除轮播列表「" + group.name + "」？")) return;
    }
    deleteGroup(group.id);
  };

  // Slider callbacks: keep the stored value in its canonical unit, then apply
  // the effect IMMEDIATELY (applyEffects writes the CSS var synchronously) so
  // the visual feedback is instant even if a listener/emit path is lagging;
  // emit() additionally re-renders the picker's numeric readouts.
  const onScrim = (pct) => { selection.scrim = pct / 100; persistSelection(); applyEffects(); emit(); };
  const onBorder = (pct) => { selection.border = pct / 100; persistSelection(); applyEffects(); emit(); };
  const onBlur = (px) => { selection.blur = px; persistSelection(); applyEffects(); emit(); };
  const onWallpaperBlur = (px) => { selection.wallpaperBlur = px; persistSelection(); applyEffects(); emit(); };

  if (!sel.loaded) {
    return React.createElement("div", { className: "we-picker" },
      React.createElement("span", { className: "we-picker__hint" }, "扫描 Wallpaper Engine…"));
  }
  if (sel.inventory.error) {
    return React.createElement("div", { className: "we-picker" },
      React.createElement("div", { className: "we-picker__error" },
        "未检测到 Wallpaper Engine：" + sel.inventory.error),
      React.createElement("button", {
        className: "we-picker__btn", type: "button", onClick: onRefresh, disabled: sel.loading,
      }, sel.loading ? "刷新中…" : "重试"));
  }

  const list = sel.inventory.wallpapers;
  const groups = sel.rotationGroups;
  const group = activeRotationGroup();
  const candidates = rotationCandidates();
  const playableCount = candidates.length;
  const editing = sel.editing;
  const INTERVALS = [1, 5, 10, 30, 60, 120];
  return React.createElement("div", { className: "we-picker" },
    React.createElement("select", { className: "we-picker__select", value: sel.id, onChange },
      React.createElement("option", { value: "" }, "— 无（关闭） —"),
      ...list.map((w) => React.createElement("option", {
        key: w.id, value: w.id, disabled: !isRotatableWallpaper(w),
      }, (isRotatableWallpaper(w) ? "" : "[不可播放] ") + w.title)),
    ),
    React.createElement("div", { className: "we-picker__row" },
      React.createElement("button", {
        className: "we-picker__btn", type: "button",
        onClick: onTogglePlay, disabled: !sel.url,
      }, sel.playing ? "暂停" : "播放"),
      React.createElement("button", {
        className: "we-picker__btn", type: "button",
        onClick: onClear, disabled: !sel.id,
      }, "关闭"),
      React.createElement("button", {
        className: "we-picker__btn", type: "button",
        onClick: onRefresh, disabled: sel.loading,
      }, sel.loading ? "刷新中…" : "刷新"),
    ),
    // ── Rotation groups: user-defined carousel lists, each with its own
    //    wallpaper set, interval and order. Fully client-side, so rotation no
    //    longer depends on Wallpaper Engine's own playlist paths.
    React.createElement("div", { className: "we-picker__row we-picker__playlist-row" },
      React.createElement("span", { className: "we-picker__hint we-picker__label" }, "轮播列表"),
      React.createElement("select", {
        className: "we-picker__playlist-select",
        value: sel.rotationGroupId,
        onChange: onGroupChange,
        disabled: groups.length === 0,
      },
      React.createElement("option", { value: "" }, groups.length ? "— 选择轮播列表 —" : "— 暂无轮播列表 —"),
      ...groups.map((g) => React.createElement("option", {
        key: g.id, value: g.id,
      }, g.name + "（" + groupWallpapers(g).length + " 可播放 · " + g.interval + " 分钟）")),
      ),
      React.createElement("button", {
        className: "we-picker__btn", type: "button",
        onClick: startCreateGroup,
      }, "新建"),
      React.createElement("button", {
        className: "we-picker__btn", type: "button",
        onClick: () => startEditGroup(sel.rotationGroupId),
        disabled: !sel.rotationGroupId,
      }, "编辑"),
      React.createElement("button", {
        className: "we-picker__btn", type: "button",
        onClick: onDeleteGroup,
        disabled: !sel.rotationGroupId,
      }, "删除"),
    ),
    editing && React.createElement("div", { className: "we-picker__editor" },
      React.createElement("div", { className: "we-picker__row" },
        React.createElement("span", { className: "we-picker__hint we-picker__label" }, "名称"),
        React.createElement("input", {
          className: "we-picker__text", type: "text",
          value: editing.name,
          onInput: (e) => { editing.name = e.target.value; emit(); },
        }),
      ),
      React.createElement("div", { className: "we-picker__row" },
        React.createElement("span", { className: "we-picker__hint we-picker__label" }, "间隔"),
        React.createElement("select", {
          className: "we-picker__rotation-interval",
          value: String(editing.interval),
          onChange: (e) => { editing.interval = clampNum(Number(e.target.value), 1, 1440, DEFAULTS.rotationInterval); emit(); },
        },
        ...INTERVALS.map((minutes) =>
          React.createElement("option", { key: minutes, value: String(minutes) }, minutes + " 分钟"),
        )),
        React.createElement("span", { className: "we-picker__hint we-picker__label" }, "顺序"),
        React.createElement("select", {
          className: "we-picker__playlist-select",
          value: editing.order,
          onChange: (e) => { editing.order = e.target.value; emit(); },
        },
        React.createElement("option", { value: "sequence" }, "顺序"),
        React.createElement("option", { value: "random" }, "随机"),
        ),
      ),
      React.createElement("div", { className: "we-picker__editor-list" },
        playableInventory().length === 0
          ? React.createElement("span", { className: "we-picker__hint" }, "没有可播放的 Video/Web 壁纸")
          : playableInventory().map((w) => React.createElement("label", {
              key: w.id, className: "we-picker__editor-item",
            },
            React.createElement("input", {
              type: "checkbox",
              checked: editing.wallpaperIds.indexOf(w.id) >= 0,
              onChange: () => {
                const i = editing.wallpaperIds.indexOf(w.id);
                if (i >= 0) editing.wallpaperIds.splice(i, 1);
                else editing.wallpaperIds.push(w.id);
                emit();
              },
            }),
            w.title,
          )),
      ),
      React.createElement("div", { className: "we-picker__row" },
        React.createElement("span", { className: "we-picker__hint" }, "已选 " + editing.wallpaperIds.length + " 个"),
        sel.inventory.playlists.length > 0 && React.createElement("select", {
          className: "we-picker__playlist-select",
          value: "",
          onChange: (e) => {
            const p = sel.inventory.playlists.find((pl) => pl.id === e.target.value);
            if (p) importPlaylistIntoDraft(p);
          },
        },
        React.createElement("option", { value: "" }, "从 WE 播放列表导入…"),
        ...sel.inventory.playlists.map((p) => React.createElement("option", {
          key: p.id, value: p.id,
        }, p.name + "（" + (p.portableCount || 0) + " 可播放）")),
        ),
      ),
      React.createElement("div", { className: "we-picker__row" },
        React.createElement("button", {
          className: "we-picker__btn", type: "button",
          onClick: saveEditingGroup,
        }, "保存"),
        React.createElement("button", {
          className: "we-picker__btn", type: "button",
          onClick: cancelEditGroup,
        }, "取消"),
      ),
    ),
    React.createElement("div", { className: "we-picker__row we-picker__rotation-row" },
      React.createElement("label", { className: "we-picker__rotation-toggle" },
        React.createElement("input", {
          type: "checkbox",
          checked: sel.rotationEnabled,
          onChange: onToggleRotation,
          disabled: !sel.rotationGroupId || playableCount < 2,
        }),
        "自动轮转",
      ),
      React.createElement("select", {
        className: "we-picker__rotation-interval",
        value: String(group ? group.interval : DEFAULTS.rotationInterval),
        onChange: onGroupInterval,
        disabled: !sel.rotationEnabled || !sel.rotationGroupId || playableCount < 2,
        title: "当前列表的切换间隔",
      },
      ...INTERVALS.map((minutes) =>
        React.createElement("option", { key: minutes, value: String(minutes) }, minutes + " 分钟"),
      )),
      !sel.rotationGroupId && React.createElement("span", { className: "we-picker__hint" }, "请先选择或新建一个轮播列表"),
      sel.rotationGroupId && playableCount < 2 && React.createElement("span", { className: "we-picker__hint" }, "当前列表至少需要 2 个可播放壁纸"),
    ),
    sel.id && React.createElement(React.Fragment, null,
      SliderRow("壁纸模糊", 0, 60, 1, sel.wallpaperBlur, onWallpaperBlur, sel.wallpaperBlur + "px"),
      SliderRow("暗化", 0, 90, 5, Math.round(sel.scrim * 100), onScrim, Math.round(sel.scrim * 100) + "%"),
      SliderRow("边框", 0, 90, 5, Math.round(sel.border * 100), onBorder, Math.round(sel.border * 100) + "%"),
      SliderRow("玻璃", 0, 40, 1, sel.blur, onBlur, sel.blur + "px"),
    ),
    React.createElement("div", { className: "we-picker__row" },
      React.createElement("span", { className: "we-picker__hint" },
        (group
          ? "列表「" + group.name + "」：" + group.wallpaperIds.length + " 项 · " + playableCount + " 可播放 · 每 " + group.interval + " 分钟 · " + (group.order === "random" ? "随机" : "顺序")
          : list.length + " 个壁纸 · " + sel.inventory.portableCount + " 可播放") +
        (sel.rotationEnabled ? " · 自动轮转中" : "")),
    ),
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const CSS = `
  /* Wallpaper layer: a fixed child of <body>. It lives at z-index:0 (not
     negative!) because Chromium refuses to paint <iframe> content that is
     nested inside a negative z-index stacking context — web wallpapers went
     black/transparent. The app UI is lifted above it via
     body[data-we-wallpaper] #root { z-index:2 } below, and the scrim sits
     between the two (z-index:1). */
  .we-layer { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
  /* Blurring via CSS filter darkens/thins the edges, so the layer is scaled up
     (--we-wallpaper-scale tracks blur) to hide the transparent fringe the blur
     would otherwise reveal at the viewport edges. */
  .we-layer .we-media {
    width: 100%; height: 100%; object-fit: cover; display: block;
    background: transparent; border: 0;
    filter: blur(var(--we-wallpaper-blur, 0px));
    transform: scale(var(--we-wallpaper-scale, 1));
    transform-origin: center;
  }

  /* Scrim: sits ABOVE the wallpaper (z-index 1 > 0) and BELOW the app UI
     (#root z-index 2). Explicit z-index so it never depends on DOM insertion
     order — the wallpaper element is re-appended on wallpaper switch and
     could otherwise slide above the scrim. */
  .we-scrim {
    position: fixed; inset: 0; z-index: 1;
    pointer-events: none;
    background: var(--we-scrim-color, rgba(0, 0, 0, 0.25));
  }

  /* Lift the entire app frame above the wallpaper+scrim stack while a
     wallpaper is active. #root is z-auto normally, so this only kicks in
     under body[data-we-wallpaper]. The maid character stage, modals and the
     whale widget are appended to <body> AFTER #root with their own z-index,
     so they still paint above it (stage z=2, composer inputs z=100, dialogs
     z≈50+). */
  body[data-we-wallpaper] #root {
    position: relative;
    z-index: 2;
  }

  /* The app layout shell paints opaque gradient / colour backgrounds on its
     frame, column and pane containers (several via the inline
     --dsw-alias-bg-base custom property, which stylesheet overrides cannot
     reach). While a wallpaper is active these must be see-through so the
     wallpaper+scrim stack shows across the whole frame; frosted-glass
     surfaces (composer card, message bubbles) keep their own translucent
     backgrounds and are unaffected by these selectors. */
  body[data-we-wallpaper] [data-pane],
  body[data-we-wallpaper] [class*="sidebarCol"],
  body[data-we-wallpaper] [class*="sidebarCol"] > div,
  body[data-we-wallpaper] [class*="centerCol"],
  body[data-we-wallpaper] [class*="detailsCol"],
  body[data-we-wallpaper] [class*="_frame"],
  body[data-we-wallpaper] [class*="_root"] {
    background: transparent !important;
  }

  /* While a wallpaper is active: make the app frame AND sidebar transparent so
     all columns share the same wallpaper+scrim background, raise border alpha
     for visibility, and apply the frosted-glass effect to opaque surfaces. */
  body[data-we-wallpaper] {
    --dsw-alias-bg-base: transparent;
    --dsw-specific-sidebar-fill: transparent;
    /* Border emphasis: neutral gray so it reads on both light and dark themes;
       alpha is driven by the "边框" slider through --we-border-alpha. */
    --dsw-alias-border-l1: rgba(180, 180, 180, var(--we-border-alpha, 0.35));
    --dsw-alias-border-l2: rgba(180, 180, 180, var(--we-border-alpha, 0.35));
    --dsw-alias-border-l2-darkmode-thin: rgba(180, 180, 180, var(--we-border-alpha, 0.35));
  }

  /* The wallpaper layer lives at z-index:-2, which paints BELOW the body
     background. Theme systems (incl. the maid atelier skin) often paint a
     background-image onto <body> — either directly or through an inline
     --dsw-alias-bg-base custom property that outranks stylesheet overrides —
     which silently hides the wallpaper. Wipe the whole background (colour AND
     image) while a wallpaper is active so the behind-body layer shows through.
     !important is required to beat the inline custom-property-driven rule. */
  body[data-we-wallpaper] {
    background: transparent !important;
  }

  /* ── Light-scheme text contrast boost ──────────────────────────────────────
     In light mode the grays (tertiary/caption/secondary) were tuned against a
     near-white page. Over a busy wallpaper + light scrim they lose contrast, so
     push the whole gray ramp darker while a wallpaper is active. Primary text
     is already near-black; we still pin it to pure black for max legibility.
     (Dark mode is untouched: its white-on-dark text already reads fine.) */
  body[data-we-wallpaper]:not([data-ds-dark-theme]) {
    --dsw-alias-label-primary: rgb(0, 0, 0);
    --dsw-alias-label-primary-inverted: #ffffff;
    --dsw-alias-label-primary-dimmed: rgb(10, 10, 12);
    --dsw-alias-label-secondary: rgb(40, 42, 46);
    --dsw-alias-label-tertiary: rgb(70, 73, 79);
    --dsw-alias-label-caption: rgb(110, 114, 120);
    --dsw-alias-label-dimmed: rgb(50, 52, 56);
  }

  /* ── iOS liquid glass ──────────────────────────────────────────────────────
     The opaque conversation surfaces become translucent glass. The recipe is
     Apple-like, not a plain blur:
       - large-radius blur + HIGH saturation + slight brightness boost, so the
         wallpaper colour melts into a soft glow instead of a gray smear;
       - a light, low-alpha base (not a dark one) so the wallpaper shows through;
       - a 1px top highlight (refraction edge) + soft shadow for "thick glass";
       - blur radius + saturation both scale off --we-blur / --we-saturate.

     Transparency is driven through the design tokens the surfaces already read
     (--dsw-specific-input-major on the composer card, --dsw-specific-bubble on
     message bubbles) rather than through class selectors: CSS-module class
     names are build hashes and change whenever the shell frontend is rebuilt,
     which silently kills the effect. backdrop-filter cannot be expressed as a
     token, so the blur itself still needs an element selector — [data-composer-card]
     is authored in the shell source and survives rebuilds. Bubbles carry no such
     attribute, so they fall back to the module-CSS suffix convention; if that
     ever stops matching the bubble stays translucent, just without the blur. */
  body[data-we-wallpaper] {
    --dsw-specific-input-major: rgba(255, 255, 255, 0.18);
    --dsw-specific-bubble: rgba(255, 255, 255, 0.14);
    --dsw-specific-bubble-highlight: rgba(255, 255, 255, 0.18);
    --dsw-alias-markdown-inline-code: rgba(255, 255, 255, 0.18);
    --dsw-alias-markdown-tag: rgba(255, 255, 255, 0.16);
    --dsw-alias-markdown-citation: rgba(255, 255, 255, 0.16);
    --dsw-alias-markdown-code-block: rgba(255, 255, 255, 0.16);
    --dsw-alias-markdown-code-block-banner: rgba(255, 255, 255, 0.2);
    --dsw-alias-markdown-code-segment-selected: rgba(255, 255, 255, 0.22);
    --dsw-alias-markdown-code-segment-unselected: rgba(255, 255, 255, 0.14);
    --dsw-alias-markdown-placeholder: rgba(255, 255, 255, 0.45);
    --dsw-alias-bg-layer-1: rgba(255, 255, 255, 0.08);
    --dsw-alias-bg-layer-2: rgba(255, 255, 255, 0.1);
    --dsw-alias-bg-layer-3: rgba(255, 255, 255, 0.12);
    --dsw-alias-bg-module-platform: rgba(255, 255, 255, 0.08);
    --dsw-alias-bg-multi-select: rgba(255, 255, 255, 0.16);
    --dsw-alias-bg-overlay: rgba(255, 255, 255, 0.1);
    --dsw-alias-bg-skeleton: rgba(255, 255, 255, 0.1);
    --dsw-alias-border-l1: rgba(255, 255, 255, 0.1);
    --dsw-alias-border-l2: rgba(255, 255, 255, 0.16);
    --dsw-alias-border-l2-darkmode-thin: rgba(255, 255, 255, 0.1);
    --dsw-alias-border-l3: rgba(255, 255, 255, 0.2);
    --dsw-alias-border-l4: rgba(255, 255, 255, 0.24);
    --dsw-alias-border-subtle: rgba(255, 255, 255, 0.1);
    --dsw-alias-label-primary: rgba(255, 255, 255, 0.92);
    --dsw-alias-label-primary-inverted: #0d0f14;
    --dsw-alias-label-primary-bluish: rgba(255, 255, 255, 0.7);
    --dsw-alias-label-primary-dimmed: rgba(255, 255, 255, 0.55);
    --dsw-alias-label-secondary: rgba(255, 255, 255, 0.7);
    --dsw-alias-label-tertiary: rgba(255, 255, 255, 0.55);
    --dsw-alias-label-quaternary: rgba(255, 255, 255, 0.55);
    --dsw-alias-label-caption: rgba(255, 255, 255, 0.55);
    --dsw-alias-label-dimmed: rgba(255, 255, 255, 0.45);
    --dsw-alias-text-primary: rgba(255, 255, 255, 0.92);
    --dsw-alias-text-tertiary: rgba(255, 255, 255, 0.55);
    --dsw-alias-fill-tsp-secondary: rgba(255, 255, 255, 0.14);
    --dsw-specific-login-input: rgba(255, 255, 255, 0.08);
    --dsw-specific-tip: rgba(255, 255, 255, 0.12);
    --dsw-specific-sidebar-nav-item-hover: rgba(255, 255, 255, 0.12);
    --dsw-specific-sidebar-nav-item-active: rgba(255, 255, 255, 0.18);
    --dsw-specific-sidebar-nav-item-active-accent: rgba(255, 255, 255, 0.18);
    /* New-session bar + floating pills + buttons + hover states go glassy
       too, or they stay on the stock near-white while the frame around them
       turns transparent. */
    --dsw-alias-button-elevated-fill: rgba(255, 255, 255, 0.16);
    --dsw-alias-button-floating-fill: rgba(255, 255, 255, 0.16);
    --dsw-alias-button-floating-hover: rgba(255, 255, 255, 0.22);
    --dsw-alias-button-primary-fill: rgba(255, 255, 255, 0.22);
    --dsw-alias-button-primary-hover: rgba(255, 255, 255, 0.28);
    --dsw-alias-button-primary-dimmed: rgba(255, 255, 255, 0.1);
    --dsw-alias-button-tool-bar-fill: rgba(255, 255, 255, 0.14);
    --dsw-alias-button-tool-bar-fill-invisible: rgba(255, 255, 255, 0.08);
    --dsw-alias-button-tool-bar-hover: rgba(255, 255, 255, 0.2);
    --dsw-alias-button-ghost-active-fill: rgba(255, 255, 255, 0.16);
    --dsw-alias-button-ghost-active-border: rgba(255, 255, 255, 0.28);
    --dsw-alias-button-ghost-active-hover: rgba(255, 255, 255, 0.2);
    --dsw-alias-interactive-bg-hover: rgba(255, 255, 255, 0.14);
    --dsw-alias-interactive-bg-active: rgba(255, 255, 255, 0.2);
    --dsw-alias-interactive-bg-hover-solid: rgba(255, 255, 255, 0.14);
  }
  body[data-ds-dark-theme][data-we-wallpaper] {
    --dsw-specific-input-major: rgba(255, 255, 255, 0.07);
    --dsw-specific-bubble: rgba(255, 255, 255, 0.06);
    --dsw-specific-bubble-highlight: rgba(255, 255, 255, 0.08);
    --dsw-alias-markdown-inline-code: rgba(15, 18, 24, 0.45);
    --dsw-alias-markdown-tag: rgba(15, 18, 24, 0.35);
    --dsw-alias-markdown-citation: rgba(15, 18, 24, 0.35);
    --dsw-alias-markdown-code-block: rgba(15, 18, 24, 0.5);
    --dsw-alias-markdown-code-block-banner: rgba(15, 18, 24, 0.55);
    --dsw-alias-markdown-code-segment-selected: rgba(255, 255, 255, 0.14);
    --dsw-alias-markdown-code-segment-unselected: rgba(15, 18, 24, 0.3);
    --dsw-alias-markdown-placeholder: rgba(255, 255, 255, 0.4);
    --dsw-alias-bg-layer-1: rgba(255, 255, 255, 0.04);
    --dsw-alias-bg-layer-2: rgba(255, 255, 255, 0.05);
    --dsw-alias-bg-layer-3: rgba(255, 255, 255, 0.06);
    --dsw-alias-bg-module-platform: rgba(255, 255, 255, 0.04);
    --dsw-alias-bg-multi-select: rgba(255, 255, 255, 0.08);
    --dsw-alias-bg-overlay: rgba(255, 255, 255, 0.05);
    --dsw-alias-bg-skeleton: rgba(255, 255, 255, 0.05);
    --dsw-alias-border-l1: rgba(255, 255, 255, 0.05);
    --dsw-alias-border-l2: rgba(255, 255, 255, 0.1);
    --dsw-alias-border-l2-darkmode-thin: rgba(255, 255, 255, 0.05);
    --dsw-alias-border-l3: rgba(255, 255, 255, 0.12);
    --dsw-alias-border-l4: rgba(255, 255, 255, 0.14);
    --dsw-alias-border-subtle: rgba(255, 255, 255, 0.05);
    --dsw-alias-label-primary: rgba(255, 255, 255, 0.85);
    --dsw-alias-label-primary-inverted: #0d0f14;
    --dsw-alias-label-primary-bluish: rgba(255, 255, 255, 0.6);
    --dsw-alias-label-primary-dimmed: rgba(255, 255, 255, 0.45);
    --dsw-alias-label-secondary: rgba(255, 255, 255, 0.6);
    --dsw-alias-label-tertiary: rgba(255, 255, 255, 0.45);
    --dsw-alias-label-quaternary: rgba(255, 255, 255, 0.45);
    --dsw-alias-label-caption: rgba(255, 255, 255, 0.45);
    --dsw-alias-label-dimmed: rgba(255, 255, 255, 0.35);
    --dsw-alias-text-primary: rgba(255, 255, 255, 0.85);
    --dsw-alias-text-tertiary: rgba(255, 255, 255, 0.45);
    --dsw-alias-fill-tsp-secondary: rgba(255, 255, 255, 0.07);
    --dsw-specific-login-input: rgba(255, 255, 255, 0.04);
    --dsw-specific-tip: rgba(255, 255, 255, 0.06);
    --dsw-specific-sidebar-nav-item-hover: rgba(255, 255, 255, 0.06);
    --dsw-specific-sidebar-nav-item-active: rgba(255, 255, 255, 0.1);
    --dsw-specific-sidebar-nav-item-active-accent: rgba(255, 255, 255, 0.1);
    --dsw-alias-button-elevated-fill: rgba(255, 255, 255, 0.08);
    --dsw-alias-button-floating-fill: rgba(255, 255, 255, 0.08);
    --dsw-alias-button-floating-hover: rgba(255, 255, 255, 0.12);
    --dsw-alias-button-primary-fill: rgba(255, 255, 255, 0.12);
    --dsw-alias-button-primary-hover: rgba(255, 255, 255, 0.16);
    --dsw-alias-button-primary-dimmed: rgba(255, 255, 255, 0.05);
    --dsw-alias-button-tool-bar-fill: rgba(255, 255, 255, 0.06);
    --dsw-alias-button-tool-bar-fill-invisible: rgba(255, 255, 255, 0.04);
    --dsw-alias-button-tool-bar-hover: rgba(255, 255, 255, 0.1);
    --dsw-alias-button-ghost-active-fill: rgba(255, 255, 255, 0.08);
    --dsw-alias-button-ghost-active-border: rgba(255, 255, 255, 0.16);
    --dsw-alias-button-ghost-active-hover: rgba(255, 255, 255, 0.1);
    --dsw-alias-interactive-bg-hover: rgba(255, 255, 255, 0.06);
    --dsw-alias-interactive-bg-active: rgba(255, 255, 255, 0.1);
    --dsw-alias-interactive-bg-hover-solid: rgba(255, 255, 255, 0.06);
  }
  body[data-ds-glass] [data-composer-card],
  body[data-ds-glass] [class*="_bubble"],
  body[data-ds-glass] button[class*="newSession"] {
    -webkit-backdrop-filter: blur(var(--we-blur, 24px)) saturate(var(--we-saturate, 1.8)) brightness(1.08);
    backdrop-filter: blur(var(--we-blur, 24px)) saturate(var(--we-saturate, 1.8)) brightness(1.08);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, var(--we-glass-highlight, 0.3)),
      inset 0 -1px 0 rgba(255, 255, 255, 0.05),
      0 8px 32px rgba(0, 0, 0, var(--we-glass-shadow, 0.14));
  }

  /* Picker chrome. */
  .we-picker { display: flex; flex-direction: column; gap: 8px; }
  .we-picker__select { max-width: 100%; }
  .we-picker__row { display: flex; gap: 8px; align-items: center; }
  .we-picker__playlist-select { flex: 1; min-width: 0; }
  .we-picker__rotation-toggle { display: inline-flex; align-items: center; gap: 6px; }
  .we-picker__rotation-interval { margin-left: auto; }
  .we-picker__btn { cursor: pointer; }
  .we-picker__hint { font-size: 0.8em; opacity: 0.7; }
  .we-picker__error { font-size: 0.85em; opacity: 0.8; }
  .we-picker__slider { flex: 1; }
  .we-picker__slider-row { display: flex; align-items: center; gap: 8px; }
  .we-picker__label { min-width: 28px; }
  .we-picker__value { min-width: 40px; text-align: right; }
  .we-picker__text { flex: 1; min-width: 0; }
  .we-picker__editor {
    display: flex; flex-direction: column; gap: 6px;
    padding: 8px;
    border: 1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.35));
    border-radius: 8px;
  }
  .we-picker__editor-list {
    display: flex; flex-direction: column; gap: 2px;
    max-height: 220px; overflow-y: auto;
  }
  .we-picker__editor-item {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.85em;
  }
`;

const TAG_ID = "dsh-beautify/styles";
if (typeof document !== "undefined" &&
    document.querySelector("style[data-plugin-css=" + JSON.stringify(TAG_ID) + "]") === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-beautify";
  tag.dataset.pluginCss = TAG_ID;
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

// ── Beautify integration ────────────────────────────────────────────────────
export function initWallpaperLayer(ctx) {
  if (ctx.effect) {
    ctx.effect(() => {
      const unsub = subscribe(syncLayers);
      const unsubEffects = subscribe(applyEffects);
      syncLayers();
      applyEffects();
      applyGlass(); // 初始化玻璃参数与规则，滑块默认值一加载即生效
      // 「先关了」玻璃：上次滑块默认 blur=24，开机就给整片白雾；本次默认 0，
      // 一次性把残留的高 blur 值强制归零并打标记，避免覆盖用户主动调过的偏好。
      try {
        if (localStorage.getItem('dsh-beautify:glassQuarantined') !== '1') {
          const raw = localStorage.getItem(GLASS_KEY)
          if (raw !== null) {
            try {
              const parsed = JSON.parse(raw)
              if (parsed && typeof parsed === 'object' && (parsed.blur === undefined || parsed.blur > 0)) {
                localStorage.setItem(GLASS_KEY, JSON.stringify({ ...parsed, blur: 0 }))
              }
            } catch {}
          }
          localStorage.setItem('dsh-beautify:glassQuarantined', '1')
        }
      } catch {}
      return () => {
        unsub();
        unsubEffects();
        clearRotationTimer();
        const node = document.getElementById(LAYER_ID);
        if (node) node.remove();
        const scrim = document.getElementById(SCRIM_ID);
        if (scrim) scrim.remove();
        clearEffects();
        document.body.removeAttribute(ACTIVE_ATTR);
      };
    });
  }

  // The inventory is scanned lazily: only the Wallpaper Engine picker (and its
  // refresh button) triggers loadInventory(), so opening the settings section
  // does not hit /wallpaper-engine/inventory until a change is actually wanted.
}
