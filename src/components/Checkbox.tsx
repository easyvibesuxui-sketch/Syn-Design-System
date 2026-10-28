import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { ChoiceMessage, type ChoiceErrorStyle } from './FieldMessages';
import { cx } from '../utils';
import './Choice.css';

export type ChoiceSize = 20 | 24;
export type CheckboxShape = 'square' | 'round';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: ReactNode;
  /** Box size in px: Figma "Checkbox 20 px" and "Checkbox 24 px". */
  size?: ChoiceSize;
  /** square = 2px corners (Figma checkbox), round = a circle with the check centred. */
  shape?: CheckboxShape;
  error?: string;
  /** tooltip = Figma "error 1", inline = Figma "Error 2". */
  errorStyle?: ChoiceErrorStyle;
}

/** Check paths exported from Figma, positioned in the box as drawn there. */
const CHECK = {
  20: { x: 3, y: 4, w: 14, h: 12, d: 'M0.68 5.19L5.5 9.77L12.87 0.62' },
  24: { x: 4, y: 3, w: 17, h: 14, d: 'M0.7 6.4L6.57 12.19L15.57 0.61' },
} as const;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, size = 20, shape = 'square', error, errorStyle = 'inline', id, className, disabled, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `syn-checkbox-${autoId}`;
  const check = CHECK[size];
  // The round box has no Figma check position, so the mark is centred in the circle.
  const at = shape === 'round' ? { left: (size - check.w) / 2, top: (size - check.h) / 2 } : { left: check.x, top: check.y };

  return (
    <div className={cx('syn-choice', `syn-choice--${size}`, `syn-choice--${shape}`, error && 'is-invalid', disabled && 'is-disabled', className)}>
      <label className="syn-choice__row" htmlFor={inputId}>
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="syn-choice__input"
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-message` : undefined}
          {...rest}
        />
        <span className="syn-choice__box syn-choice__box--check" aria-hidden>
          <svg
            className="syn-choice__mark"
            width={check.w}
            height={check.h}
            viewBox={`0 0 ${check.w} ${check.h}`}
            style={at}
            fill="none"
          >
            <path d={check.d} stroke="currentColor" strokeWidth="2" />
          </svg>
        </span>
        <span className="syn-choice__label">
          {label}
          {error && <span className="syn-choice__required" aria-hidden>*</span>}
        </span>
      </label>
      <ChoiceMessage id={`${inputId}-message`} error={error} variant={errorStyle} />
    </div>
  );
});
