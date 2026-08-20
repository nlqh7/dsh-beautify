/**
 * Reusable base-component library (shadcn philosophy): components are owned
 * source styled purely with `--dsw-*` tokens, never literal colors. New
 * feature UI must compose these instead of inventing fresh styles.
 */
export { Button } from './Button.tsx'
export type { ButtonProps } from './Button.tsx'
export { Slider } from './Slider.tsx'
export type { SliderProps } from './Slider.tsx'
export { Knob } from './Knob.tsx'
export type { KnobProps } from './Knob.tsx'
export { Segmented } from './Segmented.tsx'
export type { SegmentedProps, SegmentedOption } from './Segmented.tsx'
export { Modal } from './Modal.tsx'
export type { ModalProps } from './Modal.tsx'

/** AI-visible catalog: name, props contract, and purpose for every component. */
export const UI_CATALOG: readonly { name: string; props: string; purpose: string }[] = [
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
]