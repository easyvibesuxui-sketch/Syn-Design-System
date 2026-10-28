import { forwardRef, useId, useState, type CSSProperties, type InputHTMLAttributes } from 'react';
import { cx } from '../utils';
import './Slider.css';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange'> {
  label: string;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Formats the value bubble and aria-valuetext. Defaults to a percentage of the range. */
  format?: (value: number) => string;
  hideLabel?: boolean;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { label, value, defaultValue, onChange, min = 0, max = 100, step = 1, format, hideLabel, id, className, disabled, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `syn-slider-${autoId}`;
  const [inner, setInner] = useState(defaultValue ?? min);
  const current = value ?? inner;
  const pct = max === min ? 0 : ((current - min) / (max - min)) * 100;
  const text = format ? format(current) : `${Math.round(pct)}%`;

  return (
    <div className={cx('syn-slider', disabled && 'is-disabled', className)} style={{ '--pct': `${pct}%` } as CSSProperties}>
      <div className="syn-slider__header">
        <label htmlFor={inputId} className={cx('syn-slider__label', hideLabel && 'syn-visually-hidden')}>{label}</label>
        <output htmlFor={inputId} className="syn-slider__value">{text}</output>
      </div>
      <input
        ref={ref}
        id={inputId}
        type="range"
        className="syn-slider__input"
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        aria-valuetext={text}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (value === undefined) setInner(next);
          onChange?.(next);
        }}
        {...rest}
      />
    </div>
  );
});
