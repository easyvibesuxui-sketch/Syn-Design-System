import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { IconButton } from './IconButton';
import { cx } from '../utils';
import './Drawer.css';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name of the drawer, e.g. the record title. */
  label: string;
  /** Left side of the 64px header: status chip, record id. */
  headerStart?: ReactNode;
  /** Extra header buttons, placed before the close button (share, more). */
  headerActions?: ReactNode;
  /** Sticky 88px footer, e.g. a text "Discard" button and a primary "Update" button. */
  footer?: ReactNode;
  children?: ReactNode;
  /** Panel width; it never grows past the viewport. Default 1280px, as in the reference. */
  width?: number | string;
  closeLabel?: string;
  className?: string;
}

/**
 * Side drawer from the record reference: a Snow panel from the right edge with a 48px top-left
 * corner, a 64px header, a scrolling body and a sticky footer. Built on the native <dialog>
 * element, which handles focus trapping and Escape.
 */
export function Drawer({
  open, onClose, label, headerStart, headerActions, footer, children, width = 1280, closeLabel = 'Close', className,
}: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      // Start focus on the panel, not the first field, so nothing shows a focus ring until the user tabs.
      panel.current?.focus();
    }
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      className={cx('syn-drawer', className)}
      style={{ '--drawer-w': typeof width === 'number' ? `${width}px` : width } as CSSProperties}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div ref={panel} tabIndex={-1} className="syn-drawer__panel">
        <header className="syn-drawer__header">
          <div className="syn-drawer__header-start">{headerStart}</div>
          <div className="syn-drawer__header-actions">
            {headerActions}
            <IconButton icon="close" label={closeLabel} size="sm" onClick={onClose} />
          </div>
        </header>
        <div className="syn-drawer__body">{children}</div>
        {footer && <footer className="syn-drawer__footer">{footer}</footer>}
      </div>
    </dialog>
  );
}

export interface DrawerRowProps {
  /** Row label with an optional 16px icon, e.g. "Collaborators". */
  label?: ReactNode;
  icon?: IconName;
  /** Content pinned to the right edge, e.g. an add button. */
  end?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** A full-width drawer row with a Cultured hairline under it: title block, property line, chips. */
export function DrawerRow({ label, icon, end, children, className }: DrawerRowProps) {
  return (
    <div className={cx('syn-drawer-row', className)}>
      {label && (
        <span className="syn-drawer-row__label">
          {icon && <Icon name={icon} size={16} />}
          {label}
        </span>
      )}
      <div className="syn-drawer-row__content">{children}</div>
      {end && <div className="syn-drawer-row__end">{end}</div>}
    </div>
  );
}
