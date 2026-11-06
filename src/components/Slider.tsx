import { forwardRef, useEffect, useId, useState, type CSSProperties, type InputHTMLAttributes } from 'react';
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
  /** Formats the min and value labels under the track and aria-valuetext. Defaults to a percentage of the range. */
  format?: (value: number) => string;
  hideLabel?: boolean;
  /**
   * Shows a state without the pointer, for docs and screenshots: hover = Figma "Hover" (Eerie Black ring),
   * moving = Figma "Tap Slide" / "While moving" (Cultured thumb, Eerie Black ring, pause glyph).
   * The real hover and drag states work without it.
   */
  state?: 'hover' | 'moving';
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { label, value, defaultValue, onChange, min = 0, max = 100, step = 1, format, hideLabel, state, id, className, disabled, onPointerDown, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `syn-slider-${autoId}`;
  const [inner, setInner] = useState(defaultValue ?? min);
  const current = value ?? inner;
  const pct = max === min ? 0 : ((current - min) / (max - min)) * 100;
  const text = format ? format(current) : `${Math.round(pct)}%`;
  const minText = format ? format(min) : '0%';
  // While the thumb is dragged the slider shows Figma "While moving"; it ends wherever the pointer is released.
  const [moving, setMoving] = useState(false);
  useEffect(() => {
    if (!moving) return undefined;
    const stop = () => setMoving(false);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [moving]);

  return (
    <div
      className={cx('syn-slider', disabled && 'is-disabled', !disabled && (moving || state === 'moving') && 'is-moving', !disabled && state === 'hover' && 'is-hover', className)} style={{ '--pct': `${pct}%` } as CSSProperties}>
      <label htmlFor={inputId} className={cx('syn-slider__label', hideLabel && 'syn-visually-hidden')}>{label}</label>
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
        onPointerDown={(e) => {
          if (!disabled) setMoving(true);
          onPointerDown?.(e);
        }}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (value === undefined) setInner(next);
          onChange?.(next);
        }}
        {...rest}
      />
      {/* Figma "% s": Light 12 Silver Chalice under the track, the minimum on the left and the value on the right. */}
      <div className="syn-slider__scale" aria-hidden>
        <span>{minText}</span>
        <output htmlFor={inputId} className="syn-slider__value">{text}</output>
      </div>
    </div>
  );
});
