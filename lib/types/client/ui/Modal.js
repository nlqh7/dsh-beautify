import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Centered modal dialog over a page mask, styled with `--dsw-*` tokens.
 * Portals to `document.body` so ancestor stacking contexts cannot trap it.
 * Escape and mask click close; the grid inside decides whether a select commits.
 */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import css from './Modal.module.css';
/**
 * Render a centered modal dialog over a dimmed mask.
 * @param props - modal props.
 * @returns the dialog tree or null when closed.
 */
export function Modal({ open, title, onClose, children, className }) {
    useEffect(() => {
        if (!open)
            return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape')
                onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => { document.removeEventListener('keydown', onKeyDown); };
    }, [open, onClose]);
    if (!open)
        return null;
    return createPortal((_jsxs("div", { className: css.root, role: "presentation", children: [_jsx("div", { className: css.mask, "aria-hidden": "true", onClick: onClose }), _jsxs("div", { className: [css.dialog, className ?? ''].filter(Boolean).join(' '), role: "dialog", "aria-modal": "true", "aria-label": title, children: [_jsxs("div", { className: css.header, children: [_jsx("h2", { className: css.title, children: title }), _jsx("button", { type: "button", className: css.close, "aria-label": "\u5173\u95ED", onClick: onClose, children: "\u2715" })] }), _jsx("div", { className: css.body, children: children })] })] })), document.body);
}
//# sourceMappingURL=Modal.js.map