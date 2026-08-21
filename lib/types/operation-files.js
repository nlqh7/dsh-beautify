/**
 * Codex operation style's file surface: workspace-scoped directory listing and
 * text read over loopback HTTP routes, mirroring the WE bridge's route shape.
 * Every request resolves workspace roots lazily from the durable registry, so
 * an empty or late-mounting registry degrades to an empty/error response
 * rather than a stale cache. Reads never leave the registered workspace roots.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, isAbsolute, join, normalize, relative } from 'node:path';
/** Request path prefix under which this bundle's file surface lives. */
const BASE = '/operation-style';
/** Largest text file the read route will return. */
const MAX_READ_BYTES = 512 * 1024;
/** Per-level entry cap so a huge directory cannot balloon a panel response. */
const MAX_ENTRIES = 800;
/** Dependency-cache and build directories the codex panel never shows. */
const SKIPPED = new Set(['node_modules', '.git', '.pnpm', 'dist']);
/** A route failure with an HTTP status code. */
class RouteError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
/** Resolve the registered workspace roots, or an empty array when absent. */
function workspaceRoots(ctx) {
    const registry = ctx.get('workspaceRegistry');
    if (!registry || typeof registry.list !== 'function')
        return [];
    return registry.list().map(workspace => workspace.path).filter(path => typeof path === 'string' && path !== '');
}
/** True when `target` sits under `root` or equals the root itself. */
function isWithin(root, target) {
    const rel = relative(normalize(root), normalize(target));
    return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
}
/** Require the target under at least one workspace root. */
function requireInside(target, roots) {
    if (target === '' || roots.length === 0)
        throw new RouteError(404, 'no workspace roots');
    if (!roots.some(root => isWithin(root, target)))
        throw new RouteError(403, 'path outside workspace roots');
}
/** One level of the tree: child files and directories, dependency dirs skipped. */
function listLevel(target, roots) {
    requireInside(target, roots);
    if (!existsSync(target) || !statSync(target).isDirectory()) {
        throw new RouteError(404, 'directory not found');
    }
    const entries = [];
    for (const name of readdirSync(target)) {
        if (SKIPPED.has(name))
            continue;
        const full = join(target, name);
        let isDirectory;
        try {
            isDirectory = statSync(full).isDirectory();
        }
        catch {
            continue;
        }
        entries.push({ name, path: full, isDirectory, hidden: name.startsWith('.') });
        if (entries.length >= MAX_ENTRIES)
            break;
    }
    entries.sort((a, b) => (Number(b.isDirectory) - Number(a.isDirectory) || a.name.localeCompare(b.name)));
    return { path: target, entries, truncated: entries.length >= MAX_ENTRIES };
}
/** Read a text file under a workspace root; binary and oversized files are flagged, not streamed. */
function readText(target, roots) {
    requireInside(target, roots);
    if (!existsSync(target) || !statSync(target).isFile()) {
        throw new RouteError(404, 'file not found');
    }
    const stat = statSync(target);
    if (stat.size > MAX_READ_BYTES) {
        return { name: basename(target), binary: false, size: stat.size, tooLarge: true };
    }
    const buffer = readFileSync(target);
    if (buffer.includes(0)) {
        return { name: basename(target), binary: true, size: stat.size };
    }
    return { name: basename(target), binary: false, size: stat.size, content: buffer.toString('utf8') };
}
/**
 * Register the codex file-surface routes. No-op when the webserver is absent.
 * @param ctx - Host context carrying the webserver.
 * @returns a disposer unwinding the registered routes.
 */
export function registerOperationFiles(ctx) {
    const webServer = ctx.webServer;
    if (!webServer || typeof webServer.register !== 'function') {
        return () => { };
    }
    return webServer.register({
        kind: 'prefix',
        path: BASE,
        handler: (req, res) => {
            const url = new URL(typeof req === 'object' && req !== null && 'url' in req
                ? String(req.url ?? '/')
                : '/', 'http://x');
            const pathname = decodeURIComponent(url.pathname);
            const roots = workspaceRoots(ctx);
            res.setHeader('Cache-Control', 'no-store');
            try {
                let payload;
                if (pathname === `${BASE}/files`) {
                    const target = url.searchParams.get('path') ?? '';
                    payload = JSON.stringify(listLevel(target, roots));
                }
                else if (pathname === `${BASE}/read`) {
                    const target = url.searchParams.get('path') ?? '';
                    payload = JSON.stringify(readText(target, roots));
                }
                else {
                    res.statusCode = 404;
                    res.end('not found');
                    return;
                }
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(payload);
            }
            catch (error) {
                res.statusCode = error instanceof RouteError ? error.status : 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    error: error instanceof Error ? error.message : String(error),
                }));
            }
        },
    });
}
//# sourceMappingURL=operation-files.js.map