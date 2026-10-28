import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { ChoiceMessage, type ChoiceErrorStyle } from './FieldMessages';
import { cx } from '../utils';
import './Switch.css';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Accessible name. Shown to the right of the toggle unless hideLabel is set. */
  label: ReactNode;
  hideLabel?: boolean;
  /** Height in px: 20 = Figma "Small toggle" (34 x 20), 24 = "Default size toggle" (48 x 24). */
  size?: 20 | 24;
  /** Figma "Loading": a spinner inside the thumb. The switch is not interactive meanwhile. */
  loading?: boolean;
  error?: string;
  /** tooltip = Figma "Error off" bubble, inline = Figma "Error on" red text. */
  errorStyle?: ChoiceErrorStyle;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, hideLabel = true, size = 24, loading, error, errorStyle = 'inline', id, className, disabled, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `syn-switch-${autoId}`;
  return (
    <div
      className={cx('syn-switch', `syn-switch--${size}`, error && 'is-invalid', disabled && 'is-disabled', loading && 'is-loading', className)}
    >
      <label className="syn-switch__row" htmlFor={inputId}>
        <span className="syn-switch__control">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            role="switch"
            className="syn-switch__input"
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-message` : undefined}
            {...rest}
          />
          <span className="syn-switch__track" aria-hidden />
          <span className="syn-switch__thumb" aria-hidden>
            {loading && <span className="syn-switch__spinner" />}
          </span>
        </span>
        <span className={cx('syn-switch__label', hideLabel && 'syn-visually-hidden')}>{label}</span>
      </label>
      <ChoiceMessage id={`${inputId}-message`} error={error} variant={errorStyle} />
    </div>
  );
});
