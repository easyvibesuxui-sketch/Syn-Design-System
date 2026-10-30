import { forwardRef, useId, useState, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { Icon } from './Icon';
import { FieldMessages } from './FieldMessages';
import { cx } from '../utils';
import './TextField.css';
import './QuantityField.css';

export interface QuantityFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max' | 'step' | 'prefix'> {
  label: string;
  /** Shows the label above the field (Figma "Quantity Field Label": Regular 16 Jet, 16px gap). Default false. */
  showLabel?: boolean;
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** lg 56px (default), md 48px, sm 36px. */
  size?: 'lg' | 'md' | 'sm';
  /** Shown while the field is empty. Default "Quantity". */
  placeholder?: string;
  /** Text before or after the number inside the field, e.g. "Pref" / "kg". */
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** At the minimum the − button becomes a trash button that calls this (Figma: "1" with the bin). */
  onRemove?: () => void;
  hint?: string;
  error?: string | string[];
  decreaseLabel?: string;
  increaseLabel?: string;
  removeLabel?: string;
}

/**
 * Figma "Quantity field type 2" with the − and + buttons inside the field: a centred number between two
 * square buttons with 8px corners. Up/Down arrows step the value; errors draw the Vermilion border.
 */
export const QuantityField = forwardRef<HTMLInputElement, QuantityFieldProps>(function QuantityField(
  {
    label, showLabel = false, value, defaultValue = null, onChange, min = 0, max = Infinity, step = 1, size = 'lg',
    placeholder = 'Quantity', prefix, suffix, onRemove, hint, error, disabled, id, className,
    decreaseLabel = 'Decrease', increaseLabel = 'Increase', removeLabel = 'Remove', ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `syn-quantity-${autoId}`;
  const messagesId = `${inputId}-messages`;
  const invalid = error !== undefined && error.length > 0;
  const [inner, setInner] = useState<number | null>(defaultValue);
  const current = value !== undefined ? value : inner;
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const set = (next: number | null) => {
    const v = next === null ? null : clamp(next);
    if (value === undefined) setInner(v);
    onChange?.(v);
  };
  const atMin = current !== null && current <= min;
  const showRemove = Boolean(onRemove) && atMin;
  const btn = size === 'sm' ? 12 : 16;

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); set((current ?? min) + step); }
    if (e.key === 'ArrowDown') { e.preventDefault(); set((current ?? min) - step); }
  };

  return (
    <div className={cx('syn-quantity', `syn-quantity--${size}`, current !== null && 'has-value', invalid && 'is-invalid', disabled && 'is-disabled', className)}>
      <label htmlFor={inputId} className={showLabel ? 'syn-quantity__label' : 'syn-visually-hidden'}>{label}</label>
      <div className="syn-quantity__box">
        <button
          type="button"
          className={cx('syn-quantity__step', showRemove && 'is-remove')}
          aria-label={showRemove ? removeLabel : decreaseLabel}
          disabled={disabled || (!showRemove && (current === null || atMin))}
          onClick={() => (showRemove ? onRemove?.() : set((current ?? min) - step))}
        >
          <Icon name={showRemove ? 'trash-bin' : 'minus'} size={btn} />
        </button>
        <span className="syn-quantity__value">
          {prefix && <span className="syn-quantity__affix">{prefix}</span>}
          <input
            ref={ref}
            id={inputId}
            className="syn-quantity__input"
            type="text"
            inputMode="numeric"
            role="spinbutton"
            aria-valuenow={current ?? undefined}
            aria-valuemin={Number.isFinite(min) ? min : undefined}
            aria-valuemax={Number.isFinite(max) ? max : undefined}
            aria-invalid={invalid || undefined}
            aria-describedby={hint || invalid ? messagesId : undefined}
            placeholder={placeholder}
            disabled={disabled}
            value={current === null ? '' : String(current)}
            size={Math.max(1, String(current ?? placeholder).length)}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d-]/g, '');
              set(raw === '' || raw === '-' ? null : Number(raw));
            }}
            onKeyDown={onKeyDown}
            {...rest}
          />
          {suffix && <span className="syn-quantity__affix">{suffix}</span>}
        </span>
        <button
          type="button"
          className="syn-quantity__step"
          aria-label={increaseLabel}
          disabled={disabled || (current !== null && current >= max)}
          onClick={() => set((current ?? min) + step)}
        >
          <Icon name="plus" size={btn} />
        </button>
      </div>
      <FieldMessages id={messagesId} hint={hint} error={error} dimmed={invalid && disabled} />
    </div>
  );
});
