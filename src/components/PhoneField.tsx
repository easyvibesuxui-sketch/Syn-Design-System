import { forwardRef, useId, useState } from 'react';
import { Select } from './Select';
import { TextField, type TextFieldProps } from './TextField';
import { cx } from '../utils';
import './PhoneField.css';

export interface PhoneCountry {
  /** ISO code, used as the value, e.g. "GE". */
  code: string;
  name: string;
  /** Dialling code with the plus, e.g. "+995". */
  dial: string;
}

export const defaultPhoneCountries: PhoneCountry[] = [
  { code: 'GE', name: 'Georgia', dial: '+995' },
  { code: 'DE', name: 'Germany', dial: '+49' },
  { code: 'AT', name: 'Austria', dial: '+43' },
  { code: 'CH', name: 'Switzerland', dial: '+41' },
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'US', name: 'United States', dial: '+1' },
  { code: 'TR', name: 'Türkiye', dial: '+90' },
  { code: 'UA', name: 'Ukraine', dial: '+380' },
];

export interface PhoneFieldProps extends Omit<TextFieldProps, 'label' | 'size' | 'prefix' | 'iconEnd' | 'type' | 'labelPosition'> {
  /** Group label. Inside: the two fields carry "Country/Region" and "Phone Number"; outside: this label sits above. */
  label?: string;
  labelPosition?: 'inside' | 'outside';
  countryLabel?: string;
  numberLabel?: string;
  countries?: PhoneCountry[];
  country?: string;
  defaultCountry?: string;
  onCountryChange?: (code: string) => void;
  /** md 48px (default, Figma "Phone input def size"), sm 36px ("Phone input Small"), lg 56px. */
  size?: 'lg' | 'md' | 'sm';
}

/**
 * Figma "Phone input": a Country/Region dropdown joined to a Phone Number field with the dialling code
 * before the number and the phone icon at the end. The two boxes share a seam; the outer corners are 8px.
 */
export const PhoneField = forwardRef<HTMLInputElement, PhoneFieldProps>(function PhoneField(
  {
    label = 'Phone', labelPosition = 'inside', countryLabel = 'Country/Region', numberLabel = 'Phone Number',
    countries = defaultPhoneCountries, country, defaultCountry, onCountryChange, size = 'md', disabled, error, hint, className, id, ...rest
  },
  ref,
) {
  const autoId = useId();
  const groupId = id ?? `syn-phone-${autoId}`;
  const [inner, setInner] = useState(defaultCountry);
  const current = country ?? inner;
  const selected = countries.find((c) => c.code === current);
  const outside = labelPosition === 'outside';
  return (
    <div className={cx('syn-phone', `syn-phone--${size}`, outside && 'syn-phone--outside', disabled && 'is-disabled', className)} role="group" aria-labelledby={`${groupId}-label`}>
      <span id={`${groupId}-label`} className={outside ? 'syn-phone__label' : 'syn-visually-hidden'}>{label}</span>
      <Select
        label={countryLabel}
        size={size}
        hideLabel={outside}
        placeholder={countryLabel}
        disabled={disabled}
        value={current}
        onChange={(code) => {
          if (country === undefined) setInner(code);
          onCountryChange?.(code);
        }}
        options={countries.map((c) => ({ value: c.code, label: `(${c.dial}) ${c.name}` }))}
        className="syn-phone__country"
      />
      <TextField
        ref={ref}
        id={`${groupId}-number`}
        label={numberLabel}
        size={size}
        hideLabel={outside}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        prefix={selected?.dial}
        iconEnd="phone"
        disabled={disabled}
        error={error}
        hint={hint}
        className="syn-phone__number"
        {...rest}
      />
    </div>
  );
});
