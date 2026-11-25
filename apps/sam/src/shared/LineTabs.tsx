import { useRef, type KeyboardEvent } from 'react';
import './LineTabs.css';

/**
 * Figma "Second navigation Tab": 180px tabs with a line under the selected one (Alerts / Alert History).
 * Syn's Tabs are the filled kind, so this lives in the app; it could move to Syn as a Tabs variant.
 */
export function LineTabs({ items, value, onChange, label, idPrefix }: {
  items: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  idPrefix: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + items.length) % items.length;
    refs.current[next]?.focus();
    onChange(items[next].id);
  };
  return (
    <div role="tablist" aria-label={label} className="sam-line-tabs">
      {items.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => { refs.current[i] = el; }}
          type="button"
          role="tab"
          id={`${idPrefix}-tab-${t.id}`}
          aria-controls={`${idPrefix}-panel`}
          aria-selected={t.id === value}
          tabIndex={t.id === value ? 0 : -1}
          className="sam-line-tabs__tab"
          onClick={() => onChange(t.id)}
          onKeyDown={(e) => onKey(e, i)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
