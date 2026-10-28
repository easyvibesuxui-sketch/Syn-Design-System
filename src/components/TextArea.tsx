import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { FieldMessages } from './FieldMessages';
import { cx } from '../utils';
import './TextArea.css';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  /** The label is read by screen readers only (comment and checklist editors). Default true. */
  hideLabel?: boolean;
  /** default = 1px Cultured border; strong = 2px Silver Chalice border (comment editor). Both turn Eerie Black on focus. */
  variant?: 'default' | 'strong';
  hint?: string;
  error?: string | string[];
}

/** Multi-line input: 48px minimum, 8px corners, Regular 14 text. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, hideLabel = true, variant = 'default', hint, error, id, className, rows = 2, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `syn-textarea-${autoId}`;
  const invalid = error !== undefined && error.length > 0;
  return (
    <div className={cx('syn-textarea', `syn-textarea--${variant}`, invalid && 'is-invalid', className)}>
      <label htmlFor={inputId} className={hideLabel ? 'syn-visually-hidden' : 'syn-textarea__label'}>{label}</label>
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className="syn-textarea__input"
        aria-invalid={invalid || undefined}
        aria-describedby={hint || invalid ? `${inputId}-messages` : undefined}
        {...rest}
      />
      <FieldMessages id={`${inputId}-messages`} hint={hint} error={error} />
    </div>
  );
});
