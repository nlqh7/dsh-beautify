import fs, { createReadStream, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path, { basename, join, normalize, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import os from "node:os";
import { fileURLToPath } from "node:url";
//#region lib/types/wallpaper-engine.js
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
/** Steam appid for Wallpaper Engine. */
const WE_APPID = "431960";
/** Request path prefix under which this bundle's HTTP surface lives. */
const BASE = "/wallpaper-engine";
/** Common Steam install locations probed when libraryfolders.vdf is missing. */
const STEAM_PROBE_DIRS = [
	"C:\\Program Files (x86)\\Steam",
	"C:\\Program Files\\Steam",
	"D:\\Steam",
	"D:\\SteamLibrary",
	"E:\\SteamLibrary"
];
/** Steam root recorded by the Windows installer; the probe list misses custom dirs. */
function steamPathFromRegistry() {
	if (process.platform !== "win32") return null;
	try {
		const out = execFileSync(join(process.env.SystemRoot || "C:\\Windows", "System32", "reg.exe"), [
			"query",
			"HKCU\\Software\\Valve\\Steam",
			"/v",
			"SteamPath"
		], {
			encoding: "utf8",
			windowsHide: true,
			timeout: 5e3,
			stdio: [
				"ignore",
				"pipe",
				"ignore"
			]
		});
		const m = /SteamPath\s+REG_SZ\s+(.+)/i.exec(out);
		return m ? normalize(m[1].trim()) : null;
	} catch {
		return null;
	}
}
/** Probe list with the registered Steam root first, when it is known. */
function steamProbeDirs() {
	const reg = steamPathFromRegistry();
	return reg ? [reg, ...STEAM_PROBE_DIRS] : STEAM_PROBE_DIRS;
}
/** Valve KeyValues parser for libraryfolders.vdf: libraries owning WE. */
function librariesFromVdf(vdfPath) {
	const text = readFileSync(vdfPath, "utf8");
	const libs = [];
	let current = null;
	for (const line of text.split(/\r?\n/)) {
		const m = /^\s*"path"\s+"([^"]+)"\s*$/.exec(line);
		if (m) {
			current = m[1].replace(/\\\\/g, "\\");
			continue;
		}
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
		const vdf = join(probe, "steamapps", "libraryfolders.vdf");
		if (existsSync(vdf)) try {
			libraries.push(...librariesFromVdf(vdf));
		} catch {}
	}
	const roots = [...probes, ...libraries];
	for (const root of roots) candidates.push(join(root, "steamapps", "common", "wallpaper_engine"));
	candidates.push("C:\\Program Files (x86)\\Wallpaper Engine");
	const seen = /* @__PURE__ */ new Set();
	for (const raw of candidates) {
		const dir = normalize(raw);
		if (seen.has(dir)) continue;
		seen.add(dir);
		if (existsSync(join(dir, "wallpaper32.exe"))) return dir;
	}
	return null;
}
/** Libraries that own Wallpaper Engine (for the workshop content root). */
function owningLibraries() {
	const libs = [];
	for (const probe of steamProbeDirs()) {
		const vdf = join(probe, "steamapps", "libraryfolders.vdf");
		if (existsSync(vdf)) try {
			libs.push(...librariesFromVdf(vdf));
		} catch {}
		if (existsSync(join(probe, "steamapps", "common", "wallpaper_engine"))) libs.push(probe);
	}
	return [...new Set(libs)];
}
function inferType(file) {
	if (/\.(mp4|webm|mkv|avi|mov)$/i.test(file)) return "video";
	if (/\.(html?|js)$/i.test(file)) return "web";
	return "scene";
}
const KINDS = [
	"scene",
	"video",
	"web",
	"application"
];
/** Preview image fallbacks, in order, when project.json omits `preview`. */
const PREVIEW_FALLBACKS = [
	"preview.jpg",
	"preview.webp",
	"preview.png",
	"scene/preview.jpg",
	"scene/preview.webp",
	"scene/preview.png"
];
function readProject(dir) {
	const pj = join(dir, "project.json");
	if (!existsSync(pj)) return null;
	try {
		const o = JSON.parse(readFileSync(pj, "utf8"));
		if (!o || typeof o !== "object" || !o.file) return null;
		let type = typeof o.type === "string" ? o.type.toLowerCase() : inferType(o.file);
		if (!KINDS.includes(type)) type = "scene";
		let preview = typeof o.preview === "string" && o.preview ? o.preview : null;
		if (!preview) {
			for (const candidate of PREVIEW_FALLBACKS) if (existsSync(resolve(dir, candidate))) {
				preview = candidate;
				break;
			}
		}
		return {
			id: basename(dir),
			title: typeof o.title === "string" ? o.title : basename(dir),
			type,
			file: o.file,
			preview
		};
	} catch {
		return null;
	}
}
function enumerateWallpapers(installDir, libraryDirs) {
	const found = /* @__PURE__ */ new Map();
	const roots = [];
	if (installDir) for (const sub of ["defaultprojects", "myprojects"]) {
		const p = join(installDir, "projects", sub);
		if (existsSync(p)) roots.push(p);
	}
	for (const lib of libraryDirs) {
		const ws = join(lib, "steamapps", "workshop", "content", WE_APPID);
		if (existsSync(ws)) roots.push(ws);
	}
	for (const root of roots) {
		let entries = [];
		try {
			entries = readdirSync(root);
		} catch {
			continue;
		}
		for (const entry of entries) {
			const dir = join(root, entry);
			let st;
			try {
				st = statSync(dir);
			} catch {
				continue;
			}
			if (!st.isDirectory()) continue;
			const proj = readProject(dir);
			if (!proj || found.has(proj.id)) continue;
			proj.fileAbs = resolve(dir, proj.file);
			proj.previewAbs = proj.preview ? resolve(dir, proj.preview) : null;
			found.set(proj.id, proj);
		}
	}
	return [...found.values()].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
}
function pathKey(file) {
	return normalize(String(file).replace(/\//g, "\\")).toLowerCase();
}
function playlistId(profileName, index, name) {
	return Buffer.from(`${profileName}\0${index}\0${name}`, "utf8").toString("base64url");
}
function playlistRows(profile) {
	const general = profile && typeof profile === "object" ? profile.general : null;
	if (!general || typeof general !== "object") return [];
	if (Array.isArray(general.playlists) && general.playlists.length) return general.playlists;
	const selected = general.wallpaperconfig && general.wallpaperconfig.selectedwallpapers;
	if (!selected || typeof selected !== "object") return [];
	return Object.values(selected).map((monitor) => monitor && monitor.playlist).filter((playlist) => playlist && typeof playlist === "object");
}
function readPlaylists(installDir) {
	if (!installDir) return [];
	const configPath = join(installDir, "config.json");
	if (!existsSync(configPath)) return [];
	let config;
	try {
		config = JSON.parse(readFileSync(configPath, "utf8"));
	} catch {
		return [];
	}
	const result = [];
	const seen = /* @__PURE__ */ new Set();
	for (const [profileName, profile] of Object.entries(config || {})) for (const [index, row] of playlistRows(profile).entries()) {
		const items = Array.isArray(row.items) ? row.items.filter((item) => typeof item === "string" && item.trim()) : [];
		if (!items.length) continue;
		const name = typeof row.name === "string" && row.name.trim() ? row.name.trim() : `Playlist ${index + 1}`;
		const signature = `${name}\0${items.join("\0")}`;
		if (seen.has(signature)) continue;
		seen.add(signature);
		const settings = row.settings && typeof row.settings === "object" ? row.settings : {};
		result.push({
			id: playlistId(profileName, index, name),
			name,
			items,
			order: settings.order === "random" ? "random" : "sequence",
			delay: typeof settings.delay === "number" ? settings.delay : null
		});
	}
	return result;
}
function playlistItemId(item, byPath, byId) {
	const exact = byPath.get(pathKey(item));
	if (exact) return exact;
	const match = /[\\/]431960[\\/]([^\\/]+)(?:[\\/]|$)/i.exec(item);
	const project = match ? byId.get(match[1]) : null;
	if (project) return project.id;
	const folder = /[\\/]([^\\/]+)[\\/][^\\/]+$/i.exec(item);
	if (folder && byId.has(folder[1])) return folder[1];
	return null;
}
function mimeFor(absPath) {
	return {
		mp4: "video/mp4",
		webm: "video/webm",
		mkv: "video/x-matroska",
		avi: "video/x-msvideo",
		mov: "video/quicktime",
		html: "text/html",
		htm: "text/html",
		js: "text/javascript",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		gif: "image/gif",
		png: "image/png",
		webp: "image/webp"
	}[absPath.slice(absPath.lastIndexOf(".") + 1).toLowerCase()] || "application/octet-stream";
}
/**
* Hard-depend on `webServer` so the Loader waits for the HTTP server to mount
* before running this plugin. A ctx.get() at mount time is racy: rows mount
* concurrently and the webserver may not exist yet, which would silently skip
* route registration and let the SPA fallback answer every request. This bundle
* is web-only (its dsh.client declares platform "web"), so a hard injection is
* correct; it is simply not added to headless/TUI profiles.
*/
function registerWallpaperEngine(ctx) {
	const webServer = ctx.webServer;
	if (!webServer || typeof webServer.register !== "function") return () => {};
	const mediaMap = /* @__PURE__ */ new Map();
	const tokenFor = (absPath) => {
		const token = Buffer.from(absPath, "utf8").toString("base64url");
		mediaMap.set(token, absPath);
		return token;
	};
	function buildInventory() {
		const installDir = locateWallpaperEngine();
		const all = enumerateWallpapers(installDir, owningLibraries());
		const byPath = new Map(all.map((w) => [pathKey(w.fileAbs), w.id]));
		const byId = new Map(all.map((w) => [w.id, w]));
		const wallpapers = all.map((w) => {
			const hasMedia = w.type === "video" || w.type === "web" ? existsSync(w.fileAbs) : false;
			const hasPreview = w.previewAbs && existsSync(w.previewAbs);
			return {
				id: w.id,
				title: w.title,
				type: w.type,
				playable: hasMedia,
				media: hasMedia ? `${BASE}/media/${tokenFor(w.fileAbs)}` : null,
				preview: hasPreview ? `${BASE}/preview/${tokenFor(w.previewAbs)}` : null
			};
		});
		const playableIds = new Set(wallpapers.filter((w) => w.playable).map((w) => w.id));
		const playlists = readPlaylists(installDir).map((playlist) => {
			const ids = [];
			const seenIds = /* @__PURE__ */ new Set();
			for (const item of playlist.items) {
				const id = playlistItemId(item, byPath, byId);
				if (id && !seenIds.has(id)) {
					seenIds.add(id);
					ids.push(id);
				}
			}
			return {
				id: playlist.id,
				name: playlist.name,
				order: playlist.order,
				delay: playlist.delay,
				wallpaperIds: ids,
				total: ids.length,
				portableCount: ids.filter((id) => playableIds.has(id)).length,
				unresolvedCount: Math.max(0, playlist.items.length - ids.length)
			};
		});
		return {
			installDir,
			total: wallpapers.length,
			portableCount: wallpapers.filter((w) => w.playable).length,
			wallpapers,
			playlists
		};
	}
	const disposers = [];
	disposers.push(webServer.register({
		kind: "exact",
		path: `${BASE}/inventory`,
		handler: (req, res) => {
			try {
				const payload = JSON.stringify(buildInventory());
				res.setHeader("Content-Type", "application/json; charset=utf-8");
				res.setHeader("Cache-Control", "no-store");
				res.end(payload);
			} catch (err) {
				res.statusCode = 500;
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify({ error: String(err && err.message ? err.message : err) }));
			}
		}
	}));
	function serveFile(absPath, req, res) {
		if (!absPath || !existsSync(absPath)) {
			res.statusCode = 404;
			res.end("not found");
			return;
		}
		const st = statSync(absPath);
		res.setHeader("Content-Type", mimeFor(absPath));
		res.setHeader("Accept-Ranges", "bytes");
		const range = req.headers.range;
		if (range) {
			const m = /bytes=(\d*)-(\d*)/.exec(range);
			let start = m && m[1] ? parseInt(m[1], 10) : 0;
			let end = m && m[2] ? parseInt(m[2], 10) : st.size - 1;
			if (Number.isNaN(start)) start = 0;
			if (Number.isNaN(end) || end >= st.size) end = st.size - 1;
			if (start > end) {
				res.statusCode = 416;
				res.setHeader("Content-Range", `bytes */${st.size}`);
				res.end();
				return;
			}
			res.statusCode = 206;
			res.setHeader("Content-Range", `bytes ${start}-${end}/${st.size}`);
			res.setHeader("Content-Length", String(end - start + 1));
			createReadStream(absPath, {
				start,
				end
			}).pipe(res);
			return;
		}
		res.setHeader("Content-Length", String(st.size));
		createReadStream(absPath).pipe(res);
	}
	for (const seg of ["media", "preview"]) {
		const prefix = `${BASE}/${seg}/`;
		disposers.push(webServer.register({
			kind: "prefix",
			path: `${BASE}/${seg}`,
			handler: (req, res) => {
				const pathname = new URL(req.url || "/", "http://x").pathname;
				const token = decodeURIComponent(pathname.slice(prefix.length));
				serveFile(mediaMap.get(token), req, res);
			}
		}));
	}
	return () => {
		for (const d of disposers) try {
			d();
		} catch {}
		mediaMap.clear();
	};
}
//#endregion
//#region lib/types/whale-widget.js
const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DSH_HOME = process.env.DSH_HOME || path.join(os.homedir(), ".dsh");
const IMAGE_CANDIDATES = [
	path.join(PACKAGE_ROOT, "assets", "DSniang1.png"),
	"D:/TestBox/deepseek/DSniang1.png",
	"D:/TestBox/deepseek/DSniang02.png",
	"D:/TestBox/deepseek/skin/DSniang02.png"
];
const SIZE_FILE_CANDIDATES = [
	path.join(DSH_HOME, ".dshw-size.json"),
	path.join(DSH_HOME, "profiles", "web", ".dshw-size.json"),
	"D:/TestBox/deepseek/.dshw-size.json",
	"D:/TestBox/deepseek/skin/.dshw-size.json"
];
const USAGE_FILE_CANDIDATES = [
	path.join(DSH_HOME, ".dshw-usage.json"),
	path.join(DSH_HOME, "profiles", "web", ".dshw-usage.json"),
	"D:/TestBox/deepseek/.dshw-usage.json",
	"D:/TestBox/deepseek/skin/.dshw-usage.json"
];
const SOUND_SETS = {
	duck: {
		press: [path.join(PACKAGE_ROOT, "assets", "Ya1.mp3"), "D:/TestBox/deepseek/skin/Ya1.mp3"],
		release: [path.join(PACKAGE_ROOT, "assets", "Ya2.mp3"), "D:/TestBox/deepseek/skin/Ya2.mp3"]
	},
	fx1: {
		press: [path.join(PACKAGE_ROOT, "assets", "D1.mp3"), "D:/TestBox/deepseek/skin/D1.mp3"],
		release: [path.join(PACKAGE_ROOT, "assets", "D2.mp3"), "D:/TestBox/deepseek/skin/D2.mp3"]
	}
};
function soundSetFromUrl(url) {
	try {
		const q = String(url || "").split("?")[1] || "";
		const m = /(?:^|&)set=([^&]+)/.exec(q);
		return m ? decodeURIComponent(m[1]) : "";
	} catch (err) {
		return "";
	}
}
const BALANCE_URL = "https://api.deepseek.com/user/balance";
const BALANCE_TTL_MS = 25e3;
const PEAK_HOURS = [[9, 12], [14, 18]];
const BASE_PRICE = {
	hit: [.05, .1],
	miss: [1.5, 3],
	out: [4.5, 9]
};
const PRICING = {
	"deepseek-chat": BASE_PRICE,
	"deepseek-reasoner": BASE_PRICE,
	"deepseek-v4-flash": BASE_PRICE,
	"deepseek-v4-pro": BASE_PRICE,
	_default: BASE_PRICE
};
function priceFor(model) {
	const m = String(model || "").toLowerCase();
	for (const key of Object.keys(PRICING)) {
		if (key === "_default") continue;
		if (m.indexOf(key) !== -1) return PRICING[key];
	}
	return PRICING._default;
}
function isPeakTime(timeSec) {
	if (!isFinite(Number(timeSec))) return false;
	const hour = (/* @__PURE__ */ new Date(Number(timeSec) * 1e3 + 8 * 3600 * 1e3)).getUTCHours();
	for (const [start, end] of PEAK_HOURS) if (hour >= start && hour < end) return true;
	return false;
}
const JSON_HEADERS = {
	"Content-Type": "application/json; charset=utf-8",
	"Access-Control-Allow-Origin": "*",
	"Cache-Control": "no-store"
};
const WIDGET_JS = `(function () {
if (window.__dshWhaleWidget) return
window.__dshWhaleWidget = true

var MIN_SCALE = 0.6
var MAX_SCALE = 2.5
var STEP = 0.1
var CLICK_SQ = 9
var REFRESH_MS = 60000
var CHANGE_MS = 900
var ANIM_MS = 700
var BUBBLE_MS = 5000
var FETCH_TIMEOUT_MS = 25000
var BALANCE_URL = '/dsh-whale/balance.json'
var SIZE_URL = '/dsh-whale/size.json'
var IMG_URL = '/dsh-whale/image.png?v=2'
var css = [
  '.dshwv-root{position:fixed;right:0;bottom:0;--dshw-scale:1;--dshw-base:clamp(122px,calc(min(250px,min(100vw,100vh) * 0.28) * var(--dshw-scale)),625px);width:var(--dshw-base);height:var(--dshw-base);pointer-events:none;user-select:none;-webkit-user-select:none;z-index:9999;font-family:inherit;transition:left .16s ease,top .16s ease,transform .3s ease}',
  '.dshwv-root.dshwv-left{transform:scaleX(-1)}',
  '.dshwv-root.dshwv-dragging{cursor:grabbing;transition:none}',
  '.dshwv-body{position:absolute;left:0;top:0;width:100%;height:100%;transform-origin:50% 100%;transition:transform .22s cubic-bezier(.34,1.56,.64,1)}',
  '.dshwv-img{position:absolute;right:0;bottom:0;width:59.45%;height:59.45%;display:block;pointer-events:none;-webkit-user-drag:none;user-select:none}',
  '.dshwv-bubble{position:absolute;left:0;top:0;width:100%;aspect-ratio:1026/700;pointer-events:none;z-index:1}',
  '.dshwv-bubble svg{display:block;width:100%;height:100%;pointer-events:none}',
  '.dshwv-bubble svg path,.dshwv-bubble svg ellipse{pointer-events:none;cursor:pointer}',
  '.dshwv-bubble.dshwv-bubble-open svg path,.dshwv-bubble.dshwv-bubble-open svg ellipse{pointer-events:visiblePainted}',
  '.dshwv-bubble .dshwv-bshape,.dshwv-bubble .dshwv-b1,.dshwv-bubble .dshwv-b2{opacity:0;transform:scale(.7);transform-box:fill-box;transform-origin:50% 50%;transition:opacity .2s ease,transform .2s ease}',
  '.dshwv-bubble.dshwv-bubble-open .dshwv-bshape,.dshwv-bubble.dshwv-bubble-open .dshwv-b1,.dshwv-bubble.dshwv-bubble-open .dshwv-b2{opacity:1;transform:none}',
  '.dshwv-bubble.dshwv-bubble-open .dshwv-b2{transition-delay:0s}',
  '.dshwv-bubble.dshwv-bubble-open .dshwv-b1{transition-delay:.13s}',
  '.dshwv-bubble.dshwv-bubble-open .dshwv-bshape{transition-delay:.26s}',
  '.dshwv-bubble .dshwv-bshape{transition-delay:.1s}',
  '.dshwv-bubble .dshwv-b1{transition-delay:.2s}',
  '.dshwv-bubble .dshwv-b2{transition-delay:.3s}',
  '.dshwv-text{position:absolute;left:44.25%;top:38%;transform:translate(-50%,-50%);text-align:center;color:#536ba9;line-height:1.15;white-space:nowrap;--dshw-u:calc(var(--dshw-base) / 1026);pointer-events:none;opacity:0;transition:opacity .16s ease,transform .3s ease}',
  '.dshwv-bubble.dshwv-bubble-open .dshwv-text{opacity:1;transition:opacity .16s ease .36s,transform .3s ease}',
  '.dshwv-root.dshwv-left .dshwv-text{transform:translate(-50%,-50%) scaleX(-1)}',
  '.dshwv-label{font-size:calc(var(--dshw-u) * 66);font-weight:600;letter-spacing:.06em}',
  '.dshwv-amount{font-size:calc(var(--dshw-u) * 128);font-weight:800;line-height:1.05}',
  '.dshwv-period{font-size:calc(var(--dshw-u) * 104);font-weight:800;line-height:1.05}',
  '.dshwv-wrap{white-space:normal;max-width:calc(var(--dshw-u) * 560);line-height:1.2}',
  '.dshwv-hint{font-size:calc(var(--dshw-u) * 56);color:#9fb0d9;letter-spacing:.02em;margin-top:calc(var(--dshw-u) * 9)}',
  '.dshwv-menu-btn{position:absolute;top:calc(40.55% + 4px);right:4px;width:26px;height:26px;border:none;border-radius:6px;background:rgba(32,49,112,.85);cursor:pointer;pointer-events:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:0;z-index:2;opacity:0;transition:opacity .15s ease}',
  '.dshwv-menu-btn.dshwv-menu-btn-visible{opacity:1}',
  '.dshwv-menu-btn span{display:block;width:14px;height:2px;background:#fff;border-radius:1px}',
  '.dshwv-menu-btn:hover{background:#203170}',
  '.dshwv-menu{position:fixed;min-width:172px;background:rgba(255,255,255,.92);border:1px solid rgba(32,49,112,.35);border-radius:10px;padding:10px 12px;opacity:0;transform:scale(.92) translateY(-4px);transform-origin:top right;transition:opacity .18s ease,transform .2s cubic-bezier(.34,1.56,.64,1);pointer-events:none;z-index:10000;box-shadow:0 6px 18px rgba(0,0,0,.18);color-scheme:light}',
  '.dshwv-menu.dshwv-menu-open{opacity:1;transform:scale(1) translateY(0);pointer-events:auto}',
  '.dshwv-menu-row{display:flex;align-items:center;gap:8px;margin:5px 0;color:#203170;font-size:12px;white-space:nowrap}',
  '.dshwv-range{flex:1;min-width:0;accent-color:#203170}',
  '.dshwv-number{width:46px;border:1px solid rgba(32,49,112,.4);border-radius:6px;padding:2px 4px;font-size:12px;color:#203170;background:#fff}',
  '.dshwv-sound{flex:1;border:1px solid rgba(32,49,112,.4);border-radius:6px;background:rgba(32,49,112,.08);color:#203170;font-size:12px;padding:3px 0;cursor:pointer}',
  '.dshwv-sound:hover{background:rgba(32,49,112,.16)}',
  '.dshwv-volpct{width:36px;text-align:right;color:#203170;font-size:12px}',
  '.dshwv-baby{position:fixed;display:block;pointer-events:auto;cursor:grab;-webkit-user-drag:none;user-select:none;opacity:0;transform:scale(.82);transition:opacity .3s ease,transform .45s cubic-bezier(.34,1.56,.64,1);image-rendering:-webkit-optimize-contrast;z-index:9998}',
  '.dshwv-baby.dshwv-baby-in{opacity:1;transform:scale(1)}',
  '.dshwv-baby.dshwv-baby-dragging{cursor:grabbing;transition:none}',
  // 小鲸鱼自己报数的小气泡（弹跳入场 + 淡出）
  '.dshwv-baby-speech{position:fixed;z-index:10001;background:#fff;color:#203170;padding:5px 12px;border-radius:14px;font-size:13px;font-weight:600;line-height:1.2;box-shadow:0 4px 12px rgba(0,0,0,.18);pointer-events:none;transform:translateY(6px) scale(.82);opacity:0;transition:opacity .2s ease,transform .32s cubic-bezier(.34,1.56,.64,1);white-space:nowrap}',
  '.dshwv-baby-speech.dshwv-baby-speech-in{opacity:1;transform:translateY(0) scale(1)}',
  '.dshwv-baby-speech.dshwv-baby-speech-out{opacity:0;transform:translateY(-4px) scale(.94)}',
  // 点击回弹（q 弹）：主鲸鱼和子代理小鲸鱼共用，按下瞬间弹一下。
  '@keyframes dshwv-pet{0%{transform:scale(1)}35%{transform:scale(1.1,.9)}55%{transform:scale(.94,1.06)}75%{transform:scale(1.04,.97)}100%{transform:scale(1)}}',
  '.dshwv-img.dshwv-petting{animation:dshwv-pet .45s cubic-bezier(.34,1.56,.64,1)}',
  '.dshwv-baby.dshwv-baby-petting{animation:dshwv-pet .45s cubic-bezier(.34,1.56,.64,1);transform-origin:50% 100%}'
].join('\\n')

var styleEl = document.createElement('style')
styleEl.textContent = css
document.head.appendChild(styleEl)

var root = document.createElement('div')
root.className = 'dshwv-root'

var img = document.createElement('img')
img.className = 'dshwv-img'
img.src = IMG_URL
img.alt = 'DeepSeek 余额'
img.draggable = false

var menuBtn = document.createElement('button')
menuBtn.type = 'button'
menuBtn.className = 'dshwv-menu-btn'
menuBtn.title = '菜单'
menuBtn.innerHTML = '<span></span><span></span><span></span>'
menuBtn.addEventListener('click', function (e) { e.stopPropagation(); toggleMenu() })

var menuBox = document.createElement('div')
menuBox.className = 'dshwv-menu'
function menuLabel(text) {
  var s = document.createElement('span')
  s.textContent = text
  return s
}
function menuRow() {
  var r = document.createElement('div')
  r.className = 'dshwv-menu-row'
  return r
}
var scaleInput = document.createElement('input')
scaleInput.type = 'range'
scaleInput.min = String(MIN_SCALE)
scaleInput.max = String(MAX_SCALE)
scaleInput.step = '0.1'
scaleInput.className = 'dshwv-range'
scaleInput.value = '1.5'
var scaleNumber = document.createElement('input')
scaleNumber.type = 'number'
scaleNumber.min = '1'
scaleNumber.max = '20'
scaleNumber.step = '1'
scaleNumber.className = 'dshwv-number'
scaleNumber.value = '10'
scaleInput.addEventListener('pointerdown', function () { root.style.transition = 'none' })
scaleInput.addEventListener('input', function () { setScale(scaleInput.value) })
scaleInput.addEventListener('change', function () { root.style.transition = '' })
scaleNumber.addEventListener('change', function () {
  var v = Math.round(Number(scaleNumber.value))
  var s = MIN_SCALE + Math.max(0, Math.min(20, v) - 1) * (MAX_SCALE - MIN_SCALE) / 19
  setScale(s)
  root.style.transition = ''
})
var soundSelect = document.createElement('select')
soundSelect.className = 'dshwv-sound'
function soundOpt(value, label) {
  var o = document.createElement('option')
  o.value = value
  o.textContent = label
  return o
}
soundSelect.appendChild(soundOpt('duck', '小黄鸭'))
soundSelect.appendChild(soundOpt('fx1', '音效1'))
soundSelect.addEventListener('change', function () { setSoundSet(soundSelect.value) })
// 子代理声音独立开关（不影响主鲸鱼声音）
var babySoundBtn = document.createElement('button')
babySoundBtn.className = 'dshwv-sound'
babySoundBtn.textContent = '子代理声音：开'
babySoundBtn.addEventListener('click', function () { setBabySound(!babySound) })
var usageSelect = document.createElement('select')
usageSelect.className = 'dshwv-sound'
usageSelect.appendChild(soundOpt('ledger', '小鲸鱼记账 (推荐)'))
usageSelect.appendChild(soundOpt('token', '实时·令牌 (用法：去问dsh)'))
usageSelect.addEventListener('change', function () { setUsageMode(usageSelect.value) })
var row1 = menuRow()
row1.appendChild(menuLabel('大小'))
row1.appendChild(scaleInput)
row1.appendChild(scaleNumber)
var row2 = menuRow()
row2.appendChild(menuLabel('音效'))
row2.appendChild(soundSelect)
var rowBaby = menuRow()
rowBaby.appendChild(menuLabel('子代理'))
rowBaby.appendChild(babySoundBtn)
var volInput = document.createElement('input')
volInput.type = 'range'
volInput.min = '0'
volInput.max = '1'
volInput.step = '0.05'
volInput.className = 'dshwv-range'
volInput.value = '0.9'
var volPct = document.createElement('span')
volPct.className = 'dshwv-volpct'
volPct.textContent = '90%'
volInput.addEventListener('input', function () { setVol(volInput.value) })
var row3 = menuRow()
row3.appendChild(menuLabel('音量'))
row3.appendChild(volInput)
row3.appendChild(volPct)
var row4 = menuRow()
row4.appendChild(menuLabel('用量'))
row4.appendChild(usageSelect)
menuBox.appendChild(row1)
menuBox.appendChild(row2)
menuBox.appendChild(rowBaby)
menuBox.appendChild(row3)
menuBox.appendChild(row4)

var textBox = document.createElement('div')
textBox.className = 'dshwv-text'
var labelEl = document.createElement('div')
labelEl.className = 'dshwv-label'
labelEl.textContent = 'DeepSeek 余额'
var amountEl = document.createElement('div')
amountEl.className = 'dshwv-amount'
var hintEl = document.createElement('div')
hintEl.className = 'dshwv-hint'
textBox.appendChild(labelEl)
textBox.appendChild(amountEl)
textBox.appendChild(hintEl)

var bubbleBox = document.createElement('div')
bubbleBox.className = 'dshwv-bubble'
bubbleBox.innerHTML = '<svg viewBox="0 0 1026 700" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' +
  '<path class="dshwv-bshape" fill="#FFFFFF" stroke="#203170" stroke-width="18" stroke-linejoin="round" stroke-linecap="round" d="M 827 248 A 373 232 0 1 0 81 246 A 373 232 0 0 0 301 465 A 57 32 10 0 0 413 484 A 373 232 0 0 0 827 248 Z"/>' +
  '<ellipse class="dshwv-b1" cx="352" cy="561" rx="37.5" ry="26" fill="#FFFFFF" stroke="#203170" stroke-width="18"/>' +
  '<ellipse class="dshwv-b2" cx="442" cy="646" rx="24.5" ry="18" fill="#FFFFFF" stroke="#203170" stroke-width="18"/>' +
  '</svg>'
bubbleBox.appendChild(textBox)
bubbleBox.addEventListener('click', function (e) {
  e.stopPropagation()
  if (!bubbleShown) return
  if (bubbleRandomActive) {
    // 再次点击：关闭
    hideBubble()
  } else {
    // 首次点击：切到随机台词段（不延长总显示时长）
    bubbleRandomActive = true
    bubbleRandomLines = pickRandomLines()
    swapBubbleContent(function () { applyBubbleLines(bubbleRandomLines) })
  }
})

var body = document.createElement('div')
body.className = 'dshwv-body'
body.appendChild(img)
body.appendChild(bubbleBox)
root.appendChild(body)
root.appendChild(menuBtn)
document.body.appendChild(root)
document.body.appendChild(menuBox)

// Position model: the widget is ALWAYS expressed in left/top px (so edge snaps
// animate smoothly via the CSS transition on both sides — switching to
// right/auto cannot transition and flashes). The anchor info (h/v + offsets)
// lives in state and is used by settle() to recompute coordinates on window
// resize and size changes, keeping the widget glued to its anchored edge.
var state = {
  scale: 1.5,
  h: 'right',
  hOff: 0,
  v: 'bottom',
  vOff: 0,
  left: 0,
  top: 0,
  balance: null,
  currency: null,
  todayUsage: null,
  isPeak: false,
  status: 'loading',
  message: ''
}
var busy = false
var settleTimer = null
var animDelayTimer = null
var drag = null
var shown = null
var animId = null
var bubbleShown = false
var bubbleTimer = null
var bubbleRandomActive = false
var bubbleRandomLines = null
var BUBBLE_STYLE_CLASS = { A: 'dshwv-label', B: 'dshwv-amount', P: 'dshwv-period', C: 'dshwv-hint' }
function pickOne(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function singleCenter(style, text, color, wrap) { return [null, { t: text, s: style, c: color || '', w: !!wrap }, null] }
function buildGroup1() {
  var peak = !!state.isPeak
  return [
    { t: '当前时间段为:', s: 'A', c: '' },
    { t: peak ? '高峰时段' : '空闲时段', s: 'P', c: peak ? '#e0433f' : '#2fa24c' },
    { t: '今日已用 ' + fmt(state.todayUsage, state.currency), s: 'C', c: '' },
  ]
}
var RANDOM_GROUPS = [
  { w: 20, lines: buildGroup1 },
  { w: 7, lines: function () { return singleCenter('B', pickOne(['好模型... ↓', '好女孩...↓'])) } },
  { w: 7, lines: function () { return singleCenter('A', pickOne(['不知道用户有什么用，先赶走吧~', '我...我...我也要挣钱吗？', '我去吃饭啦，测完叫我', '压力一只蓝色大肥鱼？！', 'DeepSleep...', '坏了...用户彻底怒了！']), '', true) } },
  { w: 3, lines: function () { return singleCenter('A', pickOne(['你目录里的dsh是什么...大烧货吗...?', '恭喜你实现token自由！token全跑了！', '真当我是便宜货啊...']), '', true) } },
  { w: 1, lines: function () { return [{ t: '这个', s: 'A', c: '' }, { t: '凶', s: 'B', c: '' }, { t: '是什么意思呀...', s: 'A', c: '' }] } },
  { w: 1, lines: function () { return singleCenter('B', '哦鲸鲸... ') } },
]
function pickRandomLines() {
  var total = 0
  for (var i = 0; i < RANDOM_GROUPS.length; i++) total += RANDOM_GROUPS[i].w
  var r = Math.random() * total
  for (var i = 0; i < RANDOM_GROUPS.length; i++) {
    r -= RANDOM_GROUPS[i].w
    if (r < 0) return RANDOM_GROUPS[i].lines()
  }
  return RANDOM_GROUPS[RANDOM_GROUPS.length - 1].lines()
}
function applyBubbleLines(lines) {
  var els = [labelEl, amountEl, hintEl]
  for (var i = 0; i < 3; i++) {
    var el = els[i]
    var ln = lines && lines[i]
    if (ln) {
      el.style.display = ''
      el.className = (BUBBLE_STYLE_CLASS[ln.s] || 'dshwv-label') + (ln.w ? ' dshwv-wrap' : '')
      el.textContent = ln.t
      el.style.color = ln.c || ''
    } else {
      el.style.display = 'none'
      el.textContent = ''
      el.style.color = ''
    }
  }
}
var bubbleSwapTimer = null
var hintFadeTimer = null
var lastHintText = null
function setHint(text) {
  // 「加载中…」→「今日已用」等提示行变化时做淡出淡入，其余直接替换
  if (text === lastHintText) return
  lastHintText = text
  if (hintFadeTimer) { clearTimeout(hintFadeTimer); hintFadeTimer = null }
  if (!bubbleShown) {
    hintEl.textContent = text
    return
  }
  hintEl.style.transition = 'opacity .18s ease'
  hintEl.style.opacity = '0'
  hintFadeTimer = setTimeout(function () {
    hintFadeTimer = null
    hintEl.textContent = text
    hintEl.style.opacity = '1'
    setTimeout(function () {
      hintEl.style.transition = ''
      hintEl.style.opacity = ''
    }, 220)
  }, 190)
}
function swapBubbleContent(applyFn) {
  if (bubbleSwapTimer) { clearTimeout(bubbleSwapTimer); bubbleSwapTimer = null }
  textBox.style.transition = 'opacity .18s ease'
  textBox.style.opacity = '0'
  bubbleSwapTimer = setTimeout(function () {
    bubbleSwapTimer = null
    applyFn()
    textBox.style.opacity = '1'
    setTimeout(function () {
      textBox.style.transition = ''
      textBox.style.opacity = ''
    }, 220)
  }, 190)
}
function restoreBubbleLines() {
  if (bubbleSwapTimer) { clearTimeout(bubbleSwapTimer); bubbleSwapTimer = null }
  if (hintFadeTimer) { clearTimeout(hintFadeTimer); hintFadeTimer = null }
  lastHintText = null
  textBox.style.transition = ''
  textBox.style.opacity = ''
  labelEl.style.display = ''
  labelEl.className = 'dshwv-label'
  labelEl.textContent = 'DeepSeek 余额'
  labelEl.style.color = ''
  amountEl.className = 'dshwv-amount'
  amountEl.style.color = ''
  hintEl.className = 'dshwv-hint'
  hintEl.style.color = ''
  render()
}
function showBubble() {
  if (bubbleTimer) { clearTimeout(bubbleTimer); bubbleTimer = null }
  bubbleShown = true
  bubbleRandomActive = false
  restoreBubbleLines()
  bubbleBox.classList.add('dshwv-bubble-open')
  // 默认展示当前内容；点击气泡切到随机台词段；总时长 5 秒自动关闭
  bubbleTimer = setTimeout(hideBubble, BUBBLE_MS)
}
function hideBubble() {
  if (bubbleTimer) { clearTimeout(bubbleTimer); bubbleTimer = null }
  if (bubbleSwapTimer) { clearTimeout(bubbleSwapTimer); bubbleSwapTimer = null }
  if (hintFadeTimer) { clearTimeout(hintFadeTimer); hintFadeTimer = null }
  textBox.style.transition = ''
  textBox.style.opacity = ''
  hintEl.style.transition = ''
  hintEl.style.opacity = ''
  bubbleRandomActive = false
  bubbleRandomLines = null
  bubbleShown = false
  bubbleBox.classList.remove('dshwv-bubble-open')
}

function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v) }
function viewport() {
  return {
    w: window.innerWidth || document.documentElement.clientWidth || 1280,
    h: window.innerHeight || document.documentElement.clientHeight || 800
  }
}
function fmt(balance, currency) {
  var num = Number(balance)
  var fixed = isFinite(num) ? num.toFixed(2) : '--'
  return currency === 'CNY' ? '¥ ' + fixed : fixed + ' ' + currency
}
function animateAmount(from, to, currency, duration) {
  if (animId) cancelAnimationFrame(animId)
  if (from === null || !isFinite(from)) from = to
  if (from === to) {
    shown = to
    amountEl.textContent = fmt(to, currency)
    return
  }
  var startTime = null
  function step(ts) {
    if (startTime === null) startTime = ts
    var t = Math.min(1, (ts - startTime) / duration)
    var eased = 1 - Math.pow(1 - t, 3)
    var val = from + (to - from) * eased
    amountEl.textContent = fmt(val, currency)
    if (t < 1) {
      animId = requestAnimationFrame(step)
    } else {
      animId = null
      shown = to
      amountEl.textContent = fmt(to, currency)
    }
  }
  animId = requestAnimationFrame(step)
}
function render() {
  var amount, hint
  if (state.status === 'error') {
    amount = shown !== null ? fmt(shown, state.currency) : '--'
    hint = state.message ? state.message.slice(0, 14) : '获取失败 · 点击重试'
  } else if (state.balance === null) {
    amount = shown !== null ? fmt(shown, state.currency) : '…'
    hint = '加载中…'
  } else {
    amount = shown !== null ? fmt(shown, state.currency) : fmt(state.balance, state.currency)
    hint = '今日已用 ' + (state.todayUsage !== null && state.todayUsage !== undefined ? fmt(state.todayUsage, state.currency) : '--')
  }
  amountEl.textContent = amount
  if (bubbleRandomActive && bubbleRandomLines) {
    applyBubbleLines(bubbleRandomLines)
  } else {
    setHint(hint)
  }
}
function express() {
  root.style.right = 'auto'
  root.style.bottom = 'auto'
  root.style.left = state.left + 'px'
  root.style.top = state.top + 'px'
  root.classList.toggle('dshwv-left', state.h === 'left')
  // 主鲸鱼移动/翻转时让子代理小鲸鱼跟着环绕重排
  layoutBabies()
}
function settle() {
  var vp = viewport()
  var w = root.offsetWidth || root.getBoundingClientRect().width || 0
  var h = root.offsetHeight || root.getBoundingClientRect().height || 0
  if (drag && drag.active) {
    // mid-drag resize: keep the pointer-follow position, just clamp into view
    state.left = clamp(state.left, 0, Math.max(0, vp.w - w))
    state.top = clamp(state.top, 0, Math.max(0, vp.h - h))
    express()
    return
  }
  if (state.h === 'right') {
    state.left = Math.max(0, vp.w - w - state.hOff)
  } else if (state.h === 'left') {
    state.left = state.hOff
  } else {
    state.left = clamp(state.left, 0, Math.max(0, vp.w - w))
  }
  if (state.v === 'bottom') {
    state.top = Math.max(0, vp.h - h - state.vOff)
  } else if (state.v === 'top') {
    state.top = state.vOff
  } else {
    state.top = clamp(state.top, 0, Math.max(0, vp.h - h))
  }
  express()
}
function refresh(manual) {
  if (busy) return
  busy = true
  if (animDelayTimer) { clearTimeout(animDelayTimer); animDelayTimer = null }
  if (manual || state.balance === null) { state.status = 'loading'; render() }
  var ctrl = null
  var timer = null
  try {
    ctrl = new AbortController()
    timer = setTimeout(function () { try { ctrl.abort() } catch (err) {} }, FETCH_TIMEOUT_MS)
  } catch (err) {}
  fetch(BALANCE_URL, { cache: 'no-store', signal: ctrl ? ctrl.signal : undefined })
    .then(function (r) { return r.json() })
    .then(function (data) {
      if (data && data.ok) {
        var nb = Number(data.totalBalance)
        var nc = String(data.currency || 'CNY')
        var changed = state.balance !== null && (nb !== state.balance || nc !== state.currency)
        var currencyChanged = state.currency !== null && nc !== state.currency
        state.balance = nb
        state.currency = nc
        state.message = ''
        state.todayUsage = data.todayUsage !== undefined ? data.todayUsage : null
        state.isPeak = !!data.isPeak
        if (changed && !currencyChanged) {
          if (!manual) {
            showBubble()
            state.status = 'changing'
            // balance-change bubble: wait 0.3s after it floats out, then roll the number
            if (animDelayTimer) clearTimeout(animDelayTimer)
            animDelayTimer = setTimeout(function () {
              animDelayTimer = null
              animateAmount(shown, nb, nc, ANIM_MS)
            }, 300)
            if (settleTimer) clearTimeout(settleTimer)
            settleTimer = setTimeout(function () {
              settleTimer = null
              if (state.status === 'changing') { state.status = 'ok'; render() }
            }, CHANGE_MS + 300)
          } else {
            animateAmount(shown, nb, nc, ANIM_MS)
            state.status = 'ok'
            render()
          }
        } else {
          if (animId === null) shown = nb
          state.status = 'ok'
          render()
        }
      } else {
        state.status = 'error'
        state.message = (data && data.error) ? String(data.error) : '获取失败'
        render()
      }
    })
    .catch(function () {
      state.status = 'error'
      state.message = '获取失败'
      render()
    })
    .finally(function () {
      busy = false
      if (timer) clearTimeout(timer)
    })
}
var soundOn = true
var soundVol = 0.9
var soundSet = 'duck'
// 子代理小鲸鱼声音独立开关（报到/离开叫声）；主鲸鱼声音由 soundOn/soundVol 控制。
var babySound = true
var usageMode = 'ledger'
function saveConfig() {
  try {
    fetch(SIZE_URL, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scale: state.scale, sound: soundOn, vol: soundVol, soundSet: soundSet, usageMode: usageMode, babySound: babySound }) })
  } catch (err) {}
}
function setBabySound(v) {
  babySound = !!v
  babySoundBtn.textContent = '子代理声音：' + (babySound ? '开' : '关')
  saveConfig()
}
function setUsageMode(v) {
  usageMode = v === 'token' ? 'token' : 'ledger'
  usageSelect.value = usageMode
  saveConfig()
  refresh(false)
}
function scaleToDisplay(s) {
  return Math.round((s - MIN_SCALE) / ((MAX_SCALE - MIN_SCALE) / 19)) + 1
}
function setScale(v) {
  var next = Math.round(Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(v))) * 10) / 10
  var rect = root.getBoundingClientRect()
  // fixed point: the whale's corner — bottom-right when unflipped, bottom-left
  // when flipped. Growing extends the widget up-left / up-right from that
  // corner; shrinking pulls it back toward the corner. The whale always hugs
  // its corner while scaling.
  var fx = state.h === 'left' ? rect.left : rect.right
  var fy = rect.bottom
  state.scale = next
  root.style.setProperty('--dshw-scale', String(next))
  scaleInput.value = String(next)
  scaleNumber.value = String(scaleToDisplay(next))
  saveConfig()
  // keep the corner fixed while resizing; the position correction applies
  // instantly because the caller disables the transition for the whole drag
  var r2 = root.getBoundingClientRect()
  var vp = viewport()
  if (state.h === 'left') {
    state.left = Math.min(Math.max(fx, 0), Math.max(0, vp.w - r2.width))
  } else {
    state.left = Math.min(Math.max(fx - r2.width, 0), Math.max(0, vp.w - r2.width))
  }
  state.top = Math.min(Math.max(fy - r2.height, 0), Math.max(0, vp.h - r2.height))
  express()
}
function setVol(v) {
  var next = Math.round(Math.min(1, Math.max(0, Number(v))) * 100) / 100
  soundVol = next
  soundOn = next > 0
  volInput.value = String(next)
  volPct.textContent = Math.round(next * 100) + '%'
  try {
    if (pressAudio) pressAudio.volume = next
    if (releaseAudio) releaseAudio.volume = next
  } catch (err) {}
  saveConfig()
}
function setSoundSet(v) {
  soundSet = v === 'fx1' ? 'fx1' : 'duck'
  soundSelect.value = soundSet
  applySoundSet()
  saveConfig()
}
var SQUISH = 'scaleY(0.88) scaleX(1.05)'
var pressAudio = null
var releaseAudio = null
var pressing = false
var pressEnded = false
var releasePlayed = false
var releaseTimer = null
function applySoundSet() {
  try {
    pressAudio = new Audio('/dsh-whale/sound/press.mp3?set=' + soundSet)
    pressAudio.preload = 'auto'
    pressAudio.volume = soundVol
    releaseAudio = new Audio('/dsh-whale/sound/release.mp3?set=' + soundSet)
    releaseAudio.preload = 'auto'
    releaseAudio.volume = soundVol
    babyCryAudio = null
    babyCryLeaveAudio = null
  } catch (err) {}
}
var babyCryAudio = null
var babyCryLeaveAudio = null
// 子代理报到叫声（press 音效），受「子代理声音」独立开关控制。
function playBabyCry() {
  if (!soundOn || !babySound) return
  try {
    if (!babyCryAudio) {
      babyCryAudio = new Audio('/dsh-whale/sound/press.mp3?set=' + soundSet)
      babyCryAudio.volume = soundVol
    }
    babyCryAudio.currentTime = 0
    var p = babyCryAudio.play()
    if (p && typeof p.catch === 'function') p.catch(function () {})
  } catch (err) {}
}
// 子代理离开叫声（release 音效，和报到的 press 区分开）。
function playBabyCryLeaving() {
  if (!soundOn || !babySound) return
  try {
    if (!babyCryLeaveAudio) {
      babyCryLeaveAudio = new Audio('/dsh-whale/sound/release.mp3?set=' + soundSet)
      babyCryLeaveAudio.volume = soundVol
    }
    babyCryLeaveAudio.currentTime = 0
    var p = babyCryLeaveAudio.play()
    if (p && typeof p.catch === 'function') p.catch(function () {})
  } catch (err) {}
}
function playPress() {
  if (!pressAudio || !soundOn) return
  try {
    if (releaseTimer) { clearTimeout(releaseTimer); releaseTimer = null }
    if (releaseAudio) {
      releaseAudio.pause()
      releaseAudio.currentTime = 0
    }
    pressEnded = false
    releasePlayed = false
    pressAudio.onended = function () {
      pressEnded = true
      // fallback (duration unknown): click → Ya2 right after Ya1 ends
      if (!pressing && !releasePlayed) playRelease()
      // hold: still pressed → wait for pressUp()
    }
    pressAudio.currentTime = 0
    var p = pressAudio.play()
    if (p && typeof p.catch === 'function') p.catch(function () {})
  } catch (err) {}
}
function playRelease() {
  if (releasePlayed || !releaseAudio || !soundOn) return
  releasePlayed = true
  try {
    releaseAudio.currentTime = 0
    var p = releaseAudio.play()
    if (p && typeof p.catch === 'function') p.catch(function () {})
  } catch (err) {}
}
// 点击回弹工具：给目标元素加弹跳动画 class（480ms 后移除），
// 强制 reflow 保证连续点击也能重新触发。
function petBounce(el) {
  if (!el) return
  try {
    el.classList.remove('dshwv-petting', 'dshwv-baby-petting')
    void el.offsetWidth
    el.classList.add(el.classList.contains('dshwv-baby') ? 'dshwv-baby-petting' : 'dshwv-petting')
    setTimeout(function () {
      try { el.classList.remove('dshwv-petting', 'dshwv-baby-petting') } catch (err) {}
    }, 480)
  } catch (err) {}
}
function pressDown() {
  body.style.transform = SQUISH
  pressing = true
  playPress()
}
function pressUp() {
  body.style.transform = 'scaleY(1) scaleX(1)'
  pressing = false
  if (pressEnded) {
    // hold (or released after Ya1 finished) → Ya2 now
    playRelease()
    return
  }
  // click: start Ya2 in the last 100ms of Ya1's playback
  var durKnown = false
  var remainMs = 0
  try {
    var dur = pressAudio ? pressAudio.duration : 0
    if (isFinite(dur) && dur > 0) {
      durKnown = true
      remainMs = (dur - pressAudio.currentTime) * 1000
    }
  } catch (err) {}
  if (durKnown) {
    releaseTimer = setTimeout(function () {
      releaseTimer = null
      playRelease()
    }, Math.max(0, remainMs - 100))
  }
  // duration unknown → pressAudio.onended fallback plays Ya2 after Ya1 ends
}
var menuOpen = false
function toggleMenu() {
  menuOpen = !menuOpen
  if (menuOpen) positionMenu()
  menuBox.classList.toggle('dshwv-menu-open', menuOpen)
  if (menuOpen) menuBtn.classList.add('dshwv-menu-btn-visible')
}
function closeMenu() {
  menuOpen = false
  menuBox.classList.remove('dshwv-menu-open')
  root.style.transition = ''
  snapCheck()
}
function snapCheck() {
  var rect = root.getBoundingClientRect()
  var vp = viewport()
  var w = rect.width, h = rect.height
  var left = rect.left, top = rect.top
  var centerX = left + w / 2
  var centerY = top + h / 2
  var moved = false
  if (centerX < vp.w / 4) {
    state.h = 'left'
    state.hOff = 0
    left = 0
    moved = true
  } else if (centerX > vp.w * 3 / 4) {
    state.h = 'right'
    state.hOff = 0
    left = vp.w - w
    moved = true
  } else {
    state.h = null
    state.hOff = left
  }
  if (centerY < vp.h / 4) {
    state.v = 'top'
    state.vOff = 0
    top = 0
    moved = true
  } else {
    state.v = 'bottom'
    state.vOff = Math.max(0, vp.h - top - h)
  }
  if (moved) {
    state.left = left
    state.top = top
    settle()
  }
}
function positionMenu() {
  try {
    var r = root.getBoundingClientRect()
    var b = menuBtn.getBoundingClientRect()
    var vp = viewport()
    var onLeft = r.left + r.width / 2 < vp.w / 2
    // the menu appears ABOVE the button, anchored to its side:
    // right side → menu bottom-right aligns with the button's top-right;
    // left side → menu bottom-left aligns with the button's top-left
    if (onLeft) {
      menuBox.style.left = b.left + 'px'
      menuBox.style.right = 'auto'
      menuBox.style.transformOrigin = 'bottom left'
    } else {
      menuBox.style.right = (vp.w - b.right) + 'px'
      menuBox.style.left = 'auto'
      menuBox.style.transformOrigin = 'bottom right'
    }
    menuBox.style.bottom = (vp.h - b.top) + 'px'
    menuBox.style.top = 'auto'
  } catch (err) {}
}

var hitCanvas = null
var hitReady = false
function setupHitTest() {
  try {
    hitCanvas = document.createElement('canvas')
    hitCanvas.width = 610
    hitCanvas.height = 610
    var probe = new Image()
    probe.onload = function () {
      try {
        hitCanvas.getContext('2d').drawImage(probe, 0, 0)
        hitReady = true
      } catch (err) {}
    }
    probe.onerror = function () {}
    probe.src = IMG_URL
  } catch (err) {}
}
function isWhaleHit(e) {
  if (!hitCanvas || !hitReady) return true
  try {
    var r = img.getBoundingClientRect()
    if (!r || r.width <= 0 || r.height <= 0) return false
    var lx = (e.clientX - r.left) / r.width * 610
    var ly = (e.clientY - r.top) / r.height * 610
    if (lx < 0 || ly < 0 || lx >= 610 || ly >= 610) return false
    if (state.h === 'left') lx = 610 - lx
    var data = hitCanvas.getContext('2d').getImageData(Math.floor(lx), Math.floor(ly), 1, 1).data
    return data[3] > 10
  } catch (err) {
    return true
  }
}
function onDocPointerDown(e) {
  if (e.target && e.target.closest) {
    if (e.target.closest('.dshwv-bubble') || e.target.closest('.dshwv-menu') || e.target.closest('.dshwv-menu-btn')) return
  }
  if (menuOpen) {
    closeMenu()
    return
  }
  if (e.button !== 0 && e.pointerType === 'mouse') return
  if (!isWhaleHit(e)) return
  try { e.preventDefault(); e.stopPropagation() } catch (err) {}
  var vp = viewport()
  var rect = root.getBoundingClientRect()
  drag = { active: true, startX: e.clientX, startY: e.clientY, origLeft: rect.left, origTop: rect.top, w: rect.width, h: rect.height, moved: false, vp: vp }
  root.classList.add('dshwv-dragging')
  pressDown()
  // 点击回弹：按下瞬间主鲸鱼弹一下（q 弹），配合 pressDown 的压扁动画
  petBounce(document.querySelector('.dshwv-img'))
  setWidgetCursor('grabbing')
  document.addEventListener('pointermove', onDocPointerMove, true)
  document.addEventListener('pointerup', onDocPointerUp, true)
  document.addEventListener('pointercancel', onDocPointerCancel, true)
  document.addEventListener('click', onDocClickStopper, true)
}
function onDocPointerMove(e) {
  if (!drag || !drag.active) return
  var dx = e.clientX - drag.startX
  var dy = e.clientY - drag.startY
  if (dx * dx + dy * dy >= CLICK_SQ) drag.moved = true
  // Keep the pre-drag flip orientation while dragging (state.h/v stay as they
  // were); on release endDrag() recomputes the anchors and settle() flips the
  // class with a smooth transition instead of reverting instantly.
  state.left = clamp(drag.origLeft + dx, 0, Math.max(0, drag.vp.w - drag.w))
  state.top = clamp(drag.origTop + dy, 0, Math.max(0, drag.vp.h - drag.h))
  express()
}
function onDocPointerUp(e) { endDrag(e, true) }
function onDocPointerCancel(e) { endDrag(e, false) }
function onDocClickStopper(e) {
  try { e.preventDefault(); e.stopPropagation() } catch (err) {}
}
document.addEventListener('pointerdown', onDocPointerDown, true)

var widgetCursor = ''
function setWidgetCursor(v) {
  if (v !== widgetCursor) {
    widgetCursor = v
    try { document.body.style.cursor = v } catch (err) {}
  }
}
function onDocPointerMoveCursor(e) {
  if (drag && drag.active) { setWidgetCursor('grabbing'); return }
  if (babyDrag && babyDrag.active) { setWidgetCursor('grabbing'); return }
  if (isBabyHit(e)) {
    // 摸到子代理小鲸鱼：系统手型（摸头标记由独立监听负责）
    setWidgetCursor('grab')
    menuBtn.classList.remove('dshwv-menu-btn-visible')
    return
  }
  var el = null
  try { el = document.elementFromPoint(e.clientX, e.clientY) } catch (err) {}
  if (el && el.closest && (el.closest('.dshwv-bubble') || el.closest('.dshwv-menu') || el.closest('.dshwv-menu-btn'))) {
    setWidgetCursor('')
    menuBtn.classList.add('dshwv-menu-btn-visible')
    return
  }
  var over = isWhaleHit(e)
  setWidgetCursor(over ? 'grab' : '')
  menuBtn.classList.toggle('dshwv-menu-btn-visible', over || menuOpen)
}
document.addEventListener('pointermove', onDocPointerMoveCursor, true)

function endDrag(e, clickAllowed) {
  if (!drag || !drag.active) return
  drag.active = false
  document.removeEventListener('pointermove', onDocPointerMove, true)
  document.removeEventListener('pointerup', onDocPointerUp, true)
  document.removeEventListener('pointercancel', onDocPointerCancel, true)
  document.removeEventListener('click', onDocClickStopper, true)
  pressUp()
  root.classList.remove('dshwv-dragging')
  setWidgetCursor(isWhaleHit(e) ? 'grab' : '')
  if (clickAllowed && !drag.moved) { showBubble(); refresh(true); return }
  var dx = e.clientX - drag.startX
  var dy = e.clientY - drag.startY
  var left = clamp(drag.origLeft + dx, 0, Math.max(0, drag.vp.w - drag.w))
  var top = clamp(drag.origTop + dy, 0, Math.max(0, drag.vp.h - drag.h))
  var centerX = left + drag.w / 2
  var centerY = top + drag.h / 2
  if (centerX < drag.vp.w / 4) {
    state.h = 'left'
    state.hOff = 0
  } else if (centerX > drag.vp.w * 3 / 4) {
    state.h = 'right'
    state.hOff = 0
  } else {
    state.h = null
    state.hOff = left
  }
  if (centerY < drag.vp.h / 4) {
    state.v = 'top'
    state.vOff = 0
  } else if (centerY > drag.vp.h * 3 / 4) {
    state.v = 'bottom'
    state.vOff = 0
  } else {
    state.v = null
    state.vOff = top
  }
  state.left = left
  state.top = top
  settle()
}
window.addEventListener('resize', function () {
  settle()
})

var rect0 = root.getBoundingClientRect()
state.left = rect0.left
state.top = rect0.top
express()
render()
applySoundSet()
setupHitTest()
fetch(SIZE_URL, { cache: 'no-store' })
  .then(function (r) { return r.json() })
  .then(function (d) {
    if (d && typeof d.scale === 'number' && d.scale >= MIN_SCALE - 0.1 && d.scale <= MAX_SCALE + 0.1) {
      state.scale = d.scale
      root.style.setProperty('--dshw-scale', String(d.scale))
      scaleInput.value = String(d.scale)
      scaleNumber.value = String(scaleToDisplay(d.scale))
      settle()
    }
    if (d && typeof d.vol === 'number') {
      soundVol = d.vol
      soundOn = soundVol > 0
      volInput.value = String(soundVol)
      volPct.textContent = Math.round(soundVol * 100) + '%'
      try {
        if (pressAudio) pressAudio.volume = soundVol
        if (releaseAudio) releaseAudio.volume = soundVol
      } catch (err) {}
    }
    if (d && typeof d.soundSet === 'string') {
      soundSet = d.soundSet === 'fx1' ? 'fx1' : 'duck'
      soundSelect.value = soundSet
      applySoundSet()
    }
    if (d && typeof d.babySound === 'boolean') {
      babySound = d.babySound
      babySoundBtn.textContent = '子代理声音：' + (babySound ? '开' : '关')
    }
    if (d && typeof d.usageMode === 'string') {
      usageMode = d.usageMode === 'token' ? 'token' : 'ledger'
      usageSelect.value = usageMode
    }
    refresh(false)
  })
  .catch(function () { refresh(false) })
setInterval(function () { refresh(false) }, REFRESH_MS)

// 摸头标记：指针停留在小鲸鱼图形上时，在 <html> 上打 data-dsh-whale-hover，
// 鲸鱼光标据此把当前状态切为「链接手型」（摸头 = 手）。像素检测只在小鲸鱼
// 矩形范围内触发，平时只做矩形快速排除。
var lastWhaleHit = false
// 指针是否在某只子代理小鲸鱼的矩形内（独立个体，直接用坐标判断，
// 不依赖 elementFromPoint——元素命中受 z-index/透明区域影响，rect 更稳）。
// 返回命中的小鲸鱼元素（null = 没摸到），供摸头回弹动画定位目标。
function isBabyHit(e) {
  var found = null
  if (!babyWhales) return null
  babyWhales.forEach(function (el) {
    if (found || !el) return
    try {
      var r = el.getBoundingClientRect()
      if (r && r.width > 0 && r.height > 0 &&
        e.clientX >= r.left && e.clientX <= r.right &&
        e.clientY >= r.top && e.clientY <= r.bottom) found = el
    } catch (err) {}
  })
  return found
}
document.addEventListener('pointermove', function (e) {
  var hit = isWhaleHit(e) || isBabyHit(e) !== null
  if (hit === lastWhaleHit) return
  lastWhaleHit = hit
  try {
    if (hit) document.documentElement.setAttribute('data-dsh-whale-hover', '')
    else document.documentElement.removeAttribute('data-dsh-whale-hover')
  } catch (err) {}
}, { passive: true })

var babyWhales = new Map()
var babySeq = 0
// 被用户手动拖动过的子代理小鲸鱼：保持手动位置，不再参与自动排列。
var babyManual = new Set()
// 碰撞箱 = 角色视觉主体（脸+身体），不算两侧头发飘逸、呆毛/衣领下方
// 阴影。DSniang1.png 女仆头像有效内容主要集中在中央脸+衣领（约 50% 宽）
// + 头两侧飘出的头发；裁切到中央约 50%×60% 才是"看上去的角色大小"。
function collideBox(l, t, w, h) {
  var cutL = 0.25, cutR = 0.25, cutT = 0.15, cutB = 0.25
  return {
    l: l + w * cutL,
    t: t + h * cutT,
    r: l + w * (1 - cutR),
    b: t + h * (1 - cutB),
  }
}
// 碰撞箱 = 角色实体区域（collideBox），挤压时沿最小穿透方向推开
// （物理分离），不是卡住不能动。障碍 = 主鲸鱼 + 其他小鲸鱼（忽略自身）。
// 每次迭代处理一个重叠，最多 8 轮，最后钳制在屏幕内。
function pushOut(l, t, w, h, ignoreId) {
  try {
    var obstacles = []
    var rr = root.getBoundingClientRect()
    if (rr && rr.width > 0 && rr.height > 0) {
      var mb = collideBox(rr.left, rr.top, rr.width, rr.height)
      obstacles.push({ l: mb.l, t: mb.t, r: mb.r, b: mb.b })
    }
    babyWhales.forEach(function (b, id) {
      if (id === ignoreId || !b) return
      try {
        var r = b.getBoundingClientRect()
        if (r && r.width > 0 && r.height > 0) {
          var bb = collideBox(r.left, r.top, r.width, r.height)
          obstacles.push({ l: bb.l, t: bb.t, r: bb.r, b: bb.b })
        }
      } catch (err) {}
    })
    // 被推对象也用碰撞箱（而非图片整矩形）
    var mine = collideBox(l, t, w, h)
    l = mine.l; t = mine.t
    var mw = mine.r - mine.l
    var mh = mine.b - mine.t
    var pad = 4
    var vp = viewport()
    for (var pass = 0; pass < 8; pass++) {
      var o = null
      for (var i = 0; i < obstacles.length; i++) {
        var ob = obstacles[i]
        if (l < ob.r - pad && l + mw > ob.l + pad && t < ob.b - pad && t + mh > ob.t + pad) {
          o = ob
          break
        }
      }
      if (!o) break
      // 沿最小穿透方向推出（推开而非卡死）。按距离排序后逐个尝试，
      // 取第一个 clamp 到屏幕内后仍能实际移动的方向——最近的墙若被
      // 屏幕边界挡住（如主鲸鱼贴边），就滑到次近方向，保证必然分离。
      var dLeft = l + mw - o.l + pad
      var dRight = o.r - l + pad
      var dUp = t + mh - o.t + pad
      var dDown = o.b - t + pad
      var options = [
        { dl: -dLeft, dt: 0, d: dLeft },
        { dl: dRight, dt: 0, d: dRight },
        { dl: 0, dt: -dUp, d: dUp },
        { dl: 0, dt: dDown, d: dDown },
      ].sort(function (a, b) { return a.d - b.d })
      var applied = false
      for (var k = 0; k < options.length; k++) {
        // 按图片矩形尺寸 clamp（mw/mh 是碰撞箱，不是图片 w/h ——推出距离
        // 是相对碰撞箱的，但 clamp 应基于图片矩形防止推出后图片出屏）
        var nl = clamp(l + options[k].dl, 0, Math.max(0, vp.w - w))
        var nt = clamp(t + options[k].dt, 0, Math.max(0, vp.h - h))
        if (nl !== l || nt !== t) {
          l = nl
          t = nt
          applied = true
          break
        }
      }
      if (!applied) break // 四个方向都被屏幕挡住（理论不可能），防死循环
    }
    l = clamp(l, 0, Math.max(0, vp.w - w))
    t = clamp(t, 0, Math.max(0, vp.h - h))
    return { left: Math.round(l), top: Math.round(t) }
  } catch (err) {
    return { left: l, top: t }
  }
}
// 每只子代理小鲸鱼 = 一份完整的独立小鲸鱼（同款大图），初始排在主鲸鱼
// 左侧（从底部往上），各自 fixed 定位、互不重叠。主鲸鱼移动/缩放时由
// express() 触发重排；手动拖走的保持用户位置（但不侵入主鲸鱼）。
function layoutBabies() {
  var map = babyWhales
  // var 提升：初始化早期（babyWhales 赋值前）express() 可能先调到这里
  if (!map || map.size === 0) return
  var list = Array.from(map.keys())
  var count = list.length
  var r = root.getBoundingClientRect()
  if (!r || r.width <= 0) return
  var vp = viewport()
  var size = Math.round(clamp(r.width * 0.30, 64, 128))
  // 初始位置：主鲸鱼左侧，从底部往上依次排开
  var gap = 10
  var left = r.left - size - gap
  // 左侧空间不足（主鲸鱼贴近屏幕左缘）时改放右侧
  if (left < 6 && r.right + size + gap <= vp.w - 6) left = r.right + gap
  left = clamp(left, 6, Math.max(6, vp.w - size - 6))
  var autoIndex = 0
  list.forEach(function (id) {
    var el = babyWhales.get(id)
    if (!el) return
    // 手动拖走的小鲸鱼保持用户放置的位置，但主鲸鱼移动后不能侵入它
    if (babyManual.has(id)) {
      var curL = parseFloat(el.style.left) || 0
      var curT = parseFloat(el.style.top) || 0
      var cw = parseFloat(el.style.width) || size
      var ch = parseFloat(el.style.height) || size
      var pushed = pushOut(curL, curT, cw, ch, id)
      if (pushed.left !== curL || pushed.top !== curT) {
        el.style.left = pushed.left + 'px'
        el.style.top = pushed.top + 'px'
      }
      return
    }
    el.style.width = size + 'px'
    el.style.height = size + 'px'
    var y = r.bottom - (autoIndex + 1) * (size + gap)
    el.style.left = Math.round(left) + 'px'
    el.style.top = Math.round(clamp(y, 6, Math.max(6, vp.h - size - 6))) + 'px'
    autoIndex += 1
  })
}
// 一只子代理小鲸鱼入场：完整的独立小鲸鱼（不是小图标），直接挂到 body。
function spawnBabyWhale(id) {
  if (babyWhales.has(id)) return
  var b = document.createElement('img')
  b.className = 'dshwv-baby'
  b.src = IMG_URL
  b.alt = ''
  b.draggable = false
  document.body.appendChild(b)
  babyWhales.set(id, b)
  layoutBabies()
  // 每只小鲸鱼自己报到：头顶冒小气泡（独立个体自己报数）
  showBabySpeech(b, '报到！')
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      b.classList.add('dshwv-baby-in')
    })
  })
}
// 小鲸鱼头顶小气泡：弹出 → 停留 → 淡出移除。位置跟随小鲸鱼顶部中心。
function showBabySpeech(babyEl, text) {
  try {
    var b = document.createElement('div')
    b.className = 'dshwv-baby-speech'
    b.textContent = text
    document.body.appendChild(b)
    function place() {
      try {
        var r = babyEl.getBoundingClientRect()
        var bw = b.offsetWidth
        var bh = b.offsetHeight
        b.style.left = Math.round(r.left + r.width / 2 - bw / 2) + 'px'
        b.style.top = Math.round(r.top - bh - 6) + 'px'
      } catch (err) {}
    }
    place()
    setTimeout(place, 40)
    requestAnimationFrame(function () { b.classList.add('dshwv-baby-speech-in') })
    setTimeout(function () { b.classList.add('dshwv-baby-speech-out') }, 1100)
    setTimeout(function () {
      try { b.remove() } catch (err) {}
    }, 1500)
  } catch (err) {}
}
// 一只小小鲸鱼退场（对应的子代理会话结束），随后重排剩余个体。
function removeBabyWhale(id) {
  var el = babyWhales.get(id)
  if (!el) return
  babyWhales.delete(id)
  babyManual.delete(id)
  el.classList.remove('dshwv-baby-in')
  // 离开也叫一声（release 音效，退场动画刚开始时）
  setTimeout(function () { playBabyCryLeaving() }, 120)
  setTimeout(function () {
    try { el.remove() } catch (err) {}
  }, 360)
  layoutBabies()
}
// 与子代理生命周期 1:1 同步：出现的一起报到（逐个错开 + 叫声），消失的一起离开。
function syncBabyWhales(ids) {
  var alive = new Set(ids)
  babyWhales.forEach(function (_el, id) {
    if (!alive.has(id)) removeBabyWhale(id)
  })
  var added = ids.filter(function (id) { return !babyWhales.has(id) })
  added.forEach(function (id, i) {
    setTimeout(function () {
      if (!alive.has(id)) return
      spawnBabyWhale(id)
      // 叫声紧跟入场：多只同时到达时逐只"报到"，间隔 170ms
      setTimeout(function () { playBabyCry() }, 110)
    }, i * 170)
  })
}
var lastBabyCount = 0

// 子代理小鲸鱼拖动：每只是完整插件，可单独按住拖动（类似主鲸鱼）。
var babyDrag = null
function onBabyPointerDown(e) {
  if (e.button !== 0 && e.pointerType === 'mouse') return
  var t = e.target
  var el = t && typeof t.closest === 'function' ? t.closest('.dshwv-baby') : null
  if (!el) return
  var id = null
  babyWhales.forEach(function (b, bid) { if (b === el) id = bid })
  if (id === null) return
  // 只阻止默认行为，不阻止冒泡：让鲸鱼光标控制器也能收到 pointerdown，
  // 从而切到 drag 状态并让出原生光标（否则拖动时皮肤盖住抓取手）。
  try { e.preventDefault() } catch (err) {}
  babyDrag = {
    id: id, active: true, moved: false,
    startX: e.clientX, startY: e.clientY,
    origLeft: parseFloat(el.style.left) || 0,
    origTop: parseFloat(el.style.top) || 0,
  }
  el.classList.add('dshwv-baby-dragging')
  // 点击回弹：按下瞬间小鲸鱼弹一下
  petBounce(el)
  document.addEventListener('pointermove', onBabyPointerMove, true)
  document.addEventListener('pointerup', onBabyPointerUp, true)
  document.addEventListener('pointercancel', onBabyPointerUp, true)
  setWidgetCursor('grabbing')
  // 和主鲸鱼一样：按住就叫一声（press 音效，走「子代理声音」独立开关）
  playBabyCry()
}
function onBabyPointerMove(e) {
  if (!babyDrag || !babyDrag.active) return
  var el = babyWhales.get(babyDrag.id)
  if (!el) { endBabyDrag(); return }
  // 位移超过 5px 才算真拖动；否则视为"摸头/点击"，松手时不吸附、不锁定位置
  if (Math.abs(e.clientX - babyDrag.startX) + Math.abs(e.clientY - babyDrag.startY) > 5) {
    babyDrag.moved = true
  }
  if (!babyDrag.moved) return
  var vp = viewport()
  var w = el.offsetWidth || el.getBoundingClientRect().width || 0
  var h = el.offsetHeight || el.getBoundingClientRect().height || 0
  var nx = clamp(babyDrag.origLeft + e.clientX - babyDrag.startX, 0, Math.max(0, vp.w - w))
  var ny = clamp(babyDrag.origTop + e.clientY - babyDrag.startY, 0, Math.max(0, vp.h - h))
  // 挤压推开：拖动中实时与主鲸鱼/其他小鲸鱼分离（沿最小穿透方向滑开）
  var pushed = pushOut(nx, ny, w, h, babyDrag.id)
  el.style.left = pushed.left + 'px'
  el.style.top = pushed.top + 'px'
}
function onBabyPointerUp() { endBabyDrag() }
// 两个矩形是否重叠（pad 为最小安全间距，模拟"碰撞体积"）。
function rectsOverlap(a, b, pad) {
  pad = pad || 0
  return a.left < b.right - pad && a.right > b.left + pad &&
    a.top < b.bottom - pad && a.bottom > b.top + pad
}
function endBabyDrag() {
  if (!babyDrag) return
  var el = babyWhales.get(babyDrag.id)
  if (el) {
    el.classList.remove('dshwv-baby-dragging')
    var vp = viewport()
    var w = el.offsetWidth || el.getBoundingClientRect().width || 0
    var h = el.offsetHeight || el.getBoundingClientRect().height || 0
    var l = parseFloat(el.style.left) || 0
    var t = parseFloat(el.style.top) || 0
    // 只是摸一下（没拖动）：位置原样保留，不锁定、不吸附——避免"点一下
    // 小鲸鱼就被吸到角落"的误操作。
    if (babyDrag.moved) {
      // 手动放置后保持位置，不再被自动排列拉回
      babyManual.add(babyDrag.id)
      // 和主鲸鱼一样：靠近屏幕边缘时吸附墙壁
      var cx = l + w / 2
      var cy = t + h / 2
      if (cx < vp.w / 4) l = 0
      else if (cx > vp.w * 3 / 4) l = Math.max(0, vp.w - w)
      if (cy < vp.h / 4) t = 0
      else if (cy > vp.h * 3 / 4) t = Math.max(0, vp.h - h)
      // 挤压推开：松手时再分离一次，确保不压着主鲸鱼或其他小鲸鱼
      var pushed = pushOut(l, t, w, h, babyDrag.id)
      l = pushed.left
      t = pushed.top
    }
    el.style.left = Math.round(l) + 'px'
    el.style.top = Math.round(t) + 'px'
  }
  document.removeEventListener('pointermove', onBabyPointerMove, true)
  document.removeEventListener('pointerup', onBabyPointerUp, true)
  document.removeEventListener('pointercancel', onBabyPointerUp, true)
  babyDrag = null
  setWidgetCursor('')
  // 和主鲸鱼一样：松开也叫一声（release 音效，走「子代理声音」独立开关）
  playBabyCryLeaving()
}
document.addEventListener('pointerdown', onBabyPointerDown, true)

window.addEventListener('dshw:subagents', function (e) {
  try {
    var detail = e && e.detail
    // 优先使用子代理 id 列表；旧事件只带 count 时退化为占位 id。
    var ids = detail && Array.isArray(detail.ids)
      ? detail.ids.filter(function (x) { return typeof x === 'string' })
      : Array.from({ length: detail && typeof detail.count === 'number' ? detail.count : 0 }, function (_x, i) { return 's' + i })
    var prevCount = lastBabyCount
    lastBabyCount = ids.length
    syncBabyWhales(ids)
    // 报数改由每只小鲸鱼自己冒泡（spawnBabyWhale → showBabySpeech），
    // 不再让主鲸鱼的气泡统一播报
  } catch (err) {}
})})()`;
function apply$1(ctx) {
	let imageBytes = null;
	let balanceCache = null;
	let balanceInFlight = null;
	function loadImage() {
		if (imageBytes) return imageBytes;
		for (const p of IMAGE_CANDIDATES) try {
			const bytes = fs.readFileSync(p);
			if (bytes && bytes.length > 0) {
				imageBytes = bytes;
				return bytes;
			}
		} catch (err) {}
		throw new Error("whale image not found");
	}
	async function fetchBalance() {
		let cred;
		try {
			cred = await ctx.credentials.resolve("DEEPSEEK_API_KEY");
		} catch (err) {
			return {
				ok: false,
				code: "NO_KEY",
				error: "凭据读取失败: " + String(err && err.message || err).slice(0, 160)
			};
		}
		if (!cred) return {
			ok: false,
			code: "NO_KEY",
			error: "未配置 DEEPSEEK_API_KEY"
		};
		let lastErr = null;
		for (let attempt = 0; attempt < 2; attempt++) {
			let res;
			try {
				res = await fetch(BALANCE_URL, {
					headers: { Authorization: "Bearer " + cred.value },
					signal: AbortSignal.timeout(2e4)
				});
			} catch (err) {
				lastErr = err;
				if (attempt === 0) await new Promise((r) => setTimeout(r, 500));
				continue;
			}
			if (!res.ok) {
				lastErr = /* @__PURE__ */ new Error("HTTP " + res.status);
				if (res.status < 500) break;
				if (attempt === 0) await new Promise((r) => setTimeout(r, 500));
				continue;
			}
			let data;
			try {
				data = await res.json();
			} catch (err) {
				return {
					ok: false,
					code: "PARSE",
					error: "余额接口返回不是合法 JSON"
				};
			}
			const info = data && Array.isArray(data.balance_infos) ? data.balance_infos[0] : null;
			if (!info || info.total_balance === void 0) return {
				ok: false,
				code: "SHAPE",
				error: "余额接口返回结构异常"
			};
			return {
				ok: true,
				totalBalance: Number(info.total_balance),
				currency: String(info.currency || "CNY"),
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
		}
		return {
			ok: false,
			code: "HTTP",
			transient: !(lastErr && /^HTTP 4\d\d/.test(lastErr.message)),
			error: "余额接口请求失败: " + String(lastErr && lastErr.message || lastErr).slice(0, 200)
		};
	}
	async function fetchUsage() {
		let cred;
		try {
			cred = await ctx.credentials.resolve("DEEPSEEK_PLATFORM_TOKEN");
		} catch (err) {
			return { error: "platform cred resolve failed" };
		}
		if (!cred) return { error: "no platform token" };
		const token = String(cred.value).replace(/^Bearer\s+/i, "");
		try {
			const now = /* @__PURE__ */ new Date();
			const tz = -now.getTimezoneOffset() * 60;
			const start = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1e3);
			const end = start + 86400;
			const url = "https://platform.deepseek.com/api/v0/usage/by_api_key/amount?start=" + start + "&end=" + end + "&tz=" + tz;
			const res = await fetch(url, {
				headers: { Authorization: "Bearer " + token },
				signal: AbortSignal.timeout(15e3)
			});
			if (!res.ok) return { error: "http " + res.status };
			const u = computeTodayUsage(await res.json());
			if (u && isFinite(u.amount)) return {
				amount: u.amount,
				tokens: u.tokens
			};
			return { error: "no usage" };
		} catch (err) {
			return { error: String(err && err.message || err) };
		}
	}
	function computeTodayUsage(data) {
		let d = data;
		if (d && d.data && d.data.biz_data && Array.isArray(d.data.biz_data.series)) d = d.data.biz_data;
		else if (d && d.data && Array.isArray(d.data.series)) d = d.data;
		const series = Array.isArray(d.series) ? d.series : null;
		if (!series || series.length === 0) return null;
		let cost = 0;
		let tokens = 0;
		let found = false;
		for (const s of series) {
			if (!s || typeof s !== "object") continue;
			const p = priceFor(s.model);
			const buckets = Array.isArray(s.buckets) ? s.buckets : [];
			for (const b of buckets) {
				const u = b && b.usage;
				if (!u || typeof u !== "object") continue;
				const hit = Number(u.PROMPT_CACHE_HIT_TOKEN) || 0;
				const miss = Number(u.PROMPT_CACHE_MISS_TOKEN) || 0;
				const out = Number(u.RESPONSE_TOKEN) || 0;
				if (hit + miss + out === 0) continue;
				found = true;
				tokens += hit + miss + out;
				const pi = isPeakTime(b.time) ? 1 : 0;
				cost += hit / 1e6 * p.hit[pi] + miss / 1e6 * p.miss[pi] + out / 1e6 * p.out[pi];
			}
		}
		return found ? {
			amount: cost,
			tokens
		} : null;
	}
	function todayKey() {
		const d = /* @__PURE__ */ new Date();
		const p = (n) => String(n).padStart(2, "0");
		return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
	}
	function readUsageLedger() {
		for (const p of USAGE_FILE_CANDIDATES) try {
			const parsed = JSON.parse(fs.readFileSync(p, "utf8"));
			if (parsed && typeof parsed === "object" && typeof parsed.date === "string") return parsed;
		} catch (err) {}
		return {
			date: todayKey(),
			lastBalance: null,
			todayUsage: 0,
			history: {}
		};
	}
	function writeUsageLedger(led) {
		const body = JSON.stringify(led);
		for (const p of USAGE_FILE_CANDIDATES) try {
			fs.writeFileSync(p, body, "utf8");
			return true;
		} catch (err) {}
		return false;
	}
	function recordLedgerUsage(currentBalance) {
		const t = todayKey();
		let led = readUsageLedger();
		if (led.date !== t) {
			if (led.date && typeof led.todayUsage === "number") {
				led.history = led.history || {};
				led.history[led.date] = led.todayUsage;
			}
			led.date = t;
			led.lastBalance = currentBalance;
			led.todayUsage = 0;
		} else {
			const prev = typeof led.lastBalance === "number" ? led.lastBalance : currentBalance;
			if (typeof prev === "number" && typeof currentBalance === "number" && currentBalance < prev) led.todayUsage = (typeof led.todayUsage === "number" ? led.todayUsage : 0) + (prev - currentBalance);
			led.lastBalance = currentBalance;
		}
		const keys = Object.keys(led.history || {}).sort();
		while (keys.length > 30) delete led.history[keys.shift()];
		writeUsageLedger(led);
		return led;
	}
	function normalizeUsageMode(m) {
		return m === "token" ? "token" : "ledger";
	}
	async function getBalancePayload() {
		const payload = await fetchBalance();
		if (!payload.ok) return payload;
		const led = recordLedgerUsage(Number(payload.totalBalance));
		const mode = normalizeUsageMode((readSizeConfig() || {}).usageMode);
		const full = { ...payload };
		full.isPeak = isPeakTime(Math.floor(Date.now() / 1e3));
		if (mode === "ledger") {
			full.todayUsage = led.todayUsage;
			full.usageMode = "ledger";
			return full;
		}
		let cred = null;
		try {
			cred = await ctx.credentials.resolve("DEEPSEEK_PLATFORM_TOKEN");
		} catch (err) {}
		if (cred) {
			const u = await fetchUsage();
			if (u && u.amount !== void 0) {
				full.todayUsage = u.amount;
				full.usageMode = "token";
				return full;
			}
		}
		full.todayUsage = led.todayUsage;
		full.usageMode = "ledger";
		return full;
	}
	function getBalance() {
		const now = Date.now();
		if (balanceCache && now - balanceCache.at < BALANCE_TTL_MS) return Promise.resolve(balanceCache.payload);
		if (balanceInFlight) return balanceInFlight;
		balanceInFlight = getBalancePayload().then((payload) => {
			if (payload.ok) {
				balanceCache = {
					at: now,
					payload
				};
				return payload;
			}
			if (payload.transient && balanceCache) return {
				...balanceCache.payload,
				stale: true,
				error: payload.error
			};
			if (!payload.transient) console.error("[whale-balance]", payload.code, payload.error);
			return payload;
		}).catch((err) => ({
			ok: false,
			code: "ERROR",
			error: "余额服务异常: " + String(err && err.message || err).slice(0, 200)
		})).finally(() => {
			balanceInFlight = null;
		});
		return balanceInFlight;
	}
	function readSizeConfig() {
		for (const p of SIZE_FILE_CANDIDATES) try {
			const parsed = JSON.parse(fs.readFileSync(p, "utf8"));
			if (parsed && typeof parsed.scale === "number") return {
				scale: parsed.scale,
				sound: parsed.sound !== false,
				vol: typeof parsed.vol === "number" ? parsed.vol : .9,
				soundSet: parsed.soundSet === "fx1" ? "fx1" : "duck",
				usageMode: normalizeUsageMode(parsed.usageMode),
				babySound: parsed.babySound !== false
			};
		} catch (err) {}
		return null;
	}
	function writeSizeConfig(scale, sound, vol, soundSet, usageMode, babySound) {
		const um = normalizeUsageMode(usageMode);
		const body = JSON.stringify({
			scale,
			sound: sound !== false,
			vol: typeof vol === "number" ? vol : .9,
			soundSet: soundSet === "fx1" ? "fx1" : "duck",
			usageMode: um,
			babySound: babySound !== false,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
		for (const p of SIZE_FILE_CANDIDATES) try {
			fs.writeFileSync(p, body, "utf8");
			return {
				ok: true,
				scale,
				sound: sound !== false,
				vol: typeof vol === "number" ? vol : .9,
				soundSet: soundSet === "fx1" ? "fx1" : "duck",
				usageMode: um,
				babySound: babySound !== false
			};
		} catch (err) {}
		return {
			ok: false,
			error: "无法持久化挂件尺寸"
		};
	}
	function readBody(req) {
		return new Promise((resolve, reject) => {
			const chunks = [];
			let size = 0;
			req.on("data", (c) => {
				size += c.length;
				if (size > 8192) {
					reject(/* @__PURE__ */ new Error("body too large"));
					req.destroy();
					return;
				}
				chunks.push(c);
			});
			req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
			req.on("error", reject);
		});
	}
	const disposers = [];
	disposers.push(ctx.webServer.register({
		kind: "exact",
		path: "/dsh-whale/image.png",
		handler: (req, res) => {
			try {
				const bytes = loadImage();
				res.writeHead(200, {
					"Content-Type": "image/png",
					"Cache-Control": "no-store",
					"Content-Length": String(bytes.length)
				});
				res.end(bytes);
			} catch (err) {
				res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
				res.end("whale image unavailable: " + String(err && err.message || err));
			}
		}
	}));
	disposers.push(ctx.webServer.register({
		kind: "exact",
		path: "/dsh-whale/balance.json",
		handler: async (req, res) => {
			try {
				const payload = await getBalance();
				res.writeHead(200, JSON_HEADERS);
				res.end(JSON.stringify(payload));
			} catch (err) {
				res.writeHead(200, JSON_HEADERS);
				res.end(JSON.stringify({
					ok: false,
					code: "ERROR",
					error: String(err && err.message || err).slice(0, 200)
				}));
			}
		}
	}));
	disposers.push(ctx.webServer.register({
		kind: "exact",
		path: "/dsh-whale/size.json",
		handler: async (req, res) => {
			if (req.method === "PUT" || req.method === "POST") {
				try {
					const body = await readBody(req);
					const parsed = JSON.parse(body);
					const scale = typeof parsed.scale === "number" ? parsed.scale : null;
					if (scale === null) {
						res.writeHead(400, JSON_HEADERS);
						res.end(JSON.stringify({
							ok: false,
							error: "missing scale"
						}));
						return;
					}
					if (typeof parsed.usageMode === "string") {
						const old = readSizeConfig();
						if (!old || normalizeUsageMode(old.usageMode) !== normalizeUsageMode(parsed.usageMode)) balanceCache = null;
					}
					const result = writeSizeConfig(scale, parsed.sound !== false, parsed.vol, parsed.soundSet, parsed.usageMode, parsed.babySound !== false);
					res.writeHead(result.ok ? 200 : 500, JSON_HEADERS);
					res.end(JSON.stringify(result));
				} catch (err) {
					res.writeHead(400, JSON_HEADERS);
					res.end(JSON.stringify({
						ok: false,
						error: String(err && err.message || err)
					}));
				}
				return;
			}
			res.writeHead(200, JSON_HEADERS);
			res.end(JSON.stringify(readSizeConfig() || {}));
		}
	}));
	function loadSound(candidates) {
		for (const p of candidates) try {
			const bytes = fs.readFileSync(p);
			if (bytes && bytes.length > 0) return bytes;
		} catch (err) {}
		return null;
	}
	function serveSound(req, res, candidates) {
		const bytes = loadSound(candidates);
		if (!bytes) {
			res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
			res.end("sound unavailable");
			return;
		}
		res.writeHead(200, {
			"Content-Type": "audio/mpeg",
			"Cache-Control": "no-store",
			"Content-Length": String(bytes.length)
		});
		res.end(bytes);
	}
	disposers.push(ctx.webServer.register({
		kind: "exact",
		path: "/dsh-whale/sound/press.mp3",
		handler: (req, res) => {
			serveSound(req, res, (SOUND_SETS[soundSetFromUrl(req.url)] || SOUND_SETS.duck).press);
		}
	}));
	disposers.push(ctx.webServer.register({
		kind: "exact",
		path: "/dsh-whale/sound/release.mp3",
		handler: (req, res) => {
			serveSound(req, res, (SOUND_SETS[soundSetFromUrl(req.url)] || SOUND_SETS.duck).release);
		}
	}));
	disposers.push(ctx.webServer.register({
		kind: "exact",
		path: "/dsh-whale/widget.js",
		handler: (req, res) => {
			res.writeHead(200, {
				"Content-Type": "application/javascript; charset=utf-8",
				"Cache-Control": "no-store"
			});
			res.end(WIDGET_JS);
		}
	}));
	disposers.push(ctx.webServer.tapIndex((html) => {
		if (html.indexOf("/dsh-whale/widget.js") !== -1) return html;
		const tag = "<script defer src=\"/dsh-whale/widget.js\"><\/script>";
		if (html.indexOf("</body>") !== -1) return html.replace("</body>", "<script defer src=\"/dsh-whale/widget.js\"><\/script></body>");
		return html + tag;
	}));
	ctx.effect(() => () => {
		for (const d of disposers) try {
			d();
		} catch (err) {}
	});
}
//#endregion
//#region lib/types/index.js
const name = "dsh-beautify";
/**
* Web-only bridge: the webserver serves the WE routes + whale widget + the
* status endpoint; the credentials service feeds the whale's balance fetch. On
* profiles without a credentials provider the loader skips this plugin with a
* warning (never crashes the boot), per the loader's partial-failure tolerance.
*/
const inject = ["webServer", "credentials"];
/**
* Mount the wallpaper-engine bridge and the balance whale widget; appearance
* state itself persists via browser localStorage on the Client half. Each
* mount is guarded so a failure in one surface never crashes the plugin or
* the boot, and the failure is recorded for the settings surface to display.
* @param ctx - Host context carrying the webserver.
*/
function apply(ctx) {
	const status = {};
	try {
		registerWallpaperEngine(ctx);
		status.wallpaper = { ok: true };
	} catch (err) {
		status.wallpaper = {
			ok: false,
			reason: String(err?.message ?? err)
		};
		console.warn("[dsh-beautify] 壁纸引擎加载失败，已跳过（其余功能不受影响）:", err);
	}
	try {
		const credentials = ctx.credentials;
		if (credentials !== void 0 && typeof credentials.resolve === "function") {
			apply$1(ctx);
			status.whale = { ok: true };
		} else {
			status.whale = {
				ok: false,
				reason: "未检测到凭据服务"
			};
			console.warn("[dsh-beautify] 未检测到凭据服务，余额小鲸鱼已跳过；皮肤/光标/设置优化不受影响。");
		}
	} catch (err) {
		status.whale = {
			ok: false,
			reason: String(err?.message ?? err)
		};
		console.warn("[dsh-beautify] 余额小鲸鱼加载失败，已跳过（其余功能不受影响）:", err);
	}
	try {
		const webServer = ctx.webServer;
		if (webServer?.register !== void 0) webServer.register({
			kind: "exact",
			path: "/dsh-beautify/status.json",
			handler: (_req, res) => {
				res.writeHead(200, { "content-type": "application/json" });
				res.end(JSON.stringify(status));
			}
		});
	} catch (err) {
		console.warn("[dsh-beautify] 状态接口注册失败:", err);
	}
}
//#endregion
export { apply, inject, name };
