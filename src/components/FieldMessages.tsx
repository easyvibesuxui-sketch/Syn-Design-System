import { Icon } from './Icon';
import './FieldMessages.css';

export interface FieldMessagesProps {
  id: string;
  hint?: string;
  error?: string | string[];
}

/** Hint or error lines under a control. Errors replace the hint, one line each, as in Figma "multiple error". */
export function FieldMessages({ id, hint, error }: FieldMessagesProps) {
  const errors = error === undefined ? [] : Array.isArray(error) ? error : [error];
  if (!errors.length && !hint) return null;
  return (
    <div id={id} className="syn-field-messages">
      {errors.length
        ? errors.map((message) => (
            <p key={message} className="syn-field-messages__error">
              <Icon name="info-circle" size={12} />
              {message}
            </p>
          ))
        : <p className="syn-field-messages__hint">{hint}</p>}
    </div>
  );
}
