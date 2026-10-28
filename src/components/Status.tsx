import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { cx } from '../utils';
import './Status.css';

export interface StatusChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  /** xs 24px pill, sm 36px, md 48px, lg 56px (Figma "Status Container" Small pill, Small, Default, Big). */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Trailing icon. Figma draws the 20px Down chevron in every state. */
  icon?: IconName;
  children: ReactNode;
}

/**
 * Figma "Status Container": Default (Cultured border, Jet Medium 12), Focused (Eerie Black border), Selected
 * (Mantis fill, white text), Selected hover (80%), Selected focused and Disabled (Cultured fill, Silver Chalince text).
 */
export function StatusChip({ selected = false, size = 'xs', icon = 'down', className, children, type = 'button', ...rest }: StatusChipProps) {
  return (
    <button type={type} aria-pressed={selected} className={cx('syn-status-chip', `syn-status-chip--${size}`, className)} {...rest}>
      <span>{children}</span>
      {icon && <Icon name={icon} size={20} />}
    </button>
  );
}

export type StatusTone = 'progress' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
  children: ReactNode;
}

/** Read-only status label with a coloured dot (Figma: Status Indicator). */
export function StatusBadge({ tone = 'progress', className, children, ...rest }: StatusBadgeProps) {
  return (
    <span className={cx('syn-status-badge', `syn-status-badge--${tone}`, className)} {...rest}>
      <span className="syn-status-badge__dot" aria-hidden />
      {children}
    </span>
  );
}
