import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { cx } from '../utils';
import './Tabs.css';

/** The 17 x 12 arrows from the Figma Tabs "icons" set. */
const TAB_ARROWS = {
  'arrow-left': 'M2 5.51L2.4 5.26L6.25 3L7.05 3.48L4.1 5.22L15 5.22V5.9L4.29 5.9L7.05 7.53L6.25 8.02L2 5.51Z',
  'arrow-right': 'M15 5.5L14.59 5.75L10.74 8.01L9.94 7.53L12.89 5.79L2 5.79L2 5.11L12.7 5.11L9.94 3.48L10.74 3L15 5.5Z',
} as const;

export type TabIcon = IconName | keyof typeof TAB_ARROWS;

function TabGlyph({ icon }: { icon: TabIcon }) {
  if (icon in TAB_ARROWS) {
    return (
      <svg width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden focusable="false" className="syn-tabs__icon">
        <path d={TAB_ARROWS[icon as keyof typeof TAB_ARROWS]} fill="currentColor" />
      </svg>
    );
  }
  return <Icon name={icon as IconName} size={16} className="syn-tabs__icon" />;
}

export interface TabItem {
  id: string;
  label: string;
  /** Figma "with 1 icon" / "with 2 icons": the 17px arrows, or any icon from the set. */
  iconStart?: TabIcon;
  iconEnd?: TabIcon;
  disabled?: boolean;
  /** Panel content. When any item has content, Tabs renders the panel for the selected tab. */
  content?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  /** lg = Figma "BIG" (48px, Medium 16); md = "Default size" (36px, Medium 14). */
  size?: 'md' | 'lg';
  /** Accessible name for the tab list. */
  label: string;
  /** Extra content after the tabs, e.g. a NewTab. */
  end?: ReactNode;
  className?: string;
}

/**
 * Figma "Tab": the selected tab fills Eerie Black, hover shows a Candy Apple underline, and a 16px
 * Silver Chalice separator sits at each tab's right edge. Arrow keys move between tabs.
 */
export function Tabs({ items, value, onChange, size = 'lg', label, end, className }: TabsProps) {
  const baseId = `syn-tabs-${useId()}`;
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const hasPanels = items.some((item) => item.content !== undefined);
  const selected = items.find((item) => item.id === value);

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const enabled = items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);
    const pos = enabled.indexOf(index);
    let next: number | undefined;
    if (e.key === 'ArrowRight') next = enabled[(pos + 1) % enabled.length];
    else if (e.key === 'ArrowLeft') next = enabled[(pos - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled.at(-1);
    if (next === undefined) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange(items[next].id);
  };

  return (
    <div className={cx('syn-tabs', `syn-tabs--${size}`, className)}>
      <div className="syn-tabs__bar">
        <div role="tablist" aria-label={label} className="syn-tabs__list">
          {items.map((item, index) => {
            const isSelected = item.id === value;
            return (
              <button
                key={item.id}
                ref={(el) => { refs.current[index] = el; }}
                id={`${baseId}-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={hasPanels ? `${baseId}-panel-${item.id}` : undefined}
                tabIndex={isSelected ? 0 : -1}
                disabled={item.disabled}
                className={cx('syn-tabs__tab', (item.iconStart || item.iconEnd) && 'has-icon')}
                onClick={() => onChange(item.id)}
                onKeyDown={(e) => onKeyDown(e, index)}
              >
                {item.iconStart && <TabGlyph icon={item.iconStart} />}
                <span className="syn-tabs__text">{item.label}</span>
                {item.iconEnd && <TabGlyph icon={item.iconEnd} />}
              </button>
            );
          })}
        </div>
        {end}
      </div>
      {hasPanels && selected && (
        <div role="tabpanel" id={`${baseId}-panel-${selected.id}`} aria-labelledby={`${baseId}-tab-${selected.id}`} tabIndex={0} className="syn-tabs__panel">
          {selected.content}
        </div>
      )}
    </div>
  );
}
