import { useEffect, useState } from 'react';
import { alertHistory, initialAlerts, type Alert, type AlertEvent } from './data';

const KEY = 'sam-alerts-v2';

/** `?empty` in the URL (e.g. /?empty#/settings/notification-center) shows the empty lists. */
const emptyDemo = () => new URLSearchParams(window.location.search).has('empty');

function load(): Alert[] {
  if (emptyDemo()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Alert[];
  } catch { /* storage blocked: start from the mock data */ }
  return initialAlerts;
}

export interface AlertStore {
  alerts: Alert[];
  history: AlertEvent[];
  save: (alert: Alert) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
}

/**
 * The alert rules, kept in the browser until the API exists. Replace with API calls; the screens only use this
 * interface.
 */
export function useAlerts(): AlertStore {
  const [alerts, setAlerts] = useState<Alert[]>(load);
  useEffect(() => {
    if (emptyDemo()) return;
    try { localStorage.setItem(KEY, JSON.stringify(alerts)); } catch { /* ignore */ }
  }, [alerts]);
  return {
    alerts,
    history: emptyDemo() ? [] : alertHistory,
    save: (alert) => setAlerts((list) => (list.some((a) => a.id === alert.id)
      ? list.map((a) => (a.id === alert.id ? alert : a))
      : [alert, ...list])),
    remove: (id) => setAlerts((list) => list.filter((a) => a.id !== id)),
    toggle: (id) => setAlerts((list) => list.map((a) => (a.id === id ? { ...a, status: a.status === 'active' ? 'disabled' : 'active' } : a))),
  };
}
