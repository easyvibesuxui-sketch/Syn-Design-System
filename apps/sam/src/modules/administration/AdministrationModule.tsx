import { Icon, type IconName } from '@syn/design-system';
import { NotificationCenter } from './notification-center/NotificationCenter';
import './Administration.css';

/**
 * Administration ("Settings" in the top bar): Figma "Secondary Navigation" on the left, the chosen section on the
 * right. Only the Notification Center is designed so far.
 */
export type AdminSection = 'user-management' | 'resources' | 'workflows' | 'notification-center';

interface SectionItem { id: AdminSection; label: string; icon: IconName }

// Figma spells the second item "Recourses"; kept until the copy is confirmed.
const topSections: SectionItem[] = [
  { id: 'user-management', label: 'User Management', icon: 'person' },
  { id: 'resources', label: 'Recourses', icon: 'inventory' },
  { id: 'workflows', label: 'Workflows', icon: 'list' },
];
const bottomSections: SectionItem[] = [{ id: 'notification-center', label: 'Notification Center', icon: 'settings' }];

function SectionLink({ item, current }: { item: SectionItem; current: boolean }) {
  return (
    <li>
      <a href={`#/settings/${item.id}`} className="sam-admin-nav__item" aria-current={current ? 'page' : undefined}>
        <Icon name={item.icon} size={24} />
        <span>{item.label}</span>
      </a>
    </li>
  );
}

export function AdministrationModule({ section }: { section: AdminSection }) {
  const label = [...topSections, ...bottomSections].find((s) => s.id === section)?.label ?? '';
  return (
    <div className="sam-admin">
      <nav className="sam-admin-nav" aria-label="Administration">
        <ul>{topSections.map((s) => <SectionLink key={s.id} item={s} current={s.id === section} />)}</ul>
        <ul>{bottomSections.map((s) => <SectionLink key={s.id} item={s} current={s.id === section} />)}</ul>
      </nav>
      <section className="sam-admin__content" aria-label={label}>
        {section === 'notification-center'
          ? <NotificationCenter />
          : <p className="sam-admin__placeholder">{label} is not designed yet.</p>}
      </section>
    </div>
  );
}

export const adminSections: AdminSection[] = [...topSections, ...bottomSections].map((s) => s.id);
