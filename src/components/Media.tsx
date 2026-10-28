import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { IconButton } from './IconButton';
import { cx } from '../utils';
import './Media.css';

export interface AvatarProps {
  /** Person's name, used as the accessible name. Leave it out when the name is printed next to the avatar. */
  name?: string;
  /** Photo URL. Without one the person glyph shows. */
  src?: string;
  /** 24 (comments, replies) or 32. */
  size?: 24 | 32;
  className?: string;
}

/** Round Misty Rose avatar with a person glyph or a photo (record drawer comments). */
export function Avatar({ name, src, size = 24, className }: AvatarProps) {
  return (
    <span className={cx('syn-avatar', `syn-avatar--${size}`, className)} role={name ? 'img' : undefined} aria-label={name} aria-hidden={name ? undefined : true}>
      {src ? <img src={src} alt="" /> : <Icon name="person" size={size === 24 ? 16 : 20} />}
    </span>
  );
}

export interface ThumbnailProps {
  src: string;
  /** Describes the photo, e.g. "Left side, rear door". */
  alt: string;
  /** Edge in px. Default 36. */
  size?: 24 | 36 | 48 | 56;
  onClick?: () => void;
  className?: string;
}

/** Square photo with 4px corners; a button when onClick is given. */
export function Thumbnail({ src, alt, size = 36, onClick, className }: ThumbnailProps) {
  const img = <img src={src} alt={alt} width={size} height={size} />;
  const classes = cx('syn-thumb', className);
  const style = { width: size, height: size };
  return onClick ? (
    <button type="button" className={classes} style={style} onClick={onClick}>{img}</button>
  ) : (
    <span className={classes} style={style}>{img}</span>
  );
}

export interface FileItemProps {
  name: ReactNode;
  /** Second line, e.g. "256 MB". */
  meta?: ReactNode;
  /** File-format icon. Default file-formats-pdf. */
  icon?: IconName;
  /** Cover image: draws the item as an attachment card with the photo on top. */
  preview?: string;
  previewAlt?: string;
  href?: string;
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
}

/**
 * A file: its format badge, name (ABC Favorit Expanded Medium 12) and size. With `preview` it becomes the
 * 224px attachment card from the reference, with the photo on top and a trash button.
 */
export function FileItem({ name, meta, icon = 'file-formats-pdf', preview, previewAlt = '', href, onRemove, removeLabel = 'Remove file', className }: FileItemProps) {
  const title = href ? <a className="syn-file__name" href={href}>{name}</a> : <span className="syn-file__name">{name}</span>;
  return (
    <div className={cx('syn-file', preview && 'syn-file--card', className)}>
      {preview && (
        <div className="syn-file__preview">
          <img src={preview} alt={previewAlt} />
          {onRemove && <IconButton icon="trash-bin" label={removeLabel} size="xs" onClick={onRemove} className="syn-file__remove" />}
        </div>
      )}
      <div className="syn-file__row">
        <Icon name={icon} size={20} className="syn-file__icon" />
        <span className="syn-file__text">
          {title}
          {meta && <span className="syn-file__meta">{meta}</span>}
        </span>
        {!preview && onRemove && <IconButton icon="trash-bin" label={removeLabel} size="xs" onClick={onRemove} />}
      </div>
    </div>
  );
}

export interface EmptyStateProps {
  icon?: IconName;
  children: ReactNode;
  /** A button or link under the message. */
  action?: ReactNode;
  className?: string;
}

/** "Nothing assigned": a muted 32px icon over a Medium 14 message in a bordered 12px box. */
export function EmptyState({ icon = 'empty-state', children, action, className }: EmptyStateProps) {
  return (
    <div className={cx('syn-empty', className)}>
      <Icon name={icon} size={32} />
      <p className="syn-empty__text">{children}</p>
      {action}
    </div>
  );
}

export interface ProgressBarProps {
  /** 0 to 100. */
  value: number;
  /** Text before the percentage, e.g. "1/3". */
  label?: ReactNode;
  /** Accessible name. */
  title?: string;
  className?: string;
}

/** Checklist progress: "1/3", the percentage, then a 4px Dodger Blue bar on a Cultured track. */
export function ProgressBar({ value, label, title = 'Progress', className }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cx('syn-progress', className)}>
      {label && <span className="syn-progress__label">{label}</span>}
      <span className="syn-progress__value">{v}%</span>
      <span className="syn-progress__track" role="progressbar" aria-label={title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={v}>
        <span className="syn-progress__fill" style={{ width: `${v}%` }} />
      </span>
    </div>
  );
}
