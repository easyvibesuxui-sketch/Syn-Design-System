import { useId, useState, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { cx } from '../utils';
import './Section.css';

export interface SectionProps {
  title: ReactNode;
  /** Shows the chevron and lets the body fold away. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  /** Controlled open state, with onOpenChange. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Header content before the chevron, e.g. a more button. */
  actions?: ReactNode;
  /** md = 36px header, Smoke body (top-level sections); lg = 56px header, white body (nested, e.g. "Protocol"). */
  size?: 'md' | 'lg';
  children?: ReactNode;
  className?: string;
}

/**
 * Large widget from the record reference ("Details", "Custom fields", "Checklist"): a 36px white
 * header over a Smoke body, both with a Cultured border and 12px outer corners.
 */
export function Section({
  title, collapsible = false, defaultOpen = true, open, onOpenChange, actions, size = 'md', children, className,
}: SectionProps) {
  const baseId = `syn-section-${useId()}`;
  const [inner, setInner] = useState(defaultOpen);
  const isOpen = !collapsible || (open ?? inner);
  const toggle = () => {
    if (open === undefined) setInner(!isOpen);
    onOpenChange?.(!isOpen);
  };

  return (
    <section className={cx('syn-section', `syn-section--${size}`, isOpen && 'is-open', className)} aria-labelledby={`${baseId}-title`}>
      <header className="syn-section__header">
        <h3 id={`${baseId}-title`} className="syn-section__title">{title}</h3>
        {actions && <div className="syn-section__actions">{actions}</div>}
        {collapsible && (
          <button
            type="button"
            className="syn-section__toggle"
            aria-expanded={isOpen}
            aria-controls={`${baseId}-body`}
            aria-labelledby={`${baseId}-title`}
            onClick={toggle}
          >
            <Icon name="chevron-down" size={16} />
          </button>
        )}
      </header>
      <div id={`${baseId}-body`} className="syn-section__body" hidden={!isOpen}>
        {children}
      </div>
    </section>
  );
}

export interface CardProps {
  title?: ReactNode;
  /** Header content on the right, e.g. a file link or a more button. */
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** White inner widget ("Main Loss", "Attachments"): 12px corners and a soft drop shadow. */
export function Card({ title, actions, children, className }: CardProps) {
  return (
    <div className={cx('syn-card', className)}>
      {(title || actions) && (
        <div className="syn-card__header">
          {title && <h4 className="syn-card__title">{title}</h4>}
          {actions && <div className="syn-card__actions">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export interface PropertyProps {
  label: ReactNode;
  /** 12px icon before the label, e.g. "calendar" for "Due date". */
  icon?: IconName;
  children?: ReactNode;
  /** tile = Smoke box with 8px corners ("What is Damaged"); plain = label over value ("Condition"). */
  variant?: 'plain' | 'tile';
  className?: string;
}

/** A label over its value. */
export function Property({ label, icon, children, variant = 'plain', className }: PropertyProps) {
  return (
    <div className={cx('syn-property', `syn-property--${variant}`, className)}>
      <span className="syn-property__label">
        {icon && <Icon name={icon} size={12} />}
        {label}
      </span>
      <div className="syn-property__value">{children}</div>
    </div>
  );
}
