/**
 * Reusable base-component library (shadcn philosophy): components are owned
 * source styled purely with `--dsw-*` tokens, never literal colors. New
 * feature UI must compose these instead of inventing fresh styles.
 */
export { Button } from './Button.tsx';
export type { ButtonProps } from './Button.tsx';
export { Slider } from './Slider.tsx';
export type { SliderProps } from './Slider.tsx';
/** AI-visible catalog: name, props contract, and purpose for every component. */
export declare const UI_CATALOG: readonly {
    name: string;
    props: string;
    purpose: string;
}[];
//# sourceMappingURL=index.d.ts.map