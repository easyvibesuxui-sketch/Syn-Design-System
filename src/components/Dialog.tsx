import { useEffect, useId, useRef, type ReactNode } from 'react';
import { IconButton } from './IconButton';
import { cx } from '../utils';
import './Dialog.css';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children?: ReactNode;
  /** Buttons, usually one stretched primary Button or a Yes/No pair. */
  actions?: ReactNode;
  /** sm 400px (Figma "Popup-Yes no"), md 480px, lg 600px. */
  size?: 'sm' | 'md' | 'lg';
  closeLabel?: string;
  className?: string;
}

/** Modal dialog on the native <dialog> element, which handles focus trapping and Escape. */
export function Dialog({ open, onClose, title, children, actions, size = 'md', closeLabel = 'Close', className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = `syn-dialog-${useId()}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={cx('syn-dialog', `syn-dialog--${size}`, className)}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="syn-dialog__panel">
        <header className="syn-dialog__header">
          <h2 id={titleId} className="syn-dialog__title">{title}</h2>
          <IconButton icon="close" label={closeLabel} onClick={onClose} className="syn-dialog__close" />
        </header>
        {children && <div className="syn-dialog__body">{children}</div>}
        {actions && <footer className="syn-dialog__actions">{actions}</footer>}
      </div>
    </dialog>
  );
}
