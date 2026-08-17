export interface SliderProps {
    /** Current value. */
    value: number;
    /** Minimum (default 0). */
    min?: number;
    /** Maximum (default 1). */
    max?: number;
    /** Step (default 0.01). */
    step?: number;
    /** Visible label; the current value is appended as a percentage. */
    label: string;
    /** Change callback with the new numeric value. */
    onChange: (value: number) => void;
}
/**
 * Render a token-styled slider.
 * @param props - slider props.
 * @returns the labeled range input.
 */
export declare function Slider({ value, min, max, step, label, onChange }: SliderProps): import("react").JSX.Element;
//# sourceMappingURL=Slider.d.ts.map