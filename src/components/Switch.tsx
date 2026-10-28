import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { FieldMessages } from './FieldMessages';
import { cx } from '../utils';
import './Switch.css';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: ReactNode;
  /** sm 34×20, md 48×24, lg 50×32. */
  size?: 'sm' | 'md' | 'lg';
  /** Show "On"/"Off" captions either side of the track (Figma "Toggle with label"). */
  stateLabels?: [on: string, off: string];
  /** Visually hide the label but keep it for assistive tech. */
  hideLabel?: boolean;
  error?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, size = 'md', stateLabels, hideLabel, error, id, className, disabled, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `syn-switch-${autoId}`;
  return (
    <div className={cx('syn-switch', `syn-switch--${size}`, error && 'is-invalid', disabled && 'is-disabled', className)}>
      <label className="syn-switch__row" htmlFor={inputId}>
        <span className={cx('syn-switch__label', hideLabel && 'syn-visually-hidden')}>{label}</span>
        {stateLabels && <span className="syn-switch__state" aria-hidden>{stateLabels[0]}</span>}
        <span className="syn-switch__control">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            role="switch"
            className="syn-switch__input"
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-messages` : undefined}
            {...rest}
          />
          <span className="syn-switch__track" aria-hidden />
          <span className="syn-switch__thumb" aria-hidden />
        </span>
        {stateLabels && <span className="syn-switch__state" aria-hidden>{stateLabels[1]}</span>}
      </label>
      <FieldMessages id={`${inputId}-messages`} error={error} />
    </div>
  );
});
