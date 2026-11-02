import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { getIcon } from '../icons/icon-data';
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
  /**
   * inside (default) = the Figma inputs: the label sits in the box. outside = the label sits above the box
   * (Regular 14 Jet, 12 at sm and xs) and the box shows only the placeholder, then the value.
   */
  labelPosition?: 'inside' | 'outside';
  /** A control after the clear button, e.g. the password eye. */
  endAdornment?: ReactNode;
  /**
   * outline (default) = the bordered field. plain = Figma "Search no Outline": no border in any state, a 1px
   * Silver Chalice line under the text while focused, Cultured when disabled.
   */
  variant?: 'outline' | 'plain';
  /** Figma "Waiting" (e.g. a password being filled in): label and text turn Silver Chalice and the field is read-only. */
  waiting?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label, size = 'lg', hideLabel = false, placeholder, hint, error, iconStart, iconEnd, prefix, suffix, onClear, showCount,
    persistentLabel = false, clearVisibility = 'typing', labelPosition = 'inside', endAdornment, variant = 'outline', waiting = false,
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
  const outside = labelPosition === 'outside' && !hideLabel;
  const noLabel = hideLabel || size === 'xs' || outside;
  const endIconSize = iconEnd && getIcon(iconEnd)?.width === 24 ? 24 : 20;

  return (
    <div
      className={cx(
        'syn-field',
        `syn-field--${size}`,
        noLabel ? 'syn-field--no-label' : persistentLabel ? 'syn-field--fixed-label' : 'syn-field--floating',
        outside && 'syn-field--outside',
        variant === 'plain' && 'syn-field--plain',
        waiting && 'is-waiting',
        hasValue && 'has-value',
        invalid && 'is-invalid',
        disabled && 'is-disabled',
        className,
      )}
    >
      {outside && <label htmlFor={inputId} className="syn-field__outer-label">{label}</label>}
      <div className="syn-field__box">
        {iconStart && <Icon name={iconStart} size={20} className="syn-field__icon" />}
        {prefix && <span className="syn-field__affix syn-field__affix--prefix">{prefix}</span>}
        <div className="syn-field__stack">
          {!outside && <label htmlFor={inputId} className={noLabel ? 'syn-visually-hidden' : 'syn-field__label'}>{label}</label>}
          <input
            ref={ref}
            id={inputId}
            className="syn-field__input"
            placeholder={placeholder ?? label}
            disabled={disabled}
            readOnly={waiting || rest.readOnly}
            aria-busy={waiting || undefined}
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
        {suffix && <span className="syn-field__affix syn-field__affix--suffix">{suffix}</span>}
        {endAdornment}
        {iconEnd && <Icon name={iconEnd} size={endIconSize} className="syn-field__icon" />}
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
