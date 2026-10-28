import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import { cx, type ControlSize } from '../utils';
import './IconButton.css';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /** Required: icon-only buttons need an accessible name. */
  label: string;
  /** xs 24px (Figma input "Close button"), sm 36px, md 48px, lg 56px. The glyph is 16px, or 20px from md up. */
  size?: ControlSize;
}

/** Round ghost button. Figma: "Close button" and "chevron in dropdown". */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, size = 'xs', className, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} aria-label={label} title={label} className={cx('syn-icon-button', `syn-icon-button--${size}`, className)} {...rest}>
      <Icon name={icon} size={size === 'xs' || size === 'sm' ? 16 : 20} />
    </button>
  );
});
