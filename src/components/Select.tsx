import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Icon, type IconName } from './Icon';
import { FieldMessages } from './FieldMessages';
import type { FieldSize } from './TextField';
import { cx } from '../utils';
import './TextField.css';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Text shown while nothing is selected. Defaults to the label. */
  placeholder?: string;
  size?: FieldSize;
  iconStart?: IconName;
  hint?: string;
  error?: string | string[];
  disabled?: boolean;
  id?: string;
  className?: string;
}

/** Single-select dropdown. Follows the WAI-ARIA select-only combobox pattern. */
export function Select({ label, options, value, defaultValue, onChange, placeholder, size = 'lg', iconStart, hint, error, disabled, id, className }: SelectProps) {
  const autoId = useId();
  const baseId = id ?? `syn-select-${autoId}`;
  const listId = `${baseId}-list`;
  const messagesId = `${baseId}-messages`;
  const [inner, setInner] = useState(defaultValue);
  const selected = value ?? inner;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const root = useRef<HTMLDivElement>(null);
  const invalid = error !== undefined && error.length > 0;
  const selectedOption = options.find((o) => o.value === selected);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
  const move = (dir: 1 | -1) => {
    const pos = enabled.indexOf(active);
    const next = enabled[Math.min(enabled.length - 1, Math.max(0, pos + dir))];
    setActive(next ?? -1);
  };
  const choose = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    if (value === undefined) setInner(option.value);
    onChange?.(option.value);
    setOpen(false);
  };
  const openList = () => {
    setOpen(true);
    const current = options.findIndex((o) => o.value === selected);
    setActive(current >= 0 ? current : enabled[0] ?? -1);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(enabled[0] ?? -1); }
    else if (e.key === 'End') { e.preventDefault(); setActive(enabled.at(-1) ?? -1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active); }
    else if (e.key === 'Escape' || e.key === 'Tab') setOpen(false);
  };

  return (
    <div ref={root} className={cx('syn-field', 'syn-select', `syn-field--${size}`, invalid && 'is-invalid', disabled && 'is-disabled', open && 'is-open', className)}>
      <span id={`${baseId}-label`} className="syn-visually-hidden">{label}</span>
      <button
        id={baseId}
        type="button"
        role="combobox"
        className="syn-field__box syn-select__trigger"
        aria-labelledby={`${baseId}-label ${baseId}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${baseId}-opt-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={hint || invalid ? messagesId : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        {iconStart && <Icon name={iconStart} size={20} className="syn-field__icon" />}
        <span className={cx('syn-select__value', !selectedOption && 'is-placeholder')}>
          {selectedOption?.label ?? placeholder ?? label}
        </span>
        <span className="syn-select__chevron" aria-hidden>
          <Icon name="chevron-down" size={16} />
        </span>
      </button>
      {open && (
        <ul id={listId} role="listbox" aria-labelledby={`${baseId}-label`} className="syn-select__list">
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${baseId}-opt-${index}`}
              role="option"
              aria-selected={option.value === selected}
              aria-disabled={option.disabled || undefined}
              className={cx('syn-select__option', index === active && 'is-active')}
              onMouseEnter={() => !option.disabled && setActive(index)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(index)}
            >
              <span>{option.label}</span>
              {option.value === selected && <Icon name="check" size={16} />}
            </li>
          ))}
        </ul>
      )}
      <FieldMessages id={messagesId} hint={hint} error={error} />
    </div>
  );
}
