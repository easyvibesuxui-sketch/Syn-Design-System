import { createContext, forwardRef, useContext, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { ChoiceMessage, type ChoiceErrorStyle } from './FieldMessages';
import type { ChoiceSize } from './Checkbox';
import { cx } from '../utils';
import './Choice.css';

interface RadioGroupContextValue {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  size: ChoiceSize;
  disabled?: boolean;
  invalid: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
  /** Group name for assistive tech. Shown above the options unless hideLabel is set. */
  label: ReactNode;
  hideLabel?: boolean;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  /** Circle size in px: Figma "radio group 20 px" and "radio group 24 px". */
  size?: ChoiceSize;
  disabled?: boolean;
  error?: string;
  errorStyle?: ChoiceErrorStyle;
  /** Lay the options out in a row instead of a column. */
  inline?: boolean;
  children: ReactNode;
  className?: string;
}

export function RadioGroup({
  label, hideLabel, name, value, onChange, size = 20, disabled, error, errorStyle = 'inline', inline, children, className,
}: RadioGroupProps) {
  const autoId = useId();
  const groupName = name ?? `syn-radio-${autoId}`;
  return (
    <fieldset
      className={cx('syn-radio-group', inline && 'syn-radio-group--inline', className)}
      disabled={disabled}
      aria-describedby={error ? `${groupName}-message` : undefined}
    >
      <legend className={cx('syn-radio-group__legend', hideLabel && 'syn-visually-hidden')}>{label}</legend>
      <div className="syn-radio-group__options">
        <RadioGroupContext.Provider value={{ name: groupName, value, onChange, size, disabled, invalid: Boolean(error) }}>
          {children}
        </RadioGroupContext.Provider>
      </div>
      <ChoiceMessage id={`${groupName}-message`} error={error} variant={errorStyle} />
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
  const size = group?.size ?? 20;
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
