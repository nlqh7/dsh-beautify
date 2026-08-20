export interface SegmentedOption<T extends string> {
    id: T;
    label: string;
}
export interface SegmentedProps<T extends string> {
    /** Accessible name for the button group. */
    label: string;
    value: T;
    options: readonly SegmentedOption<T>[];
    onSelect: (value: T) => void;
}
/**
 * Render a segmented picker.
 * @param props - segmented props.
 * @returns the button group.
 */
export declare function Segmented<T extends string>({ label, value, options, onSelect }: SegmentedProps<T>): import("react").JSX.Element;
//# sourceMappingURL=Segmented.d.ts.map