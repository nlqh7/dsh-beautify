import { type FrameMode } from './frame-art.generated.ts';
export interface FrameController {
    sync(): void;
    setMode(mode: FrameMode): void;
    dispose(): void;
}
export declare function createFrameController(body: HTMLElement): FrameController;
//# sourceMappingURL=frames.d.ts.map