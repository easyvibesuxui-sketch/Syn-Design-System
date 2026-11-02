import { useSyncExternalStore } from 'react';
import { de } from './i18n-de';

/*
 * Shop language: English source texts, German from a dictionary keyed by the English text. `t()` reads the current
 * language at render time, so the language switch re-renders the app and every text follows; untranslated texts fall
 * back to English. Texts with values use numbered slots: t('{0} added to your cart', [name]).
 */
export type Lang = 'en' | 'de';

const KEY = 'syn-shop-v3:lang';
let current: Lang = (() => {
  try { return localStorage.getItem(KEY) === 'de' ? 'de' : 'en'; } catch { return 'en'; }
})();
const listeners = new Set<() => void>();
if (typeof document !== 'undefined') document.documentElement.lang = current;

export const getLang = () => current;

export function setLang(lang: Lang) {
  if (lang === current) return;
  current = lang;
  try { localStorage.setItem(KEY, lang); } catch { /* storage blocked: the choice lasts for this visit */ }
  document.documentElement.lang = lang;
  listeners.forEach((notify) => notify());
}

/** Subscribes a component (the app root) to language changes. */
export function useLang(): Lang {
  return useSyncExternalStore((onChange) => { listeners.add(onChange); return () => { listeners.delete(onChange); }; }, getLang);
}

export function t(text: string, args?: ReadonlyArray<string | number>): string {
  const base = current === 'de' ? de[text] ?? text : text;
  return args ? base.replace(/\{(\d+)\}/g, (_: string, i: string) => String(args[Number(i)] ?? '')) : base;
}
