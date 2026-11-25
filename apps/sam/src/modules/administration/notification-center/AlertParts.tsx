import { Icon } from '@syn/design-system';
import { alertTypes, splitDateTime, type AlertType } from './data';

/** Figma type cell: the round alert icon (24px) and its name. */
export function AlertTypeLabel({ type, muted }: { type: AlertType; muted?: boolean }) {
  const t = alertTypes[type];
  return (
    <span className={`sam-nc-type sam-nc-type--${type}${muted ? ' is-muted' : ''}`}>
      <img src={t.icon} alt="" width={24} height={24} />
      {t.label}
    </span>
  );
}

/** "01.01.2028 • 14:14": the time Silver Chalice after a 4px dot. */
export function DateTime({ iso }: { iso: string }) {
  const { date, time } = splitDateTime(iso);
  return (
    <time dateTime={iso} className="sam-nc-datetime">
      {date}
      <span aria-hidden className="sam-nc-datetime__dot" />
      <span className="sam-nc-datetime__time">{time}</span>
    </time>
  );
}

/** Figma "Text indicator names": the first value in a Cultured box and "+N" in a round counter. */
export function FirstAndMore({ items, label }: { items: string[]; label: string }) {
  if (!items.length) return <span className="sam-nc-muted">—</span>;
  const rest = items.length - 1;
  return (
    <span className="sam-nc-more" title={items.join(', ')}>
      <span className="sam-nc-more__first">{items[0]}</span>
      {rest > 0 && <span className="sam-nc-more__count" aria-label={`and ${rest} more ${label}`}>+{rest}</span>}
    </span>
  );
}

/** Figma status cell: a ringed dot (Mantis when active, Gray X when disabled) and the status. */
export function AlertStatusLabel({ active }: { active: boolean }) {
  return (
    <span className={`sam-nc-status${active ? ' is-active' : ''}`}>
      <span aria-hidden className="sam-nc-status__dot" />
      {active ? 'Active' : 'Disabled'}
    </span>
  );
}

/** Figma "Icon Button Small" with the Candy Apple plus-in-circle: the Add Alert action. */
export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="sam-nc-add" aria-label={label} title={label} onClick={onClick}>
      <Icon name="plus-in-circle" size={24} />
    </button>
  );
}
