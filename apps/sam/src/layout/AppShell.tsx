import { useState, type CSSProperties, type ReactNode } from 'react';
import { Button, Tooltip } from '@syn/design-system';
import expandIcon from '../assets/icons/nav-expand.png';
import plannerIcon from '../assets/icons/nav-planner.png';
import rentalsIcon from '../assets/icons/nav-rentals.png';
import clientsIcon from '../assets/icons/nav-clients.png';
import warehousesIcon from '../assets/icons/nav-warehouses.png';
import equipmentIcon from '../assets/icons/nav-equipment.png';
import productsIcon from '../assets/icons/nav-products.png';
import invoicingIcon from '../assets/icons/nav-invoicing.png';
import reportsIcon from '../assets/icons/nav-reports.png';
import settingsIcon from '../assets/icons/nav-settings.png';
import bellIcon from '../assets/icons/bell.png';
import './AppShell.css';

/**
 * SAM's shell: Figma "Side bar" (64px) and "TopNavigation" (56px). Taken over from the Equipment Profile
 * app (same frames), so every SAM module sits in the same frame.
 */

/** An icon cropped from the Figma frame, drawn as a mask so it takes the text colour. */
export function MaskIcon({ src, size, className }: { src: string; size: number | [number, number]; className?: string }) {
  const [w, h] = Array.isArray(size) ? size : [size, size];
  const style = { '--mask': `url("${src}")`, width: w, height: h } as CSSProperties;
  return <span aria-hidden className={['sam-mask-icon', className].filter(Boolean).join(' ')} style={style} />;
}

interface NavItem { id: string; label: string; hint: string; icon: string; href?: string }

const mainNav: NavItem[] = [
  { id: 'planner', label: 'Planner', hint: 'Planner listing', icon: plannerIcon },
  { id: 'rentals', label: 'Rentals', hint: 'Rental listing', icon: rentalsIcon },
  { id: 'clients', label: 'Clients', hint: 'Client listing', icon: clientsIcon },
  { id: 'warehouses', label: 'Warehouses', hint: 'Warehouse listing', icon: warehousesIcon },
  { id: 'equipment', label: 'Equipments', hint: 'Equipment Database', icon: equipmentIcon },
  { id: 'products', label: 'Products', hint: 'Products and services listing', icon: productsIcon },
];
const moneyNav: NavItem[] = [
  { id: 'invoicing', label: 'Invoicing', hint: 'All invoices', icon: invoicingIcon },
  { id: 'reports', label: 'Reports', hint: 'All reports', icon: reportsIcon },
];
const settingsNav: NavItem = {
  id: 'settings', label: 'Settings', hint: 'Administration', icon: settingsIcon, href: '#/settings/notification-center',
};

function NavButton({ item, current }: { item: NavItem; current: boolean }) {
  return (
    <li>
      <Tooltip placement="right" content={<span className="sam-nav__tooltip"><strong>{item.label}</strong>{item.hint}</span>}>
        <a href={item.href ?? `#/${item.id}`} className="sam-nav__item" aria-label={item.label} aria-current={current ? 'page' : undefined}>
          <MaskIcon src={item.icon} size={26} />
        </a>
      </Tooltip>
    </li>
  );
}

function Sidebar({ current }: { current: string }) {
  return (
    <nav className="sam-nav" aria-label="Main">
      <button type="button" className="sam-nav__opener" aria-label="Open navigation" aria-expanded={false}>
        <MaskIcon src={expandIcon} size={26} />
      </button>
      <ul className="sam-nav__list">
        {mainNav.map((item) => <NavButton key={item.id} item={item} current={item.id === current} />)}
      </ul>
      <hr className="sam-nav__separator" />
      <ul className="sam-nav__list">
        {moneyNav.map((item) => <NavButton key={item.id} item={item} current={item.id === current} />)}
      </ul>
      <ul className="sam-nav__list sam-nav__list--end">
        <li>
          <button type="button" className="sam-nav__item sam-nav__lang" aria-label="Language: Deutsch. Click to change"><span className="syn-title-text">DE</span></button>
        </li>
        <NavButton item={settingsNav} current={current === 'settings'} />
      </ul>
    </nav>
  );
}

/** Figma "TopNavigation": module name, the SAM wordmark, Create, notifications and the profile button. */
function TopBar({ module }: { module: string }) {
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <header className="sam-topbar">
      <h1 className="sam-topbar__module">{module}</h1>
      <p className="sam-topbar__brand" aria-hidden>SAM</p>
      <div className="sam-topbar__actions">
        <Button variant="secondary" size="sm" iconStart="plus-in-circle" className="sam-topbar__create">Create</Button>
        <button type="button" className="sam-topbar__bell" aria-label="Notifications">
          <MaskIcon src={bellIcon} size={[16, 18]} />
        </button>
        <button
          type="button"
          className="sam-topbar__profile"
          aria-label="Profile: Max Mustermann"
          aria-expanded={profileOpen}
          onClick={() => setProfileOpen(!profileOpen)}
        >
          <span className="syn-title-text">M.M.</span>
        </button>
      </div>
    </header>
  );
}

export function AppShell({ module, current, children }: { module: string; current: string; children: ReactNode }) {
  return (
    <div className="sam-shell syn-root">
      <Sidebar current={current} />
      <div className="sam-shell__body">
        <TopBar module={module} />
        <main className="sam-shell__main">{children}</main>
      </div>
    </div>
  );
}
