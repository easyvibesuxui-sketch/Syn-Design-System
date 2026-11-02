import { Button, Icon, Notification, Tooltip, type IconName } from '../../src';
import { cx } from '../../src/utils';
import { TopbarActions } from './UserMenu';
import { CartDrawer } from './CartDrawer';
import { LineIcon } from './parts';
import { AdminPage } from './pages/AdminPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProductPage } from './pages/ProductPage';
import { ShopPage } from './pages/ShopPage';
import { routeHref, useShop, type Route } from './store';
import { t, useLang } from './i18n';

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
  const outside = (label: string) => () => notify(label, t("{0} is outside this Shop prototype.", [label]), 'info');
  const item = (icon: IconName | 'bag', label: string, opts: { href?: string; active?: boolean } = {}) => (
    <Tooltip key={label} content={t(label)} placement="right">
      {opts.href ? (
        <a href={opts.href} className={cx('shop-rail__item', opts.active && 'is-active')} aria-label={t(label)} aria-current={opts.active ? 'page' : undefined}>
          {icon === 'bag' ? <LineIcon name="bag" /> : <Icon name={icon} size={20} />}
        </a>
      ) : (
        <button type="button" className="shop-rail__item" aria-label={t(label)} onClick={outside(t(label))}>
          {icon === 'bag' ? <LineIcon name="bag" /> : <Icon name={icon} size={20} />}
        </button>
      )}
    </Tooltip>
  );
  return (
    <nav className="shop-rail" aria-label={t("Platform")}>
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
  // Re-render everything when the language changes; texts read the language through t().
  useLang();
  const { route, toasts, dismiss } = useShop();
  return (
    <div className="syn-root shop-app">
      <Rail route={route} />
      <div className="shop-workspace">
        <header className="shop-topbar">
          <span className="shop-topbar__crumb">{t(crumbs[route.name])}</span>
          <span className="shop-topbar__brand" aria-label={t("SAM")}>{t("SAM")}</span>
          <TopbarActions />
        </header>
        <main className="shop-content">
          <Page route={route} />
        </main>
      </div>
      <CartDrawer />
      <div className="shop-toasts">
        {toasts.map((toast) => (
          <Notification key={toast.id} variant="inline" tone={toast.tone} title={toast.title} closeLabel={t('Dismiss')} onClose={() => dismiss(toast.id)}>
            {toast.message}
            {toast.action && <Button size="xs" variant="secondary" className="shop-toast-action" onClick={() => { toast.action!.run(); dismiss(toast.id); }}>{toast.action.label}</Button>}
          </Notification>
        ))}
      </div>
    </div>
  );
}
