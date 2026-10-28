import { createContext, forwardRef, useContext, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { FieldMessages } from './FieldMessages';
import { cx } from '../utils';
import './Choice.css';

interface RadioGroupContextValue {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  size: 'md' | 'lg';
  disabled?: boolean;
  invalid: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
  label: ReactNode;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  size?: 'md' | 'lg';
  disabled?: boolean;
  error?: string;
  /** Lay the options out in a row instead of a column. */
  inline?: boolean;
  children: ReactNode;
  className?: string;
}

export function RadioGroup({ label, name, value, onChange, size = 'md', disabled, error, inline, children, className }: RadioGroupProps) {
  const autoId = useId();
  const groupName = name ?? `syn-radio-${autoId}`;
  return (
    <fieldset
      className={cx('syn-radio-group', inline && 'syn-radio-group--inline', className)}
      disabled={disabled}
      aria-describedby={error ? `${groupName}-messages` : undefined}
    >
      <legend className="syn-radio-group__legend">{label}</legend>
      <div className="syn-radio-group__options">
        <RadioGroupContext.Provider value={{ name: groupName, value, onChange, size, disabled, invalid: Boolean(error) }}>
          {children}
        </RadioGroupContext.Provider>
      </div>
      <FieldMessages id={`${groupName}-messages`} error={error} />
    </fieldset>
  );
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'onChange'> {
  label: ReactNode;
  value: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio({ label, value, id, className, disabled, ...rest }, ref) {
  const group = useContext(RadioGroupContext);
  const autoId = useId();
  const inputId = id ?? `syn-radio-option-${autoId}`;
  const size = group?.size ?? 'md';
  const isDisabled = disabled ?? group?.disabled;
  return (
    <div className={cx('syn-choice', `syn-choice--${size}`, group?.invalid && 'is-invalid', isDisabled && 'is-disabled', className)}>
      <label className="syn-choice__row" htmlFor={inputId}>
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className="syn-choice__input"
          name={group?.name}
          value={value}
          checked={group?.value !== undefined ? group.value === value : undefined}
          onChange={() => group?.onChange?.(value)}
          disabled={isDisabled}
          {...rest}
        />
        <span className="syn-choice__box syn-choice__box--radio" aria-hidden />
        <span className="syn-choice__label">{label}</span>
      </label>
    </div>
  );
});
