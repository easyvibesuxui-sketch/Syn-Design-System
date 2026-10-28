import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { cx } from '../utils';
import './Tag.css';

export interface TagProps {
  children: ReactNode;
  /** solid = filled pill with white text; outline = white with a Silver Chalice border; dashed = "Add" button. */
  variant?: 'solid' | 'outline' | 'dashed';
  /** Fill of a solid tag, any CSS colour. Defaults to Eerie Black (collaborator initials). */
  color?: string;
  /** 12px icon before the text. */
  icon?: IconName;
  /** Shows the remove button after the text. */
  onRemove?: () => void;
  removeLabel?: string;
  /** Makes the whole tag a button (used by the dashed "Add" tag). */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

/** 24px pill from the record reference: tags, collaborators and the dashed "Add" button. */
export function Tag({ children, variant = 'solid', color, icon, onRemove, removeLabel, onClick, className }: TagProps) {
  const classes = cx('syn-tag', `syn-tag--${variant}`, className);
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
      {onRemove && (
        <button
          type="button"
          className="syn-tag__remove"
          aria-label={removeLabel ?? `Remove ${typeof children === 'string' ? children : 'tag'}`}
          onClick={onRemove}
        >
          <Icon name="close" size={12} />
        </button>
      )}
    </span>
  );
}
