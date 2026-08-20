export interface SliderProps {
    /** Current value. */
    value: number;
    /** Minimum (default 0). */
    min?: number;
    /** Maximum (default 1). */
    max?: number;
    /** Step (default 0.01). */
    step?: number;
    /** Visible label; the current value is appended as a percentage by default. */
    label: string;
    /** Change callback with the new numeric value. */
    onChange: (value: number) => void;
    /** Optional formatter for the displayed value (defaults to percent). */
    format?: (value: number) => string;
    /** Disable the input (dimmed, no drag). */
    disabled?: boolean;
}
/**
 * Render a token-styled slider.
 * @param props - slider props.
 * @returns the labeled range input.
 */
export declare function Slider({ value, min, max, step, label, onChange, format, disabled }: SliderProps): import("react").JSX.Element;
//# sourceMappingURL=Slider.d.ts.map