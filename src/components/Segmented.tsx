import { useRef, type KeyboardEvent, type ReactNode } from 'react';
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
 * white text. Left and Right arrows move between options.
 */
export function Segmented({ options, value, onChange, label, className }: SegmentedProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div role="tablist" aria-label={label} className={cx('syn-segmented', className)}>
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
