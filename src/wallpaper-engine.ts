// @ts-nocheck — vendored host logic from elysia395/dsh-wallpaper-engine (MIT), kept JS-style for faithful port.
/**
 * dsh-wallpaper-engine — host half.
 *
 * A Cordis plugin (loaded as an out-of-tree bundle row, see cordis.patch.yml)
 * that bridges the local Wallpaper Engine install into the DSH web GUI.
 *
 * Responsibilities, all through the DSH webserver service (`ctx.webServer`):
 *   1. Locate the Wallpaper Engine install (Steam app 431960) by reading
 *      Steam's libraryfolders.vdf, so non-default Steam drives work.
 *   2. Enumerate installed wallpapers of the two *portable* kinds:
 *        - type "video"  → the project's `.mp4` (or other media) file
 *        - type "web"    → the project's HTML entry
 *      Scene (native 3D) and Application wallpapers are listed too, but only
 *      their preview image is served (they cannot be rendered here — see README).
 *   3. Serve a JSON inventory and the media/preview bytes over loopback HTTP
 *      routes the browser half fetches directly (same-origin):
 *        GET /wallpaper-engine/inventory          → { installDir, wallpapers:[…], playlists:[…] }
 *        GET /wallpaper-engine/media/<token>      → video / html (Range supported)
 *        GET /wallpaper-engine/preview/<token>    → preview image
 *
 * The plugin contributes no model-visible tool and no prompt text. Every route
 * is registered through the plugin fiber so it unwinds on unload. `webServer`
 * is treated as optional (guarded with ctx.get) so the bundle also loads in a
 * headless/TUI profile that has no HTTP server.
 */

import {
  readFileSync,
  existsSync,
  statSync,
  createReadStream,
  readdirSync,
} from 'node:fs';
import { join, resolve, normalize, basename } from 'node:path';
import { execFileSync } from 'node:child_process';

/** Steam appid for Wallpaper Engine. */
const WE_APPID = '431960';
/** Request path prefix under which this bundle's HTTP surface lives. */
const BASE = '/wallpaper-engine';
/** Common Steam install locations probed when libraryfolders.vdf is missing. */
const STEAM_PROBE_DIRS = [
  'C:\\Program Files (x86)\\Steam',
  'C:\\Program Files\\Steam',
  'D:\\Steam',
  'D:\\SteamLibrary',
  'E:\\SteamLibrary',
];

/** Steam root recorded by the Windows installer; the probe list misses custom dirs. */
function steamPathFromRegistry() {
  if (process.platform !== 'win32') return null;
  try {
    const reg = join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'reg.exe');
    const out = execFileSync(
      reg,
      ['query', 'HKCU\\Software\\Valve\\Steam', '/v', 'SteamPath'],
      { encoding: 'utf8', windowsHide: true, timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'] },
    );
    const m = /SteamPath\s+REG_SZ\s+(.+)/i.exec(out);
    return m ? normalize(m[1].trim()) : null;
  } catch { return null; }
}

/** Probe list with the registered Steam root first, when it is known. */
function steamProbeDirs() {
  const reg = steamPathFromRegistry();
  return reg ? [reg, ...STEAM_PROBE_DIRS] : STEAM_PROBE_DIRS;
}

/** Valve KeyValues parser for libraryfolders.vdf: libraries owning WE. */
function librariesFromVdf(vdfPath) {
  const text = readFileSync(vdfPath, 'utf8');
  const libs = [];
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    const m = /^\s*"path"\s+"([^"]+)"\s*$/.exec(line);
    if (m) { current = m[1].replace(/\\\\/g, '\\'); continue; }
    if (current && line.includes(WE_APPID) && !libs.includes(current)) libs.push(current);
  }
  return libs;
}

