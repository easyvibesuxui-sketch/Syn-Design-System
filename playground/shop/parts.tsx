import { useEffect, useState, type ReactNode } from 'react';
import { Button, Icon, IconButton, StatusBadge, type IconName, type StatusTone } from '../../src';
import { cx } from '../../src/utils';
import { money, plural, type ArtType, type Availability, type OrderStatus } from './data';
import { routeHref, useShop } from './store';
import hardwareArt from './assets/device-hardware.svg';
import dotArt from './assets/device-dot.svg';
import tagsArt from './assets/device-tags.svg';
import toolArt from './assets/device-tool.svg';
import chainArt from './assets/device-chain.svg';
import qrArt from './assets/device-qr.svg';

const illustrations: Record<ArtType, string> = { hardware: hardwareArt, dot: dotArt, tags: tagsArt, tool: toolArt, chain: chainArt, qr: qrArt };

/** Product image on a Smoke stage; falls back to the built-in illustration when there is no image or it fails to load. */
export function ProductArt({ src, type, alt, size = 'md', className }: {
  src?: string; type: ArtType; alt: string; size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const shown = src && !failed ? src : illustrations[type];
  return (
    <div className={cx('shop-art', `shop-art--${size}`, className)}>
      <img src={shown} alt={alt} loading="lazy" onError={() => setFailed(true)} />
    </div>
  );
}

const availabilityTone: Record<Availability, StatusTone> = {
  Available: 'success',
  'Available on request': 'progress',
  'Temporarily unavailable': 'error',
};
export function AvailabilityBadge({ availability }: { availability: Availability }) {
  return <StatusBadge tone={availabilityTone[availability]}>{availability}</StatusBadge>;
}

const orderTone: Record<OrderStatus, StatusTone> = {
  Submitted: 'neutral', Confirmed: 'info', Processing: 'progress', Shipped: 'info', Completed: 'success', Cancelled: 'error',
};
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <StatusBadge tone={orderTone[status]}>{status}</StatusBadge>;
}

/** Minus, the quantity and plus. Syn has no number stepper yet, so it is built from two outline IconButtons. */
export function QuantityStepper({ value, onChange, label, size = 'sm' }: {
  value: number; onChange: (qty: number) => void; label: string; size?: 'xs' | 'sm';
}) {
  return (
    <div className={cx('shop-stepper', `shop-stepper--${size}`)} role="group" aria-label={`${label} quantity`}>
      <IconButton icon="minus" label={`Decrease ${label}`} size={size} variant="outline" disabled={value <= 1} onClick={() => onChange(value - 1)} />
      <output className="shop-stepper__value" aria-live="polite">{value}</output>
      <IconButton icon="plus" label={`Increase ${label}`} size={size} variant="outline" disabled={value >= 999} onClick={() => onChange(value + 1)} />
    </div>
  );
}

/** Shop module header: eyebrow, title and lead on the left; My orders / Back to Shop and the cart on the right. */
export function ShopHeader({ title, lead, back, extra }: { title: string; lead: string; back?: boolean; extra?: ReactNode }) {
  const { cartQty, setCartOpen } = useShop();
  return (
    <PageHeader
      eyebrow="Syniotec Shop"
      title={title}
      lead={lead}
      actions={<>
        {back
          ? <LinkButton href={routeHref({ name: 'shop' })} iconStart="back">Back to Shop</LinkButton>
          : <LinkButton href={routeHref({ name: 'orders' })} iconStart="history">My orders</LinkButton>}
        {extra}
        <Button size="sm" iconStart="inventory" onClick={() => setCartOpen(true)} aria-label={cartQty ? `Cart, ${plural(cartQty, 'item')}` : 'Cart'}>
          Cart{cartQty > 0 && <span className="shop-count" aria-hidden>{cartQty}</span>}
        </Button>
      </>}
    />
  );
}

export function PageHeader({ eyebrow, title, lead, actions }: { eyebrow?: string; title: ReactNode; lead?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="shop-page-head">
      <div>
        {eyebrow && <p className="shop-eyebrow">{eyebrow}</p>}
        <h1 className="shop-page-head__title">{title}</h1>
        {lead && <p className="shop-page-head__lead">{lead}</p>}
      </div>
      {actions && <div className="shop-page-head__actions">{actions}</div>}
    </header>
  );
}

/** A navigation link drawn as a Syn secondary button. */
export function LinkButton({ href, iconStart, children, variant = 'secondary' }: {
  href: string; iconStart?: IconName; children: ReactNode; variant?: 'secondary' | 'text';
}) {
  return (
    <a href={href} className={cx('syn-button', `syn-button--${variant}`, 'syn-button--sm', 'shop-link-button')}>
      {iconStart && <Icon name={iconStart} size={16} />}
      <span className="syn-button__label">{children}</span>
    </a>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="shop-back" href={href}>
      <Icon name="back" size={16} />
      {children}
    </a>
  );
}

/** Label / value rows: specifications and order information. */
export function SpecList({ rows, empty }: { rows: Array<[string, ReactNode]>; empty?: string }) {
  if (!rows.length) return <p className="shop-muted">{empty}</p>;
  return (
    <dl className="shop-specs">
      {rows.map(([k, v], i) => (
        <div key={`${k}-${i}`} className="shop-specs__row"><dt>{k}</dt><dd>{v}</dd></div>
      ))}
    </dl>
  );
}

/** Subtotal, VAT, delivery and total. */
export function Summary({ total, subtotal = true }: { total: number; subtotal?: boolean }) {
  return (
    <dl className="shop-summary">
      {subtotal && <div><dt>Subtotal</dt><dd>{money(total)}</dd></div>}
      <div><dt>VAT</dt><dd>Excluded</dd></div>
      {subtotal && <div><dt>Delivery</dt><dd>Confirmed separately</dd></div>}
      <div className="shop-summary__total"><dt>Total</dt><dd>{money(total)}</dd></div>
    </dl>
  );
}

/** An inline hint with the Syn info icon, used for the "no online payment" and commissioning notes. */
export function InfoNote({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warning' }) {
  return (
    <p className={cx('shop-note', `shop-note--${tone}`)}>
      <Icon name={tone === 'warning' ? 'warning' : 'info-circle'} size={16} />
      <span>{children}</span>
    </p>
  );
}
