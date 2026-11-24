import type { CSSProperties, HTMLAttributes } from 'react';
import { cx } from '../utils';
import './Skeleton.css';

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Material-style shapes: text (a line at 60% of the font height), circular, rectangular. field and textbox
   * are the Figma input skeletons: a Cultured box with a Smoke bar (field 56 / 48 / 36, textbox 64 / 56 / 48).
   */
  variant?: 'text' | 'circular' | 'rectangular' | 'field' | 'textbox';
  /** pulse (default, as Material): fades between 100% and 40%; wave: a light band sweeps across; false: still. */
  animation?: 'pulse' | 'wave' | false;
  /** field / textbox only: lg (default), md, sm. */
  size?: 'lg' | 'md' | 'sm';
  width?: number | string;
  height?: number | string;
}

/**
 * Loading placeholder in the Material Skeleton manner, with Syn colours (Cultured, Smoke) and 8px corners.
 * Hidden from screen readers; mark the region that is loading with aria-busy.
 */
export function Skeleton({ variant = 'text', animation = 'pulse', size = 'lg', width, height, className, style, ...rest }: SkeletonProps) {
  const box: CSSProperties = { width, height, ...style };
  const field = variant === 'field' || variant === 'textbox';
  return (
    <span
      aria-hidden
      className={cx(
        'syn-skeleton',
        `syn-skeleton--${variant}`,
        field && `syn-skeleton--${size}`,
        animation && `syn-skeleton--${animation}`,
        className,
      )}
      style={box}
      {...rest}
    >
      {field && <span className="syn-skeleton__bar" />}
    </span>
  );
}
