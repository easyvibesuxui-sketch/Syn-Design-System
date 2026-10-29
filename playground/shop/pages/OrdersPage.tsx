import { useState } from 'react';
import { Card, EmptyState, Section, Select, Table, TextField, Value } from '../../../src';
import { cx } from '../../../src/utils';
import { CURRENT_USER, ORDER_STAGES, ORDER_STATUSES, money, type Order, type OrderStatus } from '../data';
import { BackLink, OrderStatusBadge, ProductArt, ShopHeader, SpecList, Summary } from '../parts';
import { routeHref, useShop } from '../store';

export const statusFilterOptions = [{ value: 'all', label: 'All statuses' }, ...ORDER_STATUSES.map((s) => ({ value: s, label: s }))];

/** The order's progress through the five stages; done stages show when they happened. */
export function OrderTimeline({ order, stages = ORDER_STAGES }: { order: Order; stages?: OrderStatus[] }) {
  const reached = ORDER_STAGES.indexOf(order.status);
  return (
    <ol className="shop-timeline">
      {stages.map((s, i) => {
        const when = order.history.find((h) => h[0] === s)?.[1];
        const done = order.history.some((h) => h[0] === s) || i <= reached;
        return (
          <li key={s} className={cx(done && 'is-done')}>
            <strong>{s}</strong>
            <span>{when ?? (done ? 'Updated' : 'Pending')}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderItems({ order }: { order: Order }) {
  return (
    <ul className="shop-lines">
      {order.items.map((i) => (
        <li key={i.id}>
          <ProductArt src={i.image} type={i.type} alt="" size="xs" />
          <span><strong>{i.name}</strong><span className="shop-muted">{i.qty} × {money(i.price)}</span></span>
          <strong>{money(i.qty * i.price)}</strong>
        </li>
      ))}
    </ul>
  );
}

export function orderInfo(o: Order): Array<[string, string]> {
  return [
    ['Company', o.org],
    ['Contact', `${o.contactName || o.orderedBy} · ${o.email} · ${o.phone}`],
    ['Delivery address', o.address],
    ['Billing', o.billing],
    ['PO / Reference', o.reference || '—'],
    ['Comment', o.comment || '—'],
  ];
}

function OrderDetail({ order: o }: { order: Order }) {
  return (
    <>
      <ShopHeader title="My orders" lead="Review orders you have submitted through the Shop." back />
      <BackLink href={routeHref({ name: 'orders' })}>Back to orders</BackLink>
      <div className="shop-order-head">
        <div>
          <h2 className="shop-order-head__id">{o.id}</h2>
          <p className="shop-muted">Submitted {o.date} · {o.time} by {o.orderedBy}</p>
        </div>
        <OrderStatusBadge status={o.status} />
      </div>
      <div className="shop-order-grid">
        <div className="shop-stack">
          <Section title="Order items">
            <p className="shop-muted">Prices are snapshots from the time the order was submitted.</p>
            <OrderItems order={o} />
            <Summary total={o.total} subtotal={false} />
          </Section>
          <Section title="Order information">
            <p className="shop-muted">Customer and delivery information submitted with the order.</p>
            <SpecList rows={orderInfo(o)} />
          </Section>
        </div>
        <Section title="Order status">
          <p className="shop-muted">{o.status === 'Cancelled' ? 'This order was cancelled by Syniotec.' : 'Syniotec updates the status as the order is processed.'}</p>
          {o.status === 'Cancelled' ? <OrderStatusBadge status="Cancelled" /> : <OrderTimeline order={o} />}
          <Card>
            <strong className="shop-card-title">Need to change or cancel this order?</strong>
            <p className="shop-muted">Contact Syniotec. Customer self-service cancellation is not included in V1.</p>
          </Card>
        </Section>
      </div>
    </>
  );
}

export function OrdersPage({ id }: { id?: string }) {
  const { orders } = useShop();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const selected = id && orders.find((o) => o.id === id);
  if (selected) return <OrderDetail order={selected} />;

  const q = search.trim().toLowerCase();
  const list = orders.filter((o) => o.orderedBy === CURRENT_USER.name
    && (status === 'all' || o.status === status)
    && `${o.id} ${o.reference}`.toLowerCase().includes(q));

  return (
    <>
      <ShopHeader title="My orders" lead="Orders you have submitted through the Shop." back />
      <div className="shop-section-head">
        <div>
          <h2 className="shop-section-head__title">Order history</h2>
          <p className="shop-muted">Open an order to review submitted items, delivery information and current status.</p>
        </div>
      </div>
      <div className="shop-toolbar">
        <TextField className="shop-toolbar__search" label="Search order or reference" hideLabel size="sm" iconStart="search" value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} />
        <Select className="shop-toolbar__sort" label="Order status" size="sm" options={statusFilterOptions} value={status} onChange={setStatus} />
      </div>
      {list.length
        ? (
          <Table
            caption="My orders"
            className="shop-table"
            rows={list}
            rowKey={(o) => o.id}
            columns={[
              { key: 'id', header: 'Order', render: (o) => <a className="shop-cell-link" href={routeHref({ name: 'orders', id: o.id })}>{o.id}<span>{o.reference || 'No reference'}</span></a> },
              { key: 'date', header: 'Submitted', render: (o) => <span className="shop-cell">{o.date}<span>{o.time}</span></span> },
              { key: 'items', header: 'Items', render: (o) => <Value>{o.items.reduce((n, i) => n + i.qty, 0)}</Value> },
              { key: 'total', header: 'Total', align: 'end', render: (o) => <strong>{money(o.total)}</strong> },
              { key: 'status', header: 'Status', render: (o) => <OrderStatusBadge status={o.status} /> },
            ]}
          />
        )
        : <EmptyState icon="search">No matching orders.</EmptyState>}
    </>
  );
}
