import { forwardRef, useId, useState, type TextareaHTMLAttributes } from 'react';
import { FieldMessages } from './FieldMessages';
import { CloseGlyph } from './IconButton';
import { cx } from '../utils';
import './TextArea.css';

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label: string;
  /** The label is read by screen readers only (comment and checklist editors). Default true. */
  hideLabel?: boolean;
  /**
   * Where a shown label sits. inside = Figma "Text Box": Regular 14 at the top of the box while empty, then
   * Regular 12 (Candy Apple when focused, Silver Chalice when filled) over the text. outside = above the box.
   */
  labelPosition?: 'inside' | 'outside';
  /** Inside label only: lg 64px, md 56px, sm 48px minimum height (Figma Text Box Large, Medium, Small). */
  size?: 'lg' | 'md' | 'sm';
  /** default = 1px Cultured border; strong = 2px Silver Chalice border (comment editor). Both turn Eerie Black on focus. */
  variant?: 'default' | 'strong';
  hint?: string;
  error?: string | string[];
  /** Shows "count/maxLength" under the box, right-aligned (Figma "0/20"). Needs maxLength. */
  showCount?: boolean;
  /** Adds Figma's small round clear button in the top-right corner; it shows only while typing. */
  onClear?: () => void;
}

/** Multi-line input with 8px corners: the Figma "Text Box" with the label inside, or with the label above. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    label, hideLabel = true, labelPosition = 'inside', size = 'lg', variant = 'default', hint, error, showCount, onClear,
    id, className, rows, value, defaultValue, onChange, maxLength, disabled, ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `syn-textarea-${autoId}`;
  const messagesId = `${inputId}-messages`;
  const invalid = error !== undefined && error.length > 0;
  const [inner, setInner] = useState(String(defaultValue ?? ''));
  const current = value !== undefined ? String(value) : inner;
  const inside = !hideLabel && labelPosition === 'inside';
  const counter = showCount && maxLength !== undefined;

  const input = (
    <textarea
      ref={ref}
      id={inputId}
      rows={rows ?? (!hideLabel && labelPosition === 'inside' ? 1 : 2)}
      className="syn-textarea__input"
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      maxLength={maxLength}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      aria-describedby={hint || invalid ? messagesId : undefined}
      onChange={(e) => {
        if (value === undefined) setInner(e.target.value);
        onChange?.(e);
      }}
      {...rest}
    />
  );

  return (
    <div
      className={cx(
        'syn-textarea',
        `syn-textarea--${variant}`,
        inside && 'syn-textarea--inside',
        inside && `syn-textarea--${size}`,
        current.length > 0 && 'has-value',
        invalid && 'is-invalid',
        disabled && 'is-disabled',
        className,
      )}
    >
      {!inside && <label htmlFor={inputId} className={hideLabel ? 'syn-visually-hidden' : 'syn-textarea__label'}>{label}</label>}
      {inside ? (
        <div className="syn-textarea__box">
          <label htmlFor={inputId} className="syn-textarea__label">{label}</label>
          {input}
          {onClear && current.length > 0 && !disabled && (
            <button
              type="button"
              className="syn-textarea__clear"
              aria-label={`Clear ${label}`}
              onClick={() => {
                if (value === undefined) setInner('');
                onClear();
              }}
            >
              <CloseGlyph />
            </button>
          )}
        </div>
      ) : (
        input
      )}
      {(hint || invalid || counter) && (
        <div className="syn-textarea__footer">
          <FieldMessages id={messagesId} hint={hint} error={error} />
          {counter && <span className="syn-textarea__count">{current.length}/{maxLength}</span>}
        </div>
      )}
    </div>
  );
});
