import { cloneElement, isValidElement, useId, useState, type ReactElement, type ReactNode } from 'react';
import { cx } from '../utils';
import './Tooltip.css';

export interface TooltipProps {
  content: ReactNode;
  /** The trigger. Must be a focusable element that accepts aria-describedby. */
  children: ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** dark = Jet fill, light = Cultured fill with an Eerie Black border. */
  tone?: 'dark' | 'light';
  className?: string;
}

export function Tooltip({ content, children, placement = 'top', tone = 'dark', className }: TooltipProps) {
  const id = `syn-tooltip-${useId()}`;
  const [open, setOpen] = useState(false);
  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, { 'aria-describedby': id })
    : children;
  return (
    <span
      className={cx('syn-tooltip', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
    >
      {trigger}
      <span id={id} role="tooltip" className={cx('syn-tooltip__bubble', `syn-tooltip__bubble--${placement}`, `syn-tooltip__bubble--${tone}`, open && 'is-open')}>
        {content}
      </span>
    </span>
  );
}
