/**
 * Reusable base-component library (shadcn philosophy): components are owned
 * source styled purely with `--dsw-*` tokens, never literal colors. New
 * feature UI must compose these instead of inventing fresh styles.
 */
export { Button } from "./Button.js";
export { Slider } from "./Slider.js";
export { Knob } from "./Knob.js";
export { Segmented } from "./Segmented.js";
export { Modal } from "./Modal.js";
/** AI-visible catalog: name, props contract, and purpose for every component. */
export const UI_CATALOG = [
    {
        name: 'Button',
        props: 'children, onClick?, selected?, variant?: "default" | "ghost"',
        purpose: 'Token-styled button with pressed state.',
    },
    {
        name: 'Slider',
        props: 'value, min? (0), max? (1), step? (0.01), label, onChange',
        purpose: 'Token-styled range slider; value shown as a percentage.',
    },
    {
        name: 'Knob',
        props: 'label, value, min? (0), max? (1), step? (0.01), unit?, onChange, disabled?',
        purpose: 'Labeled slider with a stepless number box and optional unit suffix.',
    },
    {
        name: 'Segmented',
        props: 'label, value, options, onSelect',
        purpose: 'Evenly split hairline-frame picker with a business-tint active cell.',
    },
    {
        name: 'Modal',
        props: 'open, title, onClose, children, className?',
        purpose: 'Centered modal dialog over a dimmed mask; Escape and mask click close.',
    },
];
//# sourceMappingURL=index.js.map