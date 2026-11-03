import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../utils';
import './Segmented.css';

export interface SegmentedOption {
  value: string;
  label: ReactNode;
}

export interface SegmentedProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  /** Accessible name of the group. */
  label: string;
  className?: string;
}

/**
 * Pill switcher between views ("Comments" / "Activity"): 24px pills, the current one Eerie Black with
 * white text. The black pill slides to the chosen option. Left and Right arrows move between options.
 */
export function Segmented({ options, value, onChange, label, className }: SegmentedProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const group = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);
  const index = options.findIndex((o) => o.value === value);

  // Measure the selected option so the thumb can slide to it; re-measure when the group resizes.
  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[index];
      setThumb(el ? { x: el.offsetLeft, w: el.offsetWidth } : null);
    };
    measure();
    if (typeof ResizeObserver === 'undefined' || !group.current) return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(group.current);
    return () => ro.disconnect();
  }, [index, options.length]);
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div ref={group} role="tablist" aria-label={label} className={cx('syn-segmented', thumb && 'has-thumb', className)}>
      {thumb && (
        <span
          className="syn-segmented__thumb"
          aria-hidden
          style={{ '--thumb-x': `${thumb.x}px`, '--thumb-w': `${thumb.w}px` } as CSSProperties}
        />
      )}
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => { refs.current[i] = el; }}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          tabIndex={o.value === value ? 0 : -1}
          className="syn-segmented__option"
          onClick={() => onChange(o.value)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
