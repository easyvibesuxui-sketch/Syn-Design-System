import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import { cx } from '../utils';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'brand' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = Eerie Black fill, secondary = outline, accent = Amber fill, brand = Candy Apple fill, text = no chrome. */
  variant?: ButtonVariant;
  /** sm 36px, md 48px, lg 56px. */
  size?: ButtonSize;
  iconStart?: IconName;
  iconEnd?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
}

const iconSize: Record<ButtonSize, number> = { sm: 16, md: 20, lg: 20 };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'lg', iconStart, iconEnd, loading = false, fullWidth = false, disabled, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx('syn-button', `syn-button--${variant}`, `syn-button--${size}`, fullWidth && 'syn-button--full', loading && 'is-loading', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="syn-button__spinner" aria-hidden /> : iconStart && <Icon name={iconStart} size={iconSize[size]} />}
      <span className="syn-button__label">{children}</span>
      {iconEnd && !loading && <Icon name={iconEnd} size={iconSize[size]} />}
    </button>
  );
});