/** Locate the install directory (holds wallpaper32.exe). */
function locateWallpaperEngine() {
  const candidates = [];
  const libraries = [];
  const probes = steamProbeDirs();
  for (const probe of probes) {
    const vdf = join(probe, 'steamapps', 'libraryfolders.vdf');
    if (existsSync(vdf)) { try { libraries.push(...librariesFromVdf(vdf)); } catch { /* skip */ } }
  }
  const roots = [...probes, ...libraries];
  for (const root of roots) candidates.push(join(root, 'steamapps', 'common', 'wallpaper_engine'));
  candidates.push('C:\\Program Files (x86)\\Wallpaper Engine');

  const seen = new Set();
  for (const raw of candidates) {
    const dir = normalize(raw);
    if (seen.has(dir)) continue;
    seen.add(dir);
    if (existsSync(join(dir, 'wallpaper32.exe'))) return dir;
  }
  return null;
}

/** Libraries that own Wallpaper Engine (for the workshop content root). */
function owningLibraries() {
  const libs = [];
  for (const probe of steamProbeDirs()) {
    const vdf = join(probe, 'steamapps', 'libraryfolders.vdf');
    if (existsSync(vdf)) { try { libs.push(...librariesFromVdf(vdf)); } catch { /* skip */ } }
    // The Steam root a libraryfolders.vdf lives in is itself a library, but it
    // is never listed as a "path" entry. If Wallpaper Engine is installed in
    // the DEFAULT Steam library, its workshop content lives under that same
    // root — include it, or every workshop wallpaper silently disappears from
    // the inventory (and playlists cannot resolve, breaking rotation).
    if (existsSync(join(probe, 'steamapps', 'common', 'wallpaper_engine'))) libs.push(probe);
  }
  return [...new Set(libs)];
}

function inferType(file) {
  if (/\.(mp4|webm|mkv|avi|mov)$/i.test(file)) return 'video';
  if (/\.(html?|js)$/i.test(file)) return 'web';
  return 'scene';
}

const KINDS = ['scene', 'video', 'web', 'application'];

/** Preview image fallbacks, in order, when project.json omits `preview`. */
const PREVIEW_FALLBACKS = [
  'preview.jpg', 'preview.webp', 'preview.png',
  'scene/preview.jpg', 'scene/preview.webp', 'scene/preview.png',
];

function readProject(dir) {
  const pj = join(dir, 'project.json');
  if (!existsSync(pj)) return null;
  try {
    const o = JSON.parse(readFileSync(pj, 'utf8'));
    if (!o || typeof o !== 'object' || !o.file) return null;
    let type = typeof o.type === 'string' ? o.type.toLowerCase() : inferType(o.file);
    if (!KINDS.includes(type)) type = 'scene';
    let preview = typeof o.preview === 'string' && o.preview ? o.preview : null;
    if (!preview) {
      // Many workshop projects leave `preview` out; fall back to the well-known
      // preview image locations so the picker still shows a thumbnail.
      for (const candidate of PREVIEW_FALLBACKS) {
        const abs = resolve(dir, candidate);
        if (existsSync(abs)) { preview = candidate; break; }
      }
    }
    return {
      id: basename(dir),
      title: typeof o.title === 'string' ? o.title : basename(dir),
      type,
      file: o.file,
      preview,
      dir,
    };
  } catch { return null; }
}

function enumerateWallpapers(installDir, libraryDirs) {
  const found = new Map();
  const roots = [];
  if (installDir) {
    for (const sub of ['defaultprojects', 'myprojects']) {
      const p = join(installDir, 'projects', sub);
      if (existsSync(p)) roots.push(p);
    }
  }
  for (const lib of libraryDirs) {
    const ws = join(lib, 'steamapps', 'workshop', 'content', WE_APPID);
    if (existsSync(ws)) roots.push(ws);
  }
  for (const root of roots) {
    let entries = [];
    try { entries = readdirSync(root); } catch { continue; }
    for (const entry of entries) {
      const dir = join(root, entry);
      let st; try { st = statSync(dir); } catch { continue; }
      if (!st.isDirectory()) continue;
      const proj = readProject(dir);
      if (!proj || found.has(proj.id)) continue;
      proj.fileAbs = resolve(dir, proj.file);
      proj.previewAbs = proj.preview ? resolve(dir, proj.preview) : null;
      found.set(proj.id, proj);
    }
  }
  return [...found.values()].sort((a, b) =>
    (a.title || '').localeCompare(b.title || ''));
}

