import { type OrnamentMode } from './ornament-art.generated.ts';
export interface OrnamentController {
    sync(): void;
    setMode(mode: OrnamentMode): void;
    setWide(wide: boolean): void;
    dispose(): void;
}
export declare function createOrnamentController(body: HTMLElement, options: {
    wide: boolean;
}): OrnamentController;
//# sourceMappingURL=ornaments.d.ts.map