import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { NotificationTone } from '../../src';
import { CURRENT_USER, canOrder, defaultProducts, plural, seedOrders, stamp, type CartLine, type Order, type PriceRequest, type Product } from './data';

export type AdminTab = 'overview' | 'products' | 'orders';
export type Route =
  | { name: 'shop' }
  | { name: 'product'; id: string }
  | { name: 'checkout' }
  | { name: 'confirmation'; id: string }
  | { name: 'orders'; id?: string }
  | { name: 'admin'; tab: AdminTab };

export interface Toast {
  id: number;
  tone: NotificationTone;
  title: string;
  message: string;
  /** "View cart" after adding products. */
  action?: { label: string; run: () => void };
}

/** Hash routes, so the browser's back button and reloads keep the page: #/product/EDGE, #/orders/SO-2026-00124. */
export function parseRoute(hash: string): Route {
  const [name, arg] = hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  if (name === 'product' && arg) return { name, id: arg };
  if (name === 'checkout') return { name };
  if (name === 'confirmation' && arg) return { name, id: arg };
  if (name === 'orders') return { name, id: arg || undefined };
  if (name === 'admin') return { name, tab: arg === 'products' || arg === 'orders' ? arg : 'overview' };
  return { name: 'shop' };
}

export function routeHref(r: Route): string {
  const arg = 'id' in r ? r.id : 'tab' in r ? r.tab : undefined;
  return `#/${r.name}${arg ? `/${encodeURIComponent(arg)}` : ''}`;
}

const VERSION = 'syn-shop-v1';
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${VERSION}:${key}`);
    return raw ? (JSON.parse(raw) as T) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(`${VERSION}:${key}`, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked; the demo keeps working in memory.
  }
}

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => load(key, fallback));
  useEffect(() => save(key, value), [key, value]);
  return [value, setValue] as const;
}

function useShopState() {
  const [products, setProducts] = useStored<Product[]>('products', defaultProducts);
  const [orders, setOrders] = useStored<Order[]>('orders', seedOrders);
  const [cart, setCart] = useStored<CartLine[]>('cart', []);
  const [requests, setRequests] = useStored<PriceRequest[]>('price-requests', []);
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  const [cartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const onHash = () => {
      setRoute(parseRoute(window.location.hash));
      setCartOpen(false);
      // A warning about the page you just left ("1 field still needs your input") is stale on the next one.
      setToasts((list) => list.filter((t) => t.tone === 'success' || t.tone === 'info'));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = useCallback((r: Route) => {
    window.location.hash = routeHref(r);
  }, []);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const notify = useCallback((title: string, message: string, tone: NotificationTone = 'success', action?: Toast['action']) => {
    const id = Date.now() + Math.random();
    // One toast at a time: stacked toasts cover the order summary and repeat themselves.
    setToasts([{ id, tone, title, message, action }]);
    window.setTimeout(() => dismiss(id), action ? 6000 : 4000);
  }, [dismiss]);
  const viewCart = useMemo(() => ({ label: 'View cart', run: () => setCartOpen(true) }), []);

  // Cart lines only count while their product is still active and orderable.
  const lines = useMemo(
    () => cart
      .map((c) => ({ ...c, product: products.find((p) => p.id === c.productId) }))
      .filter((l): l is CartLine & { product: Product } => !!l.product && canOrder(l.product)),
    [cart, products],
  );
  const cartQty = lines.reduce((n, l) => n + l.qty, 0);
  const cartTotal = lines.reduce((n, l) => n + l.qty * l.product.price, 0);

  /** Adds several lines at once (quick order, order again); returns how many products were added. */
  const addLines = useCallback((items: Array<{ product: Product; qty: number }>) => {
    const ok = items.filter((i) => canOrder(i.product) && i.qty > 0);
    setCart((list) => {
      const next = [...list];
      for (const { product, qty } of ok) {
        const i = next.findIndex((l) => l.productId === product.id);
        if (i >= 0) next[i] = { ...next[i], qty: Math.min(999, next[i].qty + qty) };
        else next.push({ productId: product.id, qty: Math.min(999, qty) });
      }
      return next;
    });
    return ok.length;
  }, [setCart]);

  const addToCart = useCallback((p: Product, qty = 1) => {
    if (!addLines([{ product: p, qty }])) {
      notify(`${p.name} can’t be ordered right now`, 'It is unavailable or has no price yet. Request a price instead.', 'warning');
      return;
    }
    notify(`${qty} × ${p.name} added to your cart`, 'Prices are excl. VAT. You can change quantities before sending the order.', 'success', viewCart);
  }, [addLines, notify, viewCart]);

  /** Order again: puts an earlier order's products back in the cart at today's prices. */
  const reorder = useCallback((order: Order) => {
    const items = order.items.map((i) => ({ product: products.find((p) => p.id === i.id), qty: i.qty }))
      .filter((i): i is { product: Product; qty: number } => !!i.product);
    const added = addLines(items);
    const skipped = order.items.length - added;
    if (!added) {
      notify('Nothing could be added', `None of the products from ${order.id} can be ordered right now.`, 'warning');
      return;
    }
    notify(
      `${plural(added, 'product')} from ${order.id} added to your cart`,
      skipped ? `${plural(skipped, 'product')} can’t be ordered right now and ${skipped === 1 ? 'was' : 'were'} left out. Prices are today’s.` : 'Same quantities as last time, at today’s prices.',
      skipped ? 'warning' : 'success',
      viewCart,
    );
  }, [addLines, notify, products, viewCart]);

  const requestPrice = useCallback((p: Product, qty: number, note: string) => {
    const now = stamp();
    setRequests((list) => [{ id: `PR-${now.year}-${String(list.length + 31).padStart(4, '0')}`, productId: p.id, productName: p.name, qty, note, date: now.both, requestedBy: CURRENT_USER.name }, ...list]);
    notify('Price request sent', `Syniotec will reply with a price for ${qty} × ${p.name} by email.`);
  }, [notify, setRequests]);

  const setQty = useCallback((productId: string, qty: number) => {
    setCart((list) => list.map((l) => (l.productId === productId ? { ...l, qty: Math.max(1, Math.min(999, qty)) } : l)));
  }, [setCart]);
  const removeFromCart = useCallback((productId: string) => setCart((list) => list.filter((l) => l.productId !== productId)), [setCart]);

  const reset = useCallback(() => {
    setProducts(structuredClone(defaultProducts));
    setOrders(structuredClone(seedOrders));
    setCart([]);
    setRequests([]);
  }, [setCart, setOrders, setProducts, setRequests]);

  return {
    products, setProducts, orders, setOrders, cart: lines, setCart, cartQty, cartTotal, addToCart, addLines, reorder, setQty, removeFromCart, requests, requestPrice,
    route, go, cartOpen, setCartOpen, toasts, notify, dismiss, reset,
  };
}

export type Shop = ReturnType<typeof useShopState>;
const ShopContext = createContext<Shop | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const shop = useShopState();
  return <ShopContext.Provider value={shop}>{children}</ShopContext.Provider>;
}

export function useShop(): Shop {
  const shop = useContext(ShopContext);
  if (!shop) throw new Error('useShop must be used inside ShopProvider');
  return shop;
}
