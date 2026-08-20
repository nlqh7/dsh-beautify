import type { OrnamentId } from './ornament-art.generated.ts';
export interface OrnamentState {
    wide: boolean;
    selectedNav: boolean;
    dialog: boolean;
    composerEngaged: boolean;
    heading: boolean;
    mascot: boolean;
}
export declare function chooseOrnaments(state: OrnamentState): OrnamentId[];
//# sourceMappingURL=ornament-policy.d.ts.map