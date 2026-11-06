import type { HTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { IconButton } from './IconButton';
import { cx } from '../utils';
import './Notification.css';

export type NotificationTone = 'info' | 'success' | 'warning' | 'error';

export interface NotificationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: NotificationTone;
  /** inline = Figma "Notification - High Contrast - Inline"; toast = "- Toast" (title, message, timestamp, big icon). */
  variant?: 'inline' | 'toast';
  /** Inline: Montserrat Medium 14/18. Toast: SemiBold 14. */
  title?: ReactNode;
  /** Inline: the subtitle; toast: the message. Montserrat Regular 12/15. */
  children?: ReactNode;
  /** Toast only: Montserrat Regular 14 at the bottom, e.g. "Time stamp 12:05:10". */
  timestamp?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
}

/** Figma icons per state: Info circle, the red pause circle for errors, Warning, the green check circle. */
const toneIcon: Record<NotificationTone, IconName> = {
  info: 'info-circle',
  success: 'check-in-circle',
  warning: 'warning',
  error: 'pause-circle',
};

/**
 * Figma "Notification - High Contrast": a card with a status bar on the left, 12px corners and the float
 * shadow. Inline is 360 wide (icon, title over subtitle, close); toast is 288 wide (title, message and
 * timestamp on the left; close on top and a 32px status icon at the bottom on the right).
 */
export function Notification({ tone = 'info', variant = 'inline', title, children, timestamp, onClose, closeLabel = 'Dismiss', className, ...rest }: NotificationProps) {
  const toast = variant === 'toast';
  return (
    <div
      role={tone === 'error' || tone === 'warning' ? 'alert' : 'status'}
      className={cx('syn-notification', `syn-notification--${tone}`, `syn-notification--${variant}`, className)}
      {...rest}
    >
      {!toast && <Icon name={toneIcon[tone]} size={18} className="syn-notification__icon" />}
      <div className="syn-notification__body">
        <div className="syn-notification__text">
          {title && <p className="syn-notification__title">{title}</p>}
          {children && <div className="syn-notification__message">{children}</div>}
        </div>
        {toast && timestamp && <p className="syn-notification__time">{timestamp}</p>}
      </div>
      <div className="syn-notification__side">
        {onClose && <IconButton icon="close" label={closeLabel} size="xs" onClick={onClose} />}
        {toast && <Icon name={toneIcon[tone]} size={32} className="syn-notification__icon" />}
      </div>
    </div>
  );
}
