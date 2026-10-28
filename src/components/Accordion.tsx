import { useId, useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import { cx } from '../utils';
import './Accordion.css';

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  /** Small value box shown before the chevron, e.g. a count or total. */
  meta?: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Allow more than one section open at a time. */
  multiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

export function Accordion({ items, multiple = false, defaultOpen = [], className }: AccordionProps) {
  const baseId = `syn-accordion-${useId()}`;
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const toggle = (id: string) =>
    setOpen((current) => (current.includes(id) ? current.filter((x) => x !== id) : multiple ? [...current, id] : [id]));

  return (
    <div className={cx('syn-accordion', className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        return (
          <div key={item.id} className={cx('syn-accordion__item', isOpen && 'is-open', item.disabled && 'is-disabled')}>
            <h3 className="syn-accordion__heading">
              <button
                type="button"
                id={`${baseId}-h-${item.id}`}
                className="syn-accordion__trigger"
                aria-expanded={isOpen}
                aria-controls={`${baseId}-p-${item.id}`}
                disabled={item.disabled}
                onClick={() => toggle(item.id)}
              >
                <span className="syn-accordion__title">{item.title}</span>
                {item.meta !== undefined && <span className="syn-accordion__meta">{item.meta}</span>}
                <span className="syn-accordion__chevron" aria-hidden>
                  <Icon name="chevron-down" size={16} />
                </span>
              </button>
            </h3>
            <div id={`${baseId}-p-${item.id}`} role="region" aria-labelledby={`${baseId}-h-${item.id}`} className="syn-accordion__panel" hidden={!isOpen}>
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
