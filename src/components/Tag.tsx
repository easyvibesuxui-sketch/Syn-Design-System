import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { cx } from '../utils';
import './Tag.css';

export interface TagProps {
  children: ReactNode;
  /**
   * solid = filled with white text; outline = white with a Silver Chalice border; soft = white with a
   * Cultured border (dates, assignees); dashed = the "Add" button; chip = Figma "close button-tag", a 36px
   * white tag with Regular 14 text and a round close button (Eerie Black border on hover, Cultured when pressed).
   */
  variant?: 'solid' | 'outline' | 'soft' | 'dashed' | 'chip';
  /** Chip: Cultured fill, Gray X border and text; the remove button is disabled. */
  disabled?: boolean;
  /** Chip: a spinner replaces the remove button and the text greys out. */
  loading?: boolean;
  /** Muted text and icon (an unassigned "Project Manager"). */
  muted?: boolean;
  /** Fill of a solid tag, any CSS colour. Defaults to Eerie Black (collaborator initials). */
  color?: string;
  /** 12px icon before the text. */
  icon?: IconName;
  /** pill = fully round (tags, collaborators); rounded = 8px corners (people in a checklist). */
  shape?: 'pill' | 'rounded';
  /** Shows the remove button after the text. */
  onRemove?: () => void;
  removeLabel?: string;
  /** Glyph of the remove button: close (tags) or x-in-circle (collaborators). */
  removeIcon?: IconName;
  /** Makes the whole tag a button (used by the dashed "Add" tag). */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

/** 24px pill from the record reference (tags, collaborators, the dashed "Add" button), or Figma's 36px chip. */
export function Tag({
  children, variant = 'solid', color, icon, shape = 'pill', muted, disabled, loading, onRemove, removeLabel, removeIcon = 'close', onClick, className,
}: TagProps) {
  const classes = cx('syn-tag', `syn-tag--${variant}`, shape === 'rounded' && 'syn-tag--rounded', muted && 'is-muted', disabled && 'is-disabled', loading && 'is-loading', className);
  const chip = variant === 'chip';
  const style = color ? ({ '--tag-bg': color } as CSSProperties) : undefined;
  const body = (
    <>
      {icon && <Icon name={icon} size={12} />}
      <span className="syn-tag__text">{children}</span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={classes} style={style} onClick={onClick}>
        {body}
      </button>
    );
  }
  return (
    <span className={classes} style={style}>
      {body}
      {loading && <span className="syn-tag__spinner" role="status" aria-label="Loading" />}
      {onRemove && !loading && (
        <button
          type="button"
          className="syn-tag__remove"
          aria-label={removeLabel ?? `Remove ${typeof children === 'string' ? children : 'tag'}`}
          disabled={disabled}
          onClick={onRemove}
        >
          <Icon name={removeIcon} size={chip ? 16 : removeIcon === 'close' ? 12 : 16} />
        </button>
      )}
    </span>
  );
}
