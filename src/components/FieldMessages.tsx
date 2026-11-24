import { cx } from '../utils';
import './FieldMessages.css';

/** The 12px stroked alert circle Figma uses in every error message ("Icon (5)"). */
export function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden focusable="false" className={cx('syn-error-icon', className)}>
      <path
        d="M5.85 10.6C8.5 10.6 10.64 8.46 10.64 5.81C10.64 3.16 8.5 1.02 5.85 1.02C3.2 1.02 1.06 3.16 1.06 5.81C1.06 8.46 3.2 10.6 5.85 10.6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5.85 3.82V5.94" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.85 7.73H5.85" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface FieldMessagesProps {
  id: string;
  hint?: string;
  error?: string | string[];
  /** Figma disabled error inputs show their message at 36% opacity. */
  dimmed?: boolean;
}

/**
 * Hint or error lines 2px under an input: 12px icon, 3px gap, Montserrat Regular 10 in Vermilion.
 * Errors replace the hint, one line each, as in Figma "multiple error".
 */
export function FieldMessages({ id, hint, error, dimmed }: FieldMessagesProps) {
  const errors = error === undefined ? [] : Array.isArray(error) ? error : [error];
  if (!errors.length && !hint) return null;
  return (
    <div id={id} className={cx('syn-field-messages', dimmed && 'is-dimmed')}>
      {errors.length
        ? errors.map((message) => (
            <p key={message} className="syn-field-messages__error">
              <ErrorIcon />
              {message}
            </p>
          ))
        : <p className="syn-field-messages__hint">{hint}</p>}
    </div>
  );
}

export type ChoiceErrorStyle = 'tooltip' | 'inline';

export interface ChoiceMessageProps {
  id: string;
  error?: string;
  /**
   * tooltip: Figma "Error 1", a dark bubble with a red outline and an arrow pointing at the control.
   * inline: Figma "Error 2", red icon and text.
   */
  variant?: ChoiceErrorStyle;
}

/** Error under a checkbox, radio or switch, 2px below the control, Montserrat Light 12. */
export function ChoiceMessage({ id, error, variant = 'inline' }: ChoiceMessageProps) {
  if (!error) return null;
  return (
    <p id={id} className={cx('syn-choice-message', `syn-choice-message--${variant}`)}>
      <ErrorIcon />
      <span>{error}</span>
    </p>
  );
}
