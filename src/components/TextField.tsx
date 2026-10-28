import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { IconButton } from './IconButton';
import { FieldMessages } from './FieldMessages';
import { cx } from '../utils';
import './TextField.css';

export type FieldSize = 'sm' | 'md' | 'lg';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'placeholder'> {
  label: string;
  /** sm 36px, md 48px, lg 56px. The label floats above the value on md and lg. */
  size?: FieldSize;
  hint?: string;
  error?: string | string[];
  iconStart?: IconName;
  iconEnd?: IconName;
  /** Short text before or after the value, e.g. "$" or "kg". */
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Shows a clear button while the field has a value. Called after the value is cleared. */
  onClear?: () => void;
  /** Shows "count/maxLength" under the field. Needs maxLength. */
  showCount?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, size = 'lg', hint, error, iconStart, iconEnd, prefix, suffix, onClear, showCount, id, className, disabled, value, defaultValue, onChange, maxLength, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `syn-field-${autoId}`;
  const messagesId = `${inputId}-messages`;
  const invalid = error !== undefined && error.length > 0;
  const [inner, setInner] = useState(String(defaultValue ?? ''));
  const current = value !== undefined ? String(value) : inner;

  return (
    <div className={cx('syn-field', `syn-field--${size}`, invalid && 'is-invalid', disabled && 'is-disabled', className)}>
      <div className="syn-field__box">
        {iconStart && <Icon name={iconStart} size={20} className="syn-field__icon" />}
        {prefix && <span className="syn-field__affix">{prefix}</span>}
        <div className="syn-field__stack">
          <input
            ref={ref}
            id={inputId}
            className="syn-field__input"
            placeholder=" "
            disabled={disabled}
            value={value}
            defaultValue={value === undefined ? defaultValue : undefined}
            maxLength={maxLength}
            aria-invalid={invalid || undefined}
            aria-describedby={hint || invalid ? messagesId : undefined}
            onChange={(e) => {
              if (value === undefined) setInner(e.target.value);
              onChange?.(e);
            }}
            {...rest}
          />
          <label htmlFor={inputId} className="syn-field__label">{label}</label>
        </div>
        {suffix && <span className="syn-field__affix">{suffix}</span>}
        {onClear && current && !disabled && (
          <IconButton
            icon="close"
            label={`Clear ${label}`}
            size="sm"
            onClick={() => {
              if (value === undefined) setInner('');
              onClear();
            }}
          />
        )}
        {iconEnd && <Icon name={iconEnd} size={20} className="syn-field__icon" />}
      </div>
      <div className="syn-field__footer">
        <FieldMessages id={messagesId} hint={hint} error={error} />
        {showCount && maxLength !== undefined && (
          <span className="syn-field__count">{current.length}/{maxLength}</span>
        )}
      </div>
    </div>
  );
});
