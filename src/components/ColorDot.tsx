import type { CSSProperties } from 'react';
import { cx } from '../utils';
import './ColorDot.css';

export interface ColorDotProps {
  /** Any CSS colour or token, e.g. var(--syn-status-success) or a crew colour. */
  color: string;
  /**
   * ring = Figma "Color Dot Default": a 16px white circle with a 1px Silver Chalice border around a 12px dot.
   * plain = the dot alone (tag cards).
   */
  variant?: 'ring' | 'plain';
  /** Diameter in px. Defaults to 16 (ring) or 10 (plain). */
  size?: number;
  /** Gives the dot a name for screen readers; without it the dot is decorative. */
  label?: string;
  className?: string;
}

/** Figma "Color Dot Default": the status / crew / project colour marker used across records. */
export function ColorDot({ color, variant = 'ring', size, label, className }: ColorDotProps) {
  const d = size ?? (variant === 'ring' ? 16 : 10);
  const style = { '--dot': color, width: d, height: d } as CSSProperties;
  return (
    <span
      className={cx('syn-color-dot', `syn-color-dot--${variant}`, className)}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
