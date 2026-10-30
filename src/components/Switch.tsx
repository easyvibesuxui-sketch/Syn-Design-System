import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon } from './Icon';
import { ChoiceMessage, type ChoiceErrorStyle } from './FieldMessages';
import { cx } from '../utils';
import './Switch.css';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Accessible name. Shown to the right of the toggle unless hideLabel is set. */
  label: ReactNode;
  hideLabel?: boolean;
  /** Height in px: 20 = Figma "Small toggle" (32 x 20), 24 = "Default size toggle" (48 x 24), 32 = "Big toggle" (48 x 32). */
  size?: 20 | 24 | 32;
  /**
   * Figma "Toggle with Text and icon": "On" inside the track when on, a check when off. Sizes 20 and 24
   * (the control grows to 38 x 20 and 52 x 24).
   */
  indicator?: boolean;
  /** Word shown in the track when on, with `indicator`. Default "On". */
  indicatorText?: string;
  /** Figma "Loading": a spinner inside the thumb. The switch is not interactive meanwhile. */
  loading?: boolean;
  error?: string;
  /** tooltip = Figma "Error off" bubble, inline = Figma "Error on" red text. */
  errorStyle?: ChoiceErrorStyle;
  /** Words on either side of the toggle, e.g. "No" and "Yes" in the record drawer's custom fields. */
  offLabel?: ReactNode;
  onLabel?: ReactNode;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, hideLabel = true, size = 24, indicator, indicatorText = 'On', loading, error, errorStyle = 'inline', offLabel, onLabel, id, className, disabled, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `syn-switch-${autoId}`;
  return (
    <div
      className={cx('syn-switch', `syn-switch--${size}`, indicator && size !== 32 && 'syn-switch--indicator', error && 'is-invalid', disabled && 'is-disabled', loading && 'is-loading', className)}
    >
      <label className="syn-switch__row" htmlFor={inputId}>
        {offLabel && <span className="syn-switch__state" aria-hidden>{offLabel}</span>}
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
          <span className="syn-switch__track" aria-hidden>
            {indicator && size !== 32 && (
              <>
                <span className="syn-switch__on-text">{indicatorText}</span>
                <Icon name="check" size={size === 20 ? 12 : 14} className="syn-switch__check" />
              </>
            )}
          </span>
          <span className="syn-switch__thumb" aria-hidden>
            {loading && <span className="syn-switch__spinner" />}
          </span>
        </span>
        {onLabel && <span className="syn-switch__state" aria-hidden>{onLabel}</span>}
        <span className={cx('syn-switch__label', hideLabel && 'syn-visually-hidden')}>{label}</span>
      </label>
      <ChoiceMessage id={`${inputId}-message`} error={error} variant={errorStyle} />
    </div>
  );
});
