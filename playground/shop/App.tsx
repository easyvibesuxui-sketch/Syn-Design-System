import { Avatar, Icon, IconButton, Notification, type IconName } from '../../src';
import { cx } from '../../src/utils';
import { CURRENT_USER } from './data';
import { CartDrawer } from './CartDrawer';
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

/** SAM's dark icon rail. The first three items stand in for the rest of the platform. */
function Rail({ route }: { route: Route }) {
  const item = (icon: IconName, label: string, href?: string, active = false) => (
    <a
      key={label}
      href={href ?? '#'}
      className={cx('shop-rail__item', active && 'is-active')}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      title={label}
      onClick={href ? undefined : (e) => e.preventDefault()}
    >
      <Icon name={icon} size={20} />
    </a>
  );
  return (
    <nav className="shop-rail" aria-label="Platform">
      <IconButton icon="navbar" label="Expand navigation" size="sm" className="shop-rail__toggle" />
      <span className="shop-rail__divider" />
      {item('kanban', 'Dashboard')}
      {item('truck', 'Equipment')}
      {item('calendar', 'Planning')}
      {item('inventory', 'Shop', routeHref({ name: 'shop' }), route.name !== 'admin')}
      <span className="shop-rail__spacer" />
      {item('settings', 'Shop Admin', routeHref({ name: 'admin', tab: 'overview' }), route.name === 'admin')}
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
          <span className="shop-topbar__brand" aria-hidden>SYNIOTEC</span>
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
          <Notification key={t.id} variant="inline" tone={t.tone} title={t.title} onClose={() => dismiss(t.id)}>{t.message}</Notification>
        ))}
      </div>
    </div>
  );
}
