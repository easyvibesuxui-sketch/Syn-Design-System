import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { cx } from '../utils';
import './Tabs.css';

export interface TabItem {
  id: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
  /** Panel content. When any item has content, Tabs renders the panel for the selected tab. */
  content?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  /** lg 48px with 16px labels, md 40px with 14px labels. */
  size?: 'md' | 'lg';
  /** Accessible name for the tab list. */
  label: string;
  className?: string;
}

/** Segmented tab switcher: the selected tab fills Eerie Black. Arrow keys move between tabs. */
export function Tabs({ items, value, onChange, size = 'lg', label, className }: TabsProps) {
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
              className="syn-tabs__tab"
              onClick={() => onChange(item.id)}
              onKeyDown={(e) => onKeyDown(e, index)}
            >
              {item.icon && <Icon name={item.icon} size={16} />}
              {item.label}
            </button>
          );
        })}
      </div>
      {hasPanels && selected && (
        <div role="tabpanel" id={`${baseId}-panel-${selected.id}`} aria-labelledby={`${baseId}-tab-${selected.id}`} tabIndex={0} className="syn-tabs__panel">
          {selected.content}
        </div>
      )}
    </div>
  );
}
