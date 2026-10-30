import { useEffect, useRef, useState } from 'react';
import { Button, Icon } from '../../src';
import { CURRENT_USER } from './data';
import { useShop } from './store';

/*
 * Top-right corner of the platform bar: Create, notifications and the account menu. Bell and log-out come from
 * Tabler Icons (MIT, https://tabler.io/icons); Syn's set has neither.
 */
const tabler = {
  bell: ['M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6', 'M9 17v1a3 3 0 0 0 6 0v-1'],
  logout: ['M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2', 'M9 12h12l-3 -3', 'M18 15l3 -3'],
};

function TablerIcon({ name, size = 20 }: { name: keyof typeof tabler; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {tabler[name].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

/** Flags are pictures of the country, so they keep their own colours rather than theme tokens. */
function Flag({ country }: { country: 'gb' | 'de' }) {
  return country === 'gb' ? (
    <svg className="shop-flag" viewBox="0 0 60 40" aria-hidden>
      <rect width="60" height="40" fill="#012169" />
      <path d="M0 0L60 40M60 0L0 40" stroke="#fff" strokeWidth="8" />
      <path d="M0 0L60 40M60 0L0 40" stroke="#C8102E" strokeWidth="3" />
      <path d="M30 0V40M0 20H60" stroke="#fff" strokeWidth="12" />
      <path d="M30 0V40M0 20H60" stroke="#C8102E" strokeWidth="7" />
    </svg>
  ) : (
    <svg className="shop-flag" viewBox="0 0 5 3" aria-hidden>
      <rect width="5" height="1" fill="#000" />
      <rect y="1" width="5" height="1" fill="#DD0000" />
      <rect y="2" width="5" height="1" fill="#FFCE00" />
    </svg>
  );
}

const initials = CURRENT_USER.name.split(' ').map((w) => `${w[0]}.`).join('');

export function TopbarActions() {
  const { notify } = useShop();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const outside = (label: string) => notify(label, `${label} is outside this Shop prototype.`, 'info');

  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLElement>('.shop-account__menu button')?.focus();
    const onPointer = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onPointer); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const choose = (action: () => void) => () => { setOpen(false); action(); };

  return (
    <div className="shop-topbar__end">
      <Button size="sm" variant="secondary" iconStart="plus-in-circle" className="shop-create" aria-label="Create" onClick={() => outside('Create')}>
        <span className="shop-create__label">Create</span>
      </Button>
      <button type="button" className="shop-topbar__icon" aria-label="Notifications" onClick={() => notify('No new notifications', 'You’re all caught up.', 'info')}>
        <TablerIcon name="bell" size={24} />
      </button>
      <div className="shop-account" ref={root}>
        <button ref={trigger} type="button" className="shop-account__trigger" aria-label={`Account: ${CURRENT_USER.name}`} aria-haspopup="true" aria-expanded={open} onClick={() => setOpen(!open)}>
          {initials}
        </button>
        {open && (
          <div className="shop-account__menu" role="dialog" aria-label="Account">
            <div className="shop-account__card">
              <div className="shop-account__who">
                <span className="shop-account__photo" aria-hidden>{initials}</span>
                <strong>{CURRENT_USER.name}</strong>
              </div>
              <span className="shop-account__org">{CURRENT_USER.company}</span>
            </div>
            <button type="button" className="shop-account__row" onClick={choose(() => outside('Profile'))}>
              <span className="shop-account__tile"><Icon name="settings" size={20} /></span>
              <span>Profile</span>
              <span className="shop-account__more"><Icon name="next" size={16} /></span>
            </button>
            <div className="shop-account__langs" role="group" aria-label="Language">
              <button type="button" className="shop-account__lang is-on" aria-pressed="true"><Flag country="gb" />English</button>
              <button type="button" className="shop-account__lang" aria-pressed="false" onClick={choose(() => notify('Deutsch is coming soon', 'This Shop prototype is in English only for now.', 'info'))}>
                <Flag country="de" />Deutsch
              </button>
            </div>
            <button type="button" className="shop-account__row" onClick={choose(() => outside('Log out'))}>
              <span className="shop-account__tile"><TablerIcon name="logout" /></span>
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
