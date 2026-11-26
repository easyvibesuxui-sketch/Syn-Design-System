import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button, IconButton } from '@syn/design-system';

/**
 * A filter panel anchored under its header button (Fleet Database filter dropdown): title, body, and the
 * "Clear this filter" / "Done" footer. Rendered in a portal with fixed position, so the table's scroll does not
 * clip it; Escape or a click outside closes it and focus returns to the button.
 */
export function FilterPopover({ anchor, title, onClose, onClear, children, width = 320, footer = true }: {
  anchor: HTMLElement;
  title: string;
  onClose: () => void;
  onClear?: () => void;
  children: ReactNode;
  width?: number;
  /** false: no Clear / Done footer (an information panel). */
  footer?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; maxHeight: number }>({ top: 0, left: 0, maxHeight: 400 });

  useLayoutEffect(() => {
    const place = () => {
      const r = anchor.getBoundingClientRect();
      const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
      const top = r.bottom + 6;
      setPos({ top, left, maxHeight: Math.max(220, window.innerHeight - top - 16) });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [anchor, width]);

  useEffect(() => {
    const first = panel.current?.querySelector<HTMLElement>('input, select, button');
    first?.focus();
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !anchor.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') {
      // Only the panel closes, not the drawer or dialog the table sits in.
      e.preventDefault();
      e.stopPropagation();
      onClose();
      anchor.focus();
    } };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey, true);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey, true); };
  }, [anchor, onClose]);

  // Inside an open <dialog> (the drawer) only its own subtree is interactive, so mount there.
  const host = anchor.closest('dialog') ?? document.body;
  return createPortal(
    <div
      ref={panel} role="dialog" aria-label={title} className="seq-pop"
      style={{ top: pos.top, left: pos.left, width, maxHeight: pos.maxHeight }}
    >
      <header className="seq-pop__head">
        <p className="seq-pop__title">{title}</p>
        <IconButton icon="close" label={footer ? 'Close filter' : 'Close'} size="xs" onClick={() => { onClose(); anchor.focus(); }} />
      </header>
      <div className="seq-pop__body">{children}</div>
      {footer && (
      <footer className="seq-pop__foot">
        {onClear && <Button variant="secondary" size="sm" onClick={onClear}>Clear this filter</Button>}
        <Button size="sm" onClick={() => { onClose(); anchor.focus(); }}>Done</Button>
      </footer>
      )}
    </div>,
    host,
  );
}