function pathKey(file) {
  return normalize(String(file).replace(/\//g, '\\')).toLowerCase();
}

function playlistId(profileName, index, name) {
  return Buffer.from(`${profileName}\0${index}\0${name}`, 'utf8').toString('base64url');
}

function playlistRows(profile) {
  const general = profile && typeof profile === 'object' ? profile.general : null;
  if (!general || typeof general !== 'object') return [];
  if (Array.isArray(general.playlists) && general.playlists.length) return general.playlists;
  const selected = general.wallpaperconfig && general.wallpaperconfig.selectedwallpapers;
  if (!selected || typeof selected !== 'object') return [];
  return Object.values(selected)
    .map((monitor) => monitor && monitor.playlist)
    .filter((playlist) => playlist && typeof playlist === 'object');
}

function readPlaylists(installDir) {
  if (!installDir) return [];
  const configPath = join(installDir, 'config.json');
  if (!existsSync(configPath)) return [];
  let config;
  try { config = JSON.parse(readFileSync(configPath, 'utf8')); } catch { return []; }

  const result = [];
  const seen = new Set();
  for (const [profileName, profile] of Object.entries(config || {})) {
    for (const [index, row] of playlistRows(profile).entries()) {
      const items = Array.isArray(row.items)
        ? row.items.filter((item) => typeof item === 'string' && item.trim())
        : [];
      if (!items.length) continue;
      const name = typeof row.name === 'string' && row.name.trim()
        ? row.name.trim() : `Playlist ${index + 1}`;
      const signature = `${name}\0${items.join('\0')}`;
      if (seen.has(signature)) continue;
      seen.add(signature);
      const settings = row.settings && typeof row.settings === 'object' ? row.settings : {};
      result.push({
        id: playlistId(profileName, index, name),
        name,
        items,
        order: settings.order === 'random' ? 'random' : 'sequence',
        delay: typeof settings.delay === 'number' ? settings.delay : null,
      });
    }
  }
  return result;
}

function playlistItemId(item, byPath, byId) {
  const exact = byPath.get(pathKey(item));
  if (exact) return exact;
  const match = /[\\/]431960[\\/]([^\\/]+)(?:[\\/]|$)/i.exec(item);
  const project = match ? byId.get(match[1]) : null;
  if (project) return project.id;
  // Last resort: match the trailing project folder name. Covers install-relative
  // entries like `projects\defaultprojects\<name>\project.json` (and media
  // files inside such projects), which never contain the workshop appid.
  const folder = /[\\/]([^\\/]+)[\\/][^\\/]+$/i.exec(item);
  if (folder && byId.has(folder[1])) return folder[1];
  return null;
}

function mimeFor(absPath) {
  const ext = absPath.slice(absPath.lastIndexOf('.') + 1).toLowerCase();
  return {
    mp4: 'video/mp4', webm: 'video/webm', mkv: 'video/x-matroska',
    avi: 'video/x-msvideo', mov: 'video/quicktime',
    html: 'text/html', htm: 'text/html', js: 'text/javascript',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
    png: 'image/png', webp: 'image/webp',
  }[ext] || 'application/octet-stream';
}

/**
 * Hard-depend on `webServer` so the Loader waits for the HTTP server to mount
 * before running this plugin. A ctx.get() at mount time is racy: rows mount
 * concurrently and the webserver may not exist yet, which would silently skip
 * route registration and let the SPA fallback answer every request. This bundle
 * is web-only (its dsh.client declares platform "web"), so a hard injection is
 * correct; it is simply not added to headless/TUI profiles.
 */
export function registerWallpaperEngine(ctx) {
  const webServer = ctx.webServer;
  if (!webServer || typeof webServer.register !== 'function') {
    return () => {}; // defensive: never expected in practice
  }

  // Token → absolute path map. Tokens are base64url of the abs path, so the
  // route never exposes an arbitrary filesystem string the client could not
  // otherwise obtain from the inventory.
  const mediaMap = new Map();
  const tokenFor = (absPath) => {
    const token = Buffer.from(absPath, 'utf8').toString('base64url');
    mediaMap.set(token, absPath);
    return token;
  };

  // Build the inventory with a short TTL cache: one scan walks every workshop
  // directory and spawns reg.exe twice, all synchronous — without the cache
  // each picker open would freeze the whole HTTP event loop (chat SSE included)
  // for the duration. The picker's refresh button still gets fresh data within
  // one TTL at worst.
  const INVENTORY_TTL_MS = 30000;
  let inventoryCache = null;
  let inventoryCacheAt = 0;
  function getInventory() {
    const now = Date.now();
    if (inventoryCache && now - inventoryCacheAt < INVENTORY_TTL_MS) return inventoryCache;
    inventoryCache = buildInventory();
    inventoryCacheAt = now;
    return inventoryCache;
  }

  function buildInventory() {
    const installDir = locateWallpaperEngine();
    const libraryDirs = owningLibraries();
    const all = enumerateWallpapers(installDir, libraryDirs);
    const byPath = new Map(all.map((w) => [pathKey(w.fileAbs), w.id]));
    const byId = new Map(all.map((w) => [w.id, w]));
    const wallpapers = all.map((w) => {
      const hasMedia = w.type === 'video' || w.type === 'web'
        ? existsSync(w.fileAbs) : false;
      const hasPreview = w.previewAbs && existsSync(w.previewAbs);
      return {
        id: w.id,
        title: w.title,
        type: w.type,
        playable: hasMedia,
        // Web wallpapers are served as a DIRECTORY (trailing slash) so the
        // browser resolves relative assets (js/css/img next to index.html)
        // against the same route; video/scene keep the exact file token.
        media: hasMedia
          ? w.type === 'web'
            ? `${BASE}/media/${tokenFor(w.dir)}/`
            : `${BASE}/media/${tokenFor(w.fileAbs)}`
          : null,
        preview: hasPreview ? `${BASE}/preview/${tokenFor(w.previewAbs)}` : null,
      };
    });
    const playableIds = new Set(wallpapers.filter((w) => w.playable).map((w) => w.id));
    const playlists = readPlaylists(installDir).map((playlist) => {
      const ids = [];
      const seenIds = new Set();
      for (const item of playlist.items) {
        const id = playlistItemId(item, byPath, byId);
        if (id && !seenIds.has(id)) { seenIds.add(id); ids.push(id); }
      }
      return {
        id: playlist.id,
        name: playlist.name,
        order: playlist.order,
        delay: playlist.delay,
        wallpaperIds: ids,
        total: ids.length,
        portableCount: ids.filter((id) => playableIds.has(id)).length,
        unresolvedCount: Math.max(0, playlist.items.length - ids.length),
      };
    });
    return {
      installDir,
      total: wallpapers.length,
      portableCount: wallpapers.filter((w) => w.playable).length,
      wallpapers,
      playlists,
    };
  }

  const disposers = [];

  // 1. Inventory JSON.
  disposers.push(webServer.register({
    kind: 'exact',
    path: `${BASE}/inventory`,
    handler: (req, res) => {
      try {
        const payload = JSON.stringify(getInventory());
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(payload);
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: String(err && err.message ? err.message : err) }));
      }
    },
  }));

  // 2/3. Media + preview (stream, with Range support for `<video>` seeking).
  // Stream errors MUST be handled: `pipe()` does not forward source errors, and
  // an unhandled 'error' on a Readable escapes as an uncaughtException that
  // kills the whole host process (real case: the workshop item gets unsubscribed
  // between existsSync and createReadStream → async ENOENT; or the resolved
  // path is a directory → async EISDIR). Aborted requests (video seeking) are
  // torn down on res 'close' so the fd does not linger until EOF.
  function streamToRes(absPath, opts, res) {
    const stream = createReadStream(absPath, opts);
    stream.on('error', (err) => {
      try { res.destroy(); } catch { /* already gone */ }
      console.warn('[wallpaper-engine] read failed:', String(err && err.message ? err.message : err), absPath);
    });
    res.on('close', () => { try { stream.destroy(); } catch { /* already ended */ } });
    stream.pipe(res);
  }

  function serveFile(absPath, req, res) {
    if (!absPath || !existsSync(absPath)) {
      res.statusCode = 404; res.end('not found'); return;
    }
    let st; try { st = statSync(absPath); } catch { res.statusCode = 404; res.end('not found'); return; }
    if (!st.isFile()) { res.statusCode = 404; res.end('not found'); return; }
    res.setHeader('Content-Type', mimeFor(absPath));
    res.setHeader('Accept-Ranges', 'bytes');
    const range = req.headers.range;
    const m = range ? /bytes=(\d*)-(\d*)/.exec(range) : null;
    if (range && m) {
      let start;
      let end;
      if (m[1] === '' && m[2] !== '') {
        // Suffix form `bytes=-N`: the LAST N bytes (RFC 7233), not the first.
        const n = parseInt(m[2], 10);
        if (!(n > 0) || n >= st.size) {
          res.statusCode = 416;
          res.setHeader('Content-Range', `bytes */${st.size}`);
          res.end(); return;
        }
        start = st.size - n;
        end = st.size - 1;
      } else {
        start = m[1] ? parseInt(m[1], 10) : 0;
        end = m[2] ? Math.min(parseInt(m[2], 10), st.size - 1) : st.size - 1;
      }
      if (Number.isNaN(start)) start = 0;
      if (Number.isNaN(end) || end >= st.size) end = st.size - 1;
      if (start > end || start >= st.size) {
        res.statusCode = 416;
        res.setHeader('Content-Range', `bytes */${st.size}`);
        res.end(); return;
      }
      res.statusCode = 206;
      res.setHeader('Content-Range', `bytes ${start}-${end}/${st.size}`);
      res.setHeader('Content-Length', String(end - start + 1));
      streamToRes(absPath, { start, end }, res);
      return;
    }
    // Malformed Range (regex miss) falls through: serve the whole file as 200.
    res.setHeader('Content-Length', String(st.size));
    streamToRes(absPath, null, res);
  }

  // Resolve a media request to an absolute file path.
  //  - exact token (video/scene/preview) → that file
  //  - "<dirToken>/<rel>" (web wallpaper asset) → file inside that wallpaper
  //    project directory, guarded against path traversal. An empty <rel>
  //    (request "…/media/<dirToken>/") returns the project entry file, so the
  //    browser treats the URL as a directory and resolves the wallpaper's
  //    relative js/css/img assets against it.
  function resolveMediaToken(token) {
    let abs = mediaMap.get(token);
    if (abs) return abs;
    const slash = token.indexOf('/');
    if (slash <= 0) return null;
    const dirToken = token.slice(0, slash);
    const rel = token.slice(slash + 1);
    const dir = mediaMap.get(dirToken);
    if (!dir || !existsSync(dir)) return null;
    let st; try { st = statSync(dir); } catch { return null; }
    if (!st.isDirectory()) return null;
    let target;
    if (!rel) {
      let entry = 'index.html';
      const pj = join(dir, 'project.json');
      if (existsSync(pj)) {
        try {
          const o = JSON.parse(readFileSync(pj, 'utf8'));
          if (o && typeof o.file === 'string' && o.file.trim()) entry = o.file;
        } catch { /* keep default */ }
      }
      target = resolve(dir, entry);
    } else {
      target = resolve(dir, rel);
    }
    const base = normalize(resolve(dir));
    const norm = normalize(target);
    // The directory itself is never served (only its entry file via the empty
    // <rel> branch above); `rel='.'`-style requests resolve back to `base`.
    if (norm === base) return null;
    if (norm.toLowerCase().startsWith(base.toLowerCase() + '\\')) return norm;
    return null;
  }

  for (const seg of ['media', 'preview']) {
    const prefix = `${BASE}/${seg}/`;
    disposers.push(webServer.register({
      kind: 'prefix',
      path: `${BASE}/${seg}`,
      handler: (req, res) => {
        const pathname = new URL(req.url || '/', 'http://x').pathname;
        const token = decodeURIComponent(pathname.slice(prefix.length));
        serveFile(resolveMediaToken(token), req, res);
      },
    }));
  }

  return () => {
    for (const d of disposers) { try { d(); } catch { /* ignore */ } }
    mediaMap.clear();
    inventoryCache = null;
  };
}
