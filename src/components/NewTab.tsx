import { useEffect, useId, useRef, useState } from 'react';
import { ErrorIcon } from './FieldMessages';
import { cx } from '../utils';
import './NewTab.css';

export interface NewTabProps {
  /** A created tab's name. Without one the component shows "Add new" and lets the user type a name. */
  name?: string;
  /** Figma "Selected": the created tab is the current one. */
  selected?: boolean;
  /** Figma "Error": red underline and a message under the name field. */
  error?: string;
  addLabel?: string;
  placeholder?: string;
  /** Called with the typed name on Enter. */
  onCreate?: (name: string) => void;
  onSelect?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
  cancelLabel?: string;
  className?: string;
}

/** Glyphs exported from the Figma "New Tab" set. */
function PlusCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden focusable="false">
      <path
        d="M8 1.14C9.36 1.14 10.68 1.55 11.81 2.3C12.94 3.05 13.82 4.12 14.34 5.38C14.85 6.63 14.99 8.01 14.73 9.34C14.46 10.67 13.81 11.89 12.85 12.85C11.89 13.81 10.67 14.46 9.34 14.73C8.01 14.99 6.63 14.85 5.38 14.34C4.12 13.82 3.05 12.94 2.3 11.81C1.55 10.68 1.14 9.36 1.14 8C1.14 6.18 1.87 4.44 3.15 3.15C4.44 1.87 6.18 1.14 8 1.14ZM8 0C6.42 0 4.87 0.47 3.56 1.35C2.24 2.23 1.21 3.48 0.61 4.94C0 6.4 -0.15 8.01 0.15 9.56C0.46 11.11 1.22 12.54 2.34 13.66C3.46 14.78 4.89 15.54 6.44 15.85C7.99 16.15 9.6 16 11.06 15.39C12.52 14.79 13.77 13.76 14.65 12.44C15.53 11.13 16 9.58 16 8C16 5.88 15.16 3.84 13.66 2.34C12.16 0.84 10.12 0 8 0Z"
        fill="currentColor"
      />
      <path d="M2.69 8.35V7.65L13.3 7.65L13.3 8.35L2.69 8.35Z" fill="currentColor" />
      <path d="M7.65 13.31L7.65 2.7H8.35L8.35 13.31H7.65Z" fill="currentColor" />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <path d="M20 4.99L12.99 12L20 19.01L19.01 20L12 12.99L4.99 20L4 19.01L11.01 12L4 4.99L4.99 4L12 11.01L19.01 4L20 4.99Z" fill="currentColor" />
    </svg>
  );
}

function TrashGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <path d="M9.79 9.82H10.9V16.36H9.79V9.82Z" fill="currentColor" />
      <path d="M13.1 9.82H14.21V16.36H13.1V9.82Z" fill="currentColor" />
      <path
        d="M5.38 6.55V7.65H6.48V18.54C6.48 18.82 6.6 19.1 6.8 19.31C7.01 19.51 7.29 19.62 7.58 19.62H16.42C16.71 19.62 16.99 19.51 17.2 19.3C17.4 19.1 17.52 18.82 17.52 18.53V7.65H18.62V6.55H5.38ZM7.58 18.54V7.65H16.42V18.54H7.58Z"
        fill="currentColor"
      />
      <path d="M9.79 4.38H14.21V5.47H9.79V4.38Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Figma "New Tab" (4427:22169): Default "Add new", Hover, Tap (typing a name), Filled, Selected and Error.
 * Place it after Tabs, for example in the Tabs `end` slot.
 */
export function NewTab({
  name, selected, error, addLabel = 'Add new', placeholder = 'Give name', onCreate, onSelect, onRemove,
  removeLabel = 'Remove tab', cancelLabel = 'Cancel', className,
}: NewTabProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const messageId = `syn-new-tab-${useId()}`;
  const showField = !name && (editing || Boolean(error));

  useEffect(() => {
    if (editing) input.current?.focus();
  }, [editing]);

  const cancel = () => {
    setEditing(false);
    setDraft('');
  };

  if (name) {
    return (
      <div className={cx('syn-new-tab', 'is-filled', selected && 'is-selected', className)}>
        <button type="button" className="syn-new-tab__name" aria-pressed={selected} onClick={onSelect}>
          {name}
        </button>
        {onRemove && (
          <button type="button" className="syn-new-tab__helper" aria-label={removeLabel} onClick={onRemove}>
            <TrashGlyph />
          </button>
        )}
      </div>
    );
  }

  if (!showField) {
    return (
      <div className={cx('syn-new-tab', className)}>
        <button type="button" className="syn-new-tab__add" onClick={() => setEditing(true)}>
          <PlusCircle />
          {addLabel}
        </button>
      </div>
    );
  }

  return (
    <div className={cx('syn-new-tab', 'is-editing', error && 'is-invalid', className)}>
      <input
        ref={input}
        className="syn-new-tab__input"
        value={draft}
        placeholder={placeholder}
        aria-label={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? messageId : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && draft.trim()) {
            onCreate?.(draft.trim());
            if (!error) cancel();
          }
          if (e.key === 'Escape') cancel();
        }}
      />
      <button type="button" className="syn-new-tab__helper" aria-label={cancelLabel} onClick={cancel}>
        <CloseGlyph />
      </button>
      {error && (
        <p id={messageId} className="syn-new-tab__error">
          <ErrorIcon />
          {error}
        </p>
      )}
    </div>
  );
}
