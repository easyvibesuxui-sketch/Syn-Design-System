import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Places a Syn dropdown panel (OptionList or DropdownPanel, with their own Clear / Save footer) under the header
 * button that opened it, as in Figma (SAM › Add Equipment). Rendered in a portal with fixed position, so the
 * table's scroll does not clip it; Escape or a click outside closes it without saving and focus returns to the
 * button.
 */
export function FilterPopover({ anchor, label, onClose, children, width = 370 }: {
  anchor: HTMLElement;
  /** Accessible name of the panel. */
  label: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
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
    const first = panel.current?.querySelector<HTMLElement>('input, [role="listbox"], button');
    first?.focus();
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !anchor.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Only the panel closes, not the drawer or dialog the table sits in.
      e.preventDefault();
      e.stopPropagation();
      onClose();
      anchor.focus();
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey, true);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey, true); };
  }, [anchor, onClose]);

  // Inside an open <dialog> (the drawer) only its own subtree is interactive, so mount there.
  const host = anchor.closest('dialog') ?? document.body;
  return createPortal(
    <div ref={panel} role="dialog" aria-label={label} className="seq-pop" style={{ top: pos.top, left: pos.left, width, maxHeight: pos.maxHeight }}>
      {children}
    </div>,
    host,
  );
}
