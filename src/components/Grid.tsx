import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../utils';
import './Grid.css';

type Span = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface GridProps {
  children?: ReactNode;
  /** Column gap in px from the spacing scale. Defaults to the 24px gutter token. */
  gap?: 8 | 12 | 16 | 20 | 24 | 32;
  className?: string;
}

/** The 12-column layout grid. Children are GridItems. */
export function Grid({ children, gap, className }: GridProps) {
  const style = gap !== undefined ? ({ '--grid-gap': `${gap}px` } as CSSProperties) : undefined;
  return <div className={cx('syn-grid', className)} style={style}>{children}</div>;
}

export interface GridItemProps {
  /** Columns taken out of 12. */
  span?: Span;
  /** Columns under 640px wide. Defaults to the full row. */
  spanSm?: Span;
  children?: ReactNode;
  className?: string;
}

export function GridItem({ span = 12, spanSm = 12, children, className }: GridItemProps) {
  return (
    <div className={cx('syn-grid__item', className)} style={{ '--span': span, '--span-sm': spanSm } as CSSProperties}>
      {children}
    </div>
  );
}
