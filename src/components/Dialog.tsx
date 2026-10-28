import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { cx } from '../utils';
import './Dialog.css';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Centred line under the icon: Montserrat Medium 14/18. */
  description?: ReactNode;
  /** 48px Silver Chalice icon above the description. Pass null for none. */
  icon?: IconName | null;
  /** Extra content under the description. */
  children?: ReactNode;
  /** Footer buttons, e.g. one 320px primary Button as in Figma "Session Time out". */
  actions?: ReactNode;
  closeLabel?: string;
  className?: string;
}

/** The 28px close glyph from the Figma popups: two Silver Chalice strokes. */
function CloseGlyph() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden focusable="false">
      <path d="M6.11 23L5 21.88L21.88 5L23 6.11L6.11 23Z" fill="currentColor" />
      <path d="M21.88 23.03L5 6.15L6.11 5.03L23 21.91L21.88 23.03Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Modal dialog from the Figma popups ("Session Time out"): 507px Smoke panel, radius 12, a 64px header
 * with the title centred, a 32px-padded body and a footer for the action. Built on the native <dialog>
 * element, which handles focus trapping and Escape.
 */
export function Dialog({
  open, onClose, title, description, icon = 'info-circle', children, actions, closeLabel = 'Close', className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const titleId = `syn-dialog-${useId()}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      // Start focus on the panel, not the close button, so no focus ring shows until the user tabs.
      panel.current?.focus();
    }
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={cx('syn-dialog', className)}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div ref={panel} tabIndex={-1} className="syn-dialog__panel">
        <header className="syn-dialog__header">
          <h2 id={titleId} className="syn-dialog__title">{title}</h2>
          <button type="button" className="syn-dialog__close" aria-label={closeLabel} onClick={onClose}>
            <CloseGlyph />
          </button>
        </header>
        {(icon || description || children) && (
          <div className="syn-dialog__body">
            {icon && <Icon name={icon} size={48} className="syn-dialog__icon" />}
            {description && <p className="syn-dialog__description">{description}</p>}
            {children}
          </div>
        )}
        {actions && <footer className="syn-dialog__actions">{actions}</footer>}
      </div>
    </dialog>
  );
}
