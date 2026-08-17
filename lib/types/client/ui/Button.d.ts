/**
 * shadcn-style token button: styled purely with `--dsw-*` aliases, no literal
 * colors, no component library. Reusable across every feature surface.
 */
import type { ReactNode } from 'react';
export interface ButtonProps {
    /** Button content. */
    children: ReactNode;
    /** Click handler. */
    onClick?: () => void;
    /** Toggle/pressed state (aria-pressed). */
    selected?: boolean;
    /** Visual emphasis; `ghost` is the plain low-emphasis variant. */
    variant?: 'default' | 'ghost';
    /** Extra class appended after the module class. */
    className?: string;
}
/**
 * Render a token-styled button.
 * @param props - button props.
 * @returns the button element.
 */
export declare function Button({ children, onClick, selected, variant, className }: ButtonProps): import("react").JSX.Element;
//# sourceMappingURL=Button.d.ts.map