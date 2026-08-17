/**
 * shadcn-style token button: styled purely with `--dsw-*` aliases, no literal
 * colors, no component library. Reusable across every feature surface.
 */
import type { ReactNode } from 'react'
import css from './Button.module.css'

export interface ButtonProps {
  /** Button content. */
  children: ReactNode
  /** Click handler. */
  onClick?: () => void
  /** Toggle/pressed state (aria-pressed). */
  selected?: boolean
  /** Visual emphasis; `ghost` is the plain low-emphasis variant. */
  variant?: 'default' | 'ghost'
  /** Extra class appended after the module class. */
  className?: string
}

/**
 * Render a token-styled button.
 * @param props - button props.
 * @returns the button element.
 */
export function Button({ children, onClick, selected, variant = 'default', className }: ButtonProps) {
  const cls = [
    css.button,
    variant === 'ghost' ? css.ghost : '',
    selected === true ? css.selected : '',
    className ?? '',
  ].filter(Boolean).join(' ')
  return (
    <button type="button" className={cls} aria-pressed={selected} onClick={onClick}>
      {children}
    </button>
  )
}
