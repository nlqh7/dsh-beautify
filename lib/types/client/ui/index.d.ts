/**
 * Reusable base-component library (shadcn philosophy): components are owned
 * source styled purely with `--dsw-*` tokens, never literal colors. New
 * feature UI must compose these instead of inventing fresh styles.
 */
export { Button } from './Button.tsx';
export type { ButtonProps } from './Button.tsx';
export { Slider } from './Slider.tsx';
export type { SliderProps } from './Slider.tsx';
export { Knob } from './Knob.tsx';
export type { KnobProps } from './Knob.tsx';
export { Segmented } from './Segmented.tsx';
export type { SegmentedProps, SegmentedOption } from './Segmented.tsx';
export { Modal } from './Modal.tsx';
export type { ModalProps } from './Modal.tsx';
/** AI-visible catalog: name, props contract, and purpose for every component. */
export declare const UI_CATALOG: readonly {
    name: string;
    props: string;
    purpose: string;
}[];
//# sourceMappingURL=index.d.ts.map