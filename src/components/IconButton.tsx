import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import { useButtonTip, type ButtonTipProps } from './Tooltip';
import { cx, type ControlSize } from '../utils';
import './IconButton.css';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'>, ButtonTipProps {
  icon: IconName;
  /** Required: icon-only buttons need an accessible name. It is also the tooltip unless `tooltip` says otherwise. */
  label: string;
  /** xs 24px (Figma input "Close button"), sm 36px, md 48px, lg 56px. The glyph is 16px, or 20px from md up; the xs close X is Figma's "Close Button" glyph (CloseGlyph). */
  size?: ControlSize;
  /** ghost = round with a faint fill (default); outline = white square with a Cultured border and Silver Chalice glyph (row "more" buttons). */
  variant?: 'ghost' | 'outline';
}

/** Figma "Close Button" glyph: two 12px Jet lines, 1.5px wide with square ends. */
export function CloseGlyph({ className }: { className?: string }) {
  return (
    <svg className={cx('syn-close-glyph', className)} width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden focusable="false">
      <path d="M.75.75l10.5 10.5M11.25.75.75 11.25" stroke="currentColor" strokeWidth={1.5} strokeLinecap="square" />
    </svg>
  );
}

/**
 * Round ghost button. Figma: "Close button" and "chevron in dropdown". It has no native `title`: the
 * built-in Syn tooltip shows the label on hover and keyboard focus (see `useButtonTip`).
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, size = 'xs', variant = 'ghost', className, type = 'button', tooltip, tooltipPlacement, tooltipTone, onKeyDown, onMouseLeave, onBlur, onMouseEnter, onFocus, 'aria-describedby': describedBy, ...rest },
  ref,
) {
  const { tip, tipProps, tipClass } = useButtonTip(label, { tooltip, tooltipPlacement, tooltipTone }, { onKeyDown, onMouseLeave, onBlur, onMouseEnter, onFocus, 'aria-describedby': describedBy });
  return (
    <button ref={ref} type={type} aria-label={label} className={cx('syn-icon-button', `syn-icon-button--${size}`, variant === 'outline' && 'syn-icon-button--outline', tipClass, className)} {...rest} {...tipProps}>
      {size === 'xs' && icon === 'close' ? <CloseGlyph /> : <Icon name={icon} size={size === 'xs' || size === 'sm' ? 16 : 20} />}
      {tip}
    </button>
  );
});
