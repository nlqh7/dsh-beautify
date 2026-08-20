/**
 * Centered modal dialog over a page mask, styled with `--dsw-*` tokens.
 * Portals to `document.body` so ancestor stacking contexts cannot trap it.
 * Escape and mask click close; the grid inside decides whether a select commits.
 */
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import css from './Modal.module.css'

export interface ModalProps {
  /** Whether the dialog is showing. */
  open: boolean
  /** Dialog heading; also the aria-label. */
  title: string
  /** Close on mask click and Escape. */
  onClose: () => void
  /** Dialog body. */
  children: ReactNode
  /** Optional class on the dialog card. */
  className?: string | undefined
}

/**
 * Render a centered modal dialog over a dimmed mask.
 * @param props - modal props.
 * @returns the dialog tree or null when closed.
 */
export function Modal({ open, title, onClose, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown) }
  }, [open, onClose])

  if (!open) return null

  return createPortal((
    <div className={css.root} role="presentation">
      <div className={css.mask} aria-hidden="true" onClick={onClose} />
      <div className={[css.dialog, className ?? ''].filter(Boolean).join(' ')} role="dialog" aria-modal="true" aria-label={title}>
        <div className={css.header}>
          <h2 className={css.title}>{title}</h2>
          <button type="button" className={css.close} aria-label="关闭" onClick={onClose}>✕</button>
        </div>
        <div className={css.body}>{children}</div>
      </div>
    </div>
  ), document.body)
}
