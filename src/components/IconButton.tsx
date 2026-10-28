import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import { cx } from '../utils';
import './IconButton.css';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /** Required: icon-only buttons need an accessible name. */
  label: string;
  /** sm 24px (inside inputs), md 30px (toasts, dialogs). */
  size?: 'sm' | 'md';
}

/** Round ghost button. Figma: "Close button" and "chevron in dropdown". */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, size = 'md', className, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} aria-label={label} title={label} className={cx('syn-icon-button', `syn-icon-button--${size}`, className)} {...rest}>
      <Icon name={icon} size={size === 'sm' ? 10 : 12} />
    </button>
  );
});
