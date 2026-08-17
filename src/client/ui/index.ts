/**
 * Reusable base-component library (shadcn philosophy): components are owned
 * source styled purely with `--dsw-*` tokens, never literal colors. New
 * feature UI must compose these instead of inventing fresh styles.
 */
export { Button } from './Button.tsx'
export type { ButtonProps } from './Button.tsx'
export { Slider } from './Slider.tsx'
export type { SliderProps } from './Slider.tsx'

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
]
