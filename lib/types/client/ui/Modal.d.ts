import type { ReactNode } from 'react';
export interface ModalProps {
    /** Whether the dialog is showing. */
    open: boolean;
    /** Dialog heading; also the aria-label. */
    title: string;
    /** Close on mask click and Escape. */
    onClose: () => void;
    /** Dialog body. */
    children: ReactNode;
    /** Optional class on the dialog card. */
    className?: string | undefined;
}
/**
 * Render a centered modal dialog over a dimmed mask.
 * @param props - modal props.
 * @returns the dialog tree or null when closed.
 */
export declare function Modal({ open, title, onClose, children, className }: ModalProps): import("react").ReactPortal | null;
//# sourceMappingURL=Modal.d.ts.map