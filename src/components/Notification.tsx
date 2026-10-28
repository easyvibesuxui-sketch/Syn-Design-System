import type { HTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { IconButton } from './IconButton';
import { cx } from '../utils';
import './Notification.css';

export type NotificationTone = 'info' | 'success' | 'warning' | 'error';

export interface NotificationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: NotificationTone;
  /** inline = one-line banner inside a page; toast = floating card with title, message and timestamp. */
  variant?: 'inline' | 'toast';
  title?: ReactNode;
  children?: ReactNode;
  timestamp?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
}

const toneIcon: Record<NotificationTone, IconName> = {
  info: 'info-circle',
  success: 'check-circle',
  warning: 'warning',
  error: 'close-circle',
};

/** Figma "Notification - High Contrast": white card, 3px status bar on the left, soft float shadow. */
export function Notification({ tone = 'info', variant = 'inline', title, children, timestamp, onClose, closeLabel = 'Dismiss', className, ...rest }: NotificationProps) {
  return (
    <div
      role={tone === 'error' || tone === 'warning' ? 'alert' : 'status'}
      className={cx('syn-notification', `syn-notification--${tone}`, `syn-notification--${variant}`, className)}
      {...rest}
    >
      <Icon name={toneIcon[tone]} size={variant === 'toast' ? 24 : 18} className="syn-notification__icon" />
      <div className="syn-notification__body">
        {title && <p className="syn-notification__title">{title}</p>}
        {children && <div className="syn-notification__message">{children}</div>}
        {timestamp && <p className="syn-notification__time">{timestamp}</p>}
      </div>
      {onClose && <IconButton icon="close" label={closeLabel} size="xs" onClick={onClose} />}
    </div>
  );
}
