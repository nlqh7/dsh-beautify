import type { Context } from '@deepseek-ai/cordis';
/**
 * Register the codex file-surface routes. No-op when the webserver is absent.
 * @param ctx - Host context carrying the webserver.
 * @returns a disposer unwinding the registered routes.
 */
export declare function registerOperationFiles(ctx: Context): () => void;
//# sourceMappingURL=operation-files.d.ts.map