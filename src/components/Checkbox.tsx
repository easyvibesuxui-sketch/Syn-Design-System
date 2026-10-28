import { forwardRef, useEffect, useId, useImperativeHandle, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { FieldMessages } from './FieldMessages';
import { cx } from '../utils';
import './Choice.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: ReactNode;
  /** md 20px box, lg 24px box. */
  size?: 'md' | 'lg';
  indeterminate?: boolean;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, size = 'md', indeterminate = false, error, id, className, disabled, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `syn-checkbox-${autoId}`;
  const inner = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inner.current as HTMLInputElement);
  useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div className={cx('syn-choice', `syn-choice--${size}`, error && 'is-invalid', disabled && 'is-disabled', className)}>
      <label className="syn-choice__row" htmlFor={inputId}>
        <input
          ref={inner}
          id={inputId}
          type="checkbox"
          className="syn-choice__input"
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-messages` : undefined}
          {...rest}
        />
        <span className="syn-choice__box syn-choice__box--check" aria-hidden>
          <svg viewBox="0 0 14 11" className="syn-choice__mark"><path d="M1 5.5 5 9.5 13 1.5" /></svg>
          <svg viewBox="0 0 14 11" className="syn-choice__dash"><path d="M2 5.5h10" /></svg>
        </span>
        <span className="syn-choice__label">{label}</span>
      </label>
      <FieldMessages id={`${inputId}-messages`} error={error} />
    </div>
  );
});
