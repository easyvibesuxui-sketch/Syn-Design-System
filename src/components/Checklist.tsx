import type { ReactNode } from 'react';
import { Checkbox } from './Checkbox';
import { TextArea } from './TextArea';
import { cx } from '../utils';
import './Checklist.css';

export interface ChecklistItemProps {
  /** The task. While `editing`, it is the text area's starting value. */
  children?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Accessible name of the checkbox when the text is not a plain string. */
  label?: string;
  /** Shows a text area in place of the text, framed by a 1px Eerie Black border (reference: new item). */
  editing?: boolean;
  editValue?: string;
  onEditChange?: (value: string) => void;
  placeholder?: string;
  /** Bottom left, e.g. the assignee Tag. */
  assignee?: ReactNode;
  /** Bottom right, e.g. the due date Tag. */
  due?: ReactNode;
  /** Top right, e.g. a more IconButton. */
  actions?: ReactNode;
  /** Under the footer, e.g. the people Tags. */
  extra?: ReactNode;
  /** The task cannot be changed: Gray X text and checkbox, no hover. */
  disabled?: boolean;
  /** While editing: a message under the text area (e.g. "Write the task first"). */
  error?: string;
  className?: string;
}

/**
 * One task of a checklist: a 20px checkbox and Regular 14 text, the assignee and due date under it and a
 * more button on the right, on a Smoke row with 8px corners. States: default, hover (Cultured), done
 * (checked: Silver Chalice, struck through), editing (1px Eerie Black frame), error and disabled.
 */
export function ChecklistItem({
  children, checked, defaultChecked, onCheckedChange, label, editing, editValue, onEditChange, placeholder = 'Describe the task',
  assignee, due, actions, extra, disabled, error, className,
}: ChecklistItemProps) {
  const name = label ?? (typeof children === 'string' ? children : 'Task');
  return (
    <li className={cx('syn-checklist-item', editing && 'is-editing', disabled && 'is-disabled', error && 'is-invalid', className)}>
      <div className="syn-checklist-item__main">
        <Checkbox
          label={editing ? name : children}
          className={cx('syn-checklist-item__check', editing && 'has-hidden-label')}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
        />
        {editing && (
          <TextArea label={name} error={error} value={editValue} onChange={(e) => onEditChange?.(e.target.value)} placeholder={placeholder} className="syn-checklist-item__editor" />
        )}
        {actions && <div className="syn-checklist-item__actions">{actions}</div>}
      </div>
      {(assignee || due) && (
        <div className="syn-checklist-item__footer">
          <div>{assignee}</div>
          <div>{due}</div>
        </div>
      )}
      {extra && <div className="syn-checklist-item__extra">{extra}</div>}
    </li>
  );
}

export interface ChecklistProps {
  children: ReactNode;
  className?: string;
}

/** The list that holds ChecklistItems, 8px apart. */
export function Checklist({ children, className }: ChecklistProps) {
  return <ul className={cx('syn-checklist', className)}>{children}</ul>;
}
