import { useRef } from 'react';
import { Checkbox, Icon } from '@syn/design-system';
import { standardWorkWeek, weekdays, type WorkingHours } from './data';

/** Every half hour, offered in the time fields' list. */
const times = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);

/** "930", "9:3" or "21.48" to "09:30" / "21:48"; anything else stays as typed so the error shows. */
function normalize(v: string) {
  const m = v.trim().match(/^(\d{1,2})[:.]?(\d{0,2})$/);
  if (!m) return v.trim();
  const h = Number(m[1]);
  const min = Number(m[2].padEnd(2, '0') || 0);
  if (h > 23 || min > 59) return v.trim();
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/**
 * Figma "Timepicker input": a 36px field with the clock icon, 24-hour time. Syn has no time picker yet, so this is
 * a text field with a list of half hours (the clock opens it) and free typing; it could move to Syn.
 */
function TimeField({ label, value, onChange, disabled, invalid }: {
  label: string; value: string; onChange: (v: string) => void; disabled?: boolean; invalid?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className={`sam-time${disabled ? ' is-disabled' : ''}${invalid ? ' is-invalid' : ''}`}>
      <input
        ref={input} type="text" inputMode="numeric" list="sam-time-list" placeholder="00:00" maxLength={5}
        aria-label={label} value={value} disabled={disabled} aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)} onBlur={(e) => onChange(normalize(e.target.value))}
      />
      <button
        type="button" className="sam-time__open" aria-label={`Choose ${label.toLowerCase()} time`} disabled={disabled} tabIndex={-1}
        onClick={() => { input.current?.focus(); try { input.current?.showPicker(); } catch { /* not supported */ } }}
      >
        <Icon name="time" size={20} />
      </button>
    </div>
  );
}

/** Figma "Working hours" card (13594:29320): a day per row, checked days get their From and To times. */
export function WorkingHoursField({ value, onChange, error }: { value: WorkingHours; onChange: (v: WorkingHours) => void; error?: string }) {
  const set = (i: number, patch: Partial<WorkingHours[number]>) => onChange(value.map((d, k) => (k === i ? { ...d, ...patch } : d)));
  return (
    <fieldset className="sam-nc-card sam-hours" aria-describedby={error ? 'sam-hours-error' : undefined}>
      <div className="sam-hours__head">
        <legend className="sam-hours__legend">
          <span className="sam-nc-label">Working hours<span className="sam-nc-required" aria-hidden> *</span></span>
          <span className="sam-hours__hint">Allowed schedule</span>
        </legend>
        <button type="button" className="sam-pill-button" onClick={() => onChange(standardWorkWeek())}>Standard Work week</button>
      </div>
      <datalist id="sam-time-list">{times.map((t) => <option key={t} value={t} />)}</datalist>
      <div className="sam-hours__days">
        {weekdays.map((day, i) => {
          const d = value[i];
          const invalid = Boolean(error) && d.on && Boolean(workingHoursError([d]));
          return (
            <div key={day} className={`sam-hours__day${d.on ? ' is-on' : ''}`}>
              <Checkbox label={day} checked={d.on} onChange={(e) => set(i, { on: e.target.checked })} className="sam-hours__check" />
              <div className="sam-hours__range">
                <TimeField label={`${day} from`} value={d.from} disabled={!d.on} invalid={invalid} onChange={(from) => set(i, { from })} />
                <TimeField label={`${day} to`} value={d.to} disabled={!d.on} invalid={invalid} onChange={(to) => set(i, { to })} />
              </div>
            </div>
          );
        })}
      </div>
      {error && <p id="sam-hours-error" className="sam-nc-error" role="alert">{error}</p>}
    </fieldset>
  );
}

/** The schedule's error, if any: at least one day, each with a start before its end. */
export function workingHoursError(hours: WorkingHours): string | undefined {
  const on = hours.filter((d) => d.on);
  if (!on.length) return 'Choose at least one day.';
  if (on.some((d) => !d.from || !d.to)) return 'Enter a start and end time for every chosen day.';
  if (on.some((d) => !/^\d{2}:\d{2}$/.test(d.from) || !/^\d{2}:\d{2}$/.test(d.to))) return 'Enter times as HH:MM, for example 08:00.';
  if (on.some((d) => d.from >= d.to)) return 'The end time must be after the start time.';
  return undefined;
}
