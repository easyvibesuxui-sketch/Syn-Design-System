import { Avatar, Button, Icon, Notification, Tooltip, type IconName } from '../../src';
import { cx } from '../../src/utils';
import { CURRENT_USER } from './data';
import { CartDrawer } from './CartDrawer';
import { LineIcon } from './parts';
import { AdminPage } from './pages/AdminPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProductPage } from './pages/ProductPage';
import { ShopPage } from './pages/ShopPage';
import { routeHref, useShop, type Route } from './store';

const crumbs: Record<Route['name'], string> = {
  shop: 'Shop', product: 'Shop / Product', checkout: 'Shop / Submit order', confirmation: 'Shop / Order submitted',
  orders: 'Shop / My orders', admin: 'Shop Admin',
};

/**
 * SAM's dark icon rail, as in the prototype: Collapse, Dashboard, Equipment and Bookings belong to the rest of the
 * platform and only say so; Shop and Shop Admin navigate. Every item has a Syn tooltip with its name.
 */
function Rail({ route }: { route: Route }) {
  const { notify } = useShop();
  const outside = (label: string) => () => notify(label, `${label} is outside this Shop prototype.`, 'info');
  const item = (icon: IconName | 'bag', label: string, opts: { href?: string; active?: boolean } = {}) => (
    <Tooltip key={label} content={label} placement="right">
      {opts.href ? (
        <a href={opts.href} className={cx('shop-rail__item', opts.active && 'is-active')} aria-label={label} aria-current={opts.active ? 'page' : undefined}>
          {icon === 'bag' ? <LineIcon name="bag" /> : <Icon name={icon} size={20} />}
        </a>
      ) : (
        <button type="button" className="shop-rail__item" aria-label={label} onClick={outside(label)}>
          {icon === 'bag' ? <LineIcon name="bag" /> : <Icon name={icon} size={20} />}
        </button>
      )}
    </Tooltip>
  );
  return (
    <nav className="shop-rail" aria-label="Platform">
      <span className="shop-rail__collapse">{item('navbar', 'Collapse navigation')}</span>
      <span className="shop-rail__divider" />
      {item('kanban', 'Dashboard')}
      {item('truck', 'Equipment')}
      {item('calendar', 'Bookings')}
      {item('bag', 'Shop', { href: routeHref({ name: 'shop' }), active: route.name !== 'admin' })}
      <span className="shop-rail__spacer" />
      {item('settings', 'Shop Admin', { href: routeHref({ name: 'admin', tab: 'overview' }), active: route.name === 'admin' })}
    </nav>
  );
}

function Page({ route }: { route: Route }) {
  switch (route.name) {
    case 'product': return <ProductPage key={route.id} id={route.id} />;
    case 'checkout': return <CheckoutPage />;
    case 'confirmation': return <ConfirmationPage id={route.id} />;
    case 'orders': return <OrdersPage key={route.id ?? 'list'} id={route.id} />;
    case 'admin': return <AdminPage tab={route.tab} />;
    default: return <ShopPage />;
  }
}

export function App() {
  const { route, toasts, dismiss } = useShop();
  return (
    <div className="syn-root shop-app">
      <Rail route={route} />
      <div className="shop-workspace">
        <header className="shop-topbar">
          <span className="shop-topbar__crumb">{crumbs[route.name]}</span>
          <span className="shop-topbar__brand" aria-label="SAM">SAM</span>
          <span className="shop-topbar__user">
            <Avatar size={32} />
            <span><strong>{CURRENT_USER.name}</strong><span>{CURRENT_USER.company}</span></span>
          </span>
        </header>
        <main className="shop-content">
          <Page route={route} />
        </main>
      </div>
      <CartDrawer />
      <div className="shop-toasts">
        {toasts.map((t) => (
          <Notification key={t.id} variant="inline" tone={t.tone} title={t.title} onClose={() => dismiss(t.id)}>
            {t.message}
            {t.action && <Button size="xs" variant="secondary" className="shop-toast-action" onClick={() => { t.action!.run(); dismiss(t.id); }}>{t.action.label}</Button>}
          </Notification>
        ))}
      </div>
    </div>
  );
}
