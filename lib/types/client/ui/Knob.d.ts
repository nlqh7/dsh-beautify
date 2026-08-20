export interface KnobProps {
    /** Visible label, fixed 92px column. */
    label: string;
    /** Current value. */
    value: number;
    /** Minimum (default 0). */
    min?: number;
    /** Maximum (default 1). */
    max?: number;
    /** Step (default 0.01). */
    step?: number;
    /** Unit suffix for the number box (e.g. `px`, `%`, `°`). */
    unit?: string;
    /** Change callback with the new numeric value. */
    onChange: (value: number) => void;
    /** Disable the input (dimmed, no drag). */
    disabled?: boolean;
}
/**
 * Render a token-styled knob row.
 * @param props - knob props.
 * @returns the labeled slider with a numeric readout.
 */
export declare function Knob({ label, value, min, max, step, unit, onChange, disabled }: KnobProps): import("react").JSX.Element;
//# sourceMappingURL=Knob.d.ts.map