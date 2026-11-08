import { cloneElement, isValidElement, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode } from 'react';
import { cx } from '../utils';
import './Tooltip.css';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  /** The trigger. Must be a focusable element that accepts aria-describedby. */
  children: ReactElement;
  placement?: TooltipPlacement;
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

/** The tooltip props every icon-only button takes (IconButton, the map controls). */
export interface ButtonTipProps {
  /**
   * The built-in tooltip: the `label` by default, other content (e.g. the label with a shortcut), or `false`
   * for none. It replaces the native `title`, which drew a second, unstyled tooltip.
   */
  tooltip?: ReactNode | false;
  tooltipPlacement?: TooltipPlacement;
  tooltipTone?: 'dark' | 'light';
}

interface TipHandlers {
  /** The button's own aria-describedby (e.g. from a wrapping Tooltip); kept next to the tooltip's id. */
  'aria-describedby'?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLButtonElement>) => void;
  onBlur?: (e: FocusEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (e: MouseEvent<HTMLButtonElement>) => void;
  onFocus?: (e: FocusEvent<HTMLButtonElement>) => void;
}

const EDGE = 8;

/** Shifts a top or bottom bubble sideways so it stays 8px inside the viewport; the pointer stays on the button. */
function keepInView(el: HTMLElement | null) {
  if (!el) return;
  el.style.setProperty('--tip-shift', '0px');
  const display = el.style.display;
  el.style.display = 'block'; // hidden bubbles are display: none; measure while still invisible
  const r = el.getBoundingClientRect();
  el.style.display = display;
  const vw = document.documentElement.clientWidth;
  const shift = r.left < EDGE ? EDGE - r.left : r.right > vw - EDGE ? vw - EDGE - r.right : 0;
  el.style.setProperty('--tip-shift', `${Math.round(shift)}px`);
}

/**
 * The tooltip of an icon-only button, drawn inside the button so it needs no wrapper and an absolutely
 * placed button stays where it is. CSS shows it on hover (pointer devices) and on keyboard focus; Escape
 * hides it until the pointer or focus leaves. When it repeats the label it is hidden from screen readers
 * (the label is already the name); other content is wired with aria-describedby.
 */
export function useButtonTip(label: string, { tooltip, tooltipPlacement = 'top', tooltipTone = 'dark' }: ButtonTipProps, handlers: TipHandlers) {
  const id = `syn-tip-${useId()}`;
  const [muted, setMuted] = useState(false);
  const bubble = useRef<HTMLSpanElement>(null);
  const sideways = tooltipPlacement === 'top' || tooltipPlacement === 'bottom';
  if (tooltip === false || tooltip === null) return { tip: null, tipProps: handlers, tipClass: undefined as string | undefined };
  const extra = tooltip !== undefined && tooltip !== label;
  const tip = (
    <span
      ref={bubble}
      id={extra ? id : undefined}
      role={extra ? 'tooltip' : undefined}
      aria-hidden={extra ? undefined : true}
      className={cx('syn-tooltip__bubble', 'syn-tip', `syn-tooltip__bubble--${tooltipPlacement}`, `syn-tooltip__bubble--${tooltipTone}`)}
    >
      {extra ? tooltip : label}
    </span>
  );
  const tipProps = {
    'aria-describedby': cx(handlers['aria-describedby'], extra && id) || undefined,
    onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => { if (e.key === 'Escape') setMuted(true); handlers.onKeyDown?.(e); },
    onMouseLeave: (e: MouseEvent<HTMLButtonElement>) => { setMuted(false); handlers.onMouseLeave?.(e); },
    onBlur: (e: FocusEvent<HTMLButtonElement>) => { setMuted(false); handlers.onBlur?.(e); },
    onMouseEnter: (e: MouseEvent<HTMLButtonElement>) => { if (sideways) keepInView(bubble.current); handlers.onMouseEnter?.(e); },
    onFocus: (e: FocusEvent<HTMLButtonElement>) => { if (sideways) keepInView(bubble.current); handlers.onFocus?.(e); },
  };
  return { tip, tipProps, tipClass: cx('syn-has-tip', muted && 'is-tip-muted') };
}
