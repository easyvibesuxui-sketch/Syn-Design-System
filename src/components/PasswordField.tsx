import { forwardRef, useState } from 'react';
import { Icon } from './Icon';
import { TextField, type TextFieldProps } from './TextField';
import { cx } from '../utils';
import './PasswordField.css';

export interface PasswordFieldProps extends Omit<TextFieldProps, 'type' | 'endAdornment'> {
  /** Starts with the password shown. */
  defaultVisible?: boolean;
  showLabel?: string;
  hideLabelText?: string;
}

/**
 * Figma "Password large / Medium / Small": a TextField with an eye button after the clear button.
 * Hidden: Eerie Black eye; shown: Silver Chalice eye-closed. Label inside or outside, sizes lg / md / sm.
 */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
  { defaultVisible = false, showLabel = 'Show password', hideLabelText = 'Hide password', label = 'Password', placeholder, disabled, waiting, className, ...rest },
  ref,
) {
  const [visible, setVisible] = useState(defaultVisible);
  return (
    <TextField
      ref={ref}
      label={label}
      placeholder={placeholder}
      type={visible ? 'text' : 'password'}
      autoComplete="current-password"
      disabled={disabled}
      waiting={waiting}
      className={cx('syn-password', className)}
      endAdornment={
        <button
          type="button"
          className={cx('syn-password__eye', visible && 'is-visible')}
          aria-label={visible ? hideLabelText : showLabel}
          aria-pressed={visible}
          disabled={disabled || waiting}
          onClick={() => setVisible((v) => !v)}
        >
          <Icon name={visible || waiting ? 'eye-closed' : 'eye'} size={20} />
        </button>
      }
      {...rest}
    />
  );
});
