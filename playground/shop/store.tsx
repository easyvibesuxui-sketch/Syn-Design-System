import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { NotificationTone } from '../../src';
import { canOrder, defaultProducts, seedOrders, type CartLine, type Order, type Product } from './data';

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
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  const [cartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const onHash = () => {
      setRoute(parseRoute(window.location.hash));
      setCartOpen(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = useCallback((r: Route) => {
    window.location.hash = routeHref(r);
  }, []);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const notify = useCallback((title: string, message: string, tone: NotificationTone = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list.slice(-2), { id, tone, title, message }]);
    window.setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  // Cart lines only count while their product is still active and orderable.
  const lines = useMemo(
    () => cart
      .map((c) => ({ ...c, product: products.find((p) => p.id === c.productId) }))
      .filter((l): l is CartLine & { product: Product } => !!l.product && canOrder(l.product)),
    [cart, products],
  );
  const cartQty = lines.reduce((n, l) => n + l.qty, 0);
  const cartTotal = lines.reduce((n, l) => n + l.qty * l.product.price, 0);

  const addToCart = useCallback((p: Product, qty = 1) => {
    if (!canOrder(p)) {
      notify('Cannot add product', 'This product cannot be ordered right now.', 'error');
      return;
    }
    setCart((list) => {
      const line = list.find((l) => l.productId === p.id);
      if (line) return list.map((l) => (l === line ? { ...l, qty: Math.min(999, l.qty + qty) } : l));
      return [...list, { productId: p.id, qty: Math.max(1, Math.min(999, qty)) }];
    });
    notify('Added to cart', `${p.name} was added to your cart.`);
  }, [notify, setCart]);

  const setQty = useCallback((productId: string, qty: number) => {
    setCart((list) => list.map((l) => (l.productId === productId ? { ...l, qty: Math.max(1, Math.min(999, qty)) } : l)));
  }, [setCart]);
  const removeFromCart = useCallback((productId: string) => setCart((list) => list.filter((l) => l.productId !== productId)), [setCart]);

  const reset = useCallback(() => {
    setProducts(structuredClone(defaultProducts));
    setOrders(structuredClone(seedOrders));
    setCart([]);
  }, [setCart, setOrders, setProducts]);

  return {
    products, setProducts, orders, setOrders, cart: lines, setCart, cartQty, cartTotal, addToCart, setQty, removeFromCart,
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
