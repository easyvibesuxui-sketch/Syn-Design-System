import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { IconButton } from './IconButton';
import { FieldMessages } from './FieldMessages';
import { cx, type ControlSize } from '../utils';
import './TextField.css';

export type FieldSize = ControlSize;

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label: string;
  /**
   * lg 56px (Figma "Large input"), md 48px ("Default size input"), sm 36px ("Small size input"), xs 24px.
   * xs is too short for a label inside, so it always renders without one.
   */
  size?: FieldSize;
  /**
   * Input without a label: only the placeholder and then the value show inside the field. The label is
   * still read by screen readers. By default the label sits inside the field.
   */
  hideLabel?: boolean;
  /** Shown while the field is empty. Defaults to the label, as in Figma. */
  placeholder?: string;
  hint?: string;
  error?: string | string[];
  /** 20px Silver Chalice icon before the text, e.g. the person icon. */
  iconStart?: IconName;
  /**
   * Figma "input large" (with hint): the label stays above the placeholder in every state, Regular 14 over
   * Regular 16. By default the label is the placeholder until the field has focus or a value, then moves up.
   */
  persistentLabel?: boolean;
  iconEnd?: IconName;
  /** Short text before or after the value, e.g. "$" or "kg". */
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Adds the 24px clear button. Called after the value is cleared. */
  onClear?: () => void;
  /**
   * typing (default) = Figma: the clear button shows only while the field has focus and a value.
   * always = Figma "input large" and "multiple error": it shows in every state, empty and disabled included.
   */
  clearVisibility?: 'typing' | 'always';
  /** Shows "count/maxLength" under the field. Needs maxLength. */
  showCount?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label, size = 'lg', hideLabel = false, placeholder, hint, error, iconStart, iconEnd, prefix, suffix, onClear, showCount,
    persistentLabel = false, clearVisibility = 'typing',
    id, className, disabled, value, defaultValue, onChange, maxLength, ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `syn-field-${autoId}`;
  const messagesId = `${inputId}-messages`;
  const invalid = error !== undefined && error.length > 0;
  const [inner, setInner] = useState(String(defaultValue ?? ''));
  const current = value !== undefined ? String(value) : inner;
  const hasValue = current.length > 0;
  const noLabel = hideLabel || size === 'xs';

  return (
    <div
      className={cx(
        'syn-field',
        `syn-field--${size}`,
        noLabel ? 'syn-field--no-label' : persistentLabel ? 'syn-field--fixed-label' : 'syn-field--floating',
        hasValue && 'has-value',
        invalid && 'is-invalid',
        disabled && 'is-disabled',
        className,
      )}
    >
      <div className="syn-field__box">
        {iconStart && <Icon name={iconStart} size={20} className="syn-field__icon" />}
        {prefix && <span className="syn-field__affix">{prefix}</span>}
        <div className="syn-field__stack">
          <label htmlFor={inputId} className={noLabel ? 'syn-visually-hidden' : 'syn-field__label'}>{label}</label>
          <input
            ref={ref}
            id={inputId}
            className="syn-field__input"
            placeholder={placeholder ?? label}
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
        </div>
        {suffix && <span className="syn-field__affix">{suffix}</span>}
        {onClear && (clearVisibility === 'always' || (hasValue && !disabled)) && (
          <IconButton
            icon="close"
            label={`Clear ${label}`}
            size="xs"
            disabled={disabled}
            className={cx('syn-field__clear', clearVisibility === 'typing' && 'syn-field__clear--typing')}
            onClick={() => {
              if (value === undefined) setInner('');
              onClear();
            }}
          />
        )}
        {iconEnd && <Icon name={iconEnd} size={20} className="syn-field__icon" />}
      </div>
      {(hint || invalid || (showCount && maxLength !== undefined)) && (
        <div className="syn-field__footer">
          <FieldMessages id={messagesId} hint={hint} error={error} dimmed={invalid && disabled} />
          {showCount && maxLength !== undefined && (
            <span className="syn-field__count">{current.length}/{maxLength}</span>
          )}
        </div>
      )}
    </div>
  );
});
