import { useState } from 'react';
import { Button, Card, Drawer, EmptyState, Section, Select, Table, TextField } from '../../../src';
import { cx } from '../../../src/utils';
import { CURRENT_USER, ORDER_STAGES, ORDER_STATUSES, money, type Order, type OrderStatus } from '../data';
import { DrawerContext, DrawerTitle, OrderStatusBadge, ProductArt, ShopHeader, SpecList, Summary } from '../parts';
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
  const { reorder } = useShop();
  return (
    <>
      <ShopHeader
        title={`Order ${o.id}`}
        lead={`Submitted ${o.date} · ${o.time} by ${o.orderedBy}${o.reference ? ` · ${o.reference}` : ''}`}
        back={{ href: routeHref({ name: 'orders' }), label: 'My orders' }}
        extra={<>
          <OrderStatusBadge status={o.status} />
          <Button size="sm" variant="secondary" iconStart="refresh" onClick={() => reorder(o)}>Order again</Button>
        </>}
      />
      <div className="shop-order-grid">
        <div className="shop-stack">
          <Section title="Order items">
            <p className="shop-muted">Prices as they were when you sent the order. Ordering again uses today’s prices.</p>
            <OrderItems order={o} />
            <Summary total={o.total} subtotal={false} />
          </Section>
          <Section title="Order information">
            <p className="shop-muted">Customer and delivery information submitted with the order.</p>
            <SpecList rows={orderInfo(o)} />
          </Section>
        </div>
        <Section title="Order status">
          <p className="shop-muted">{o.status === 'Cancelled' ? 'Syniotec cancelled this order. Contact Syniotec if you have questions.' : 'Syniotec updates the status at each step and emails you when it changes.'}</p>
          {o.status === 'Cancelled' ? <OrderStatusBadge status="Cancelled" /> : <OrderTimeline order={o} />}
          <Card>
            <strong className="shop-card-title">Need to change or cancel this order?</strong>
            <p className="shop-muted">Contact Syniotec with the order number {o.id}. Orders can’t be changed in the Shop yet.</p>
          </Card>
        </Section>
      </div>
    </>
  );
}

/** One order of the buyer's in a record drawer: what was ordered and at what price, where it is now, and Order again. */
function MyOrderDrawer({ order: o, onClose }: { order: Order | null; onClose: () => void }) {
  const { reorder } = useShop();
  return (
    <Drawer
      open={!!o}
      onClose={onClose}
      label={o ? `Order ${o.id}` : 'Order'}
      width={720}
      headerStart={o && <><OrderStatusBadge status={o.status} /><DrawerContext icon="cart">{o.id}</DrawerContext></>}
      footer={o && <>
        <Button variant="text" onClick={onClose}>Close</Button>
        <Button size="md" iconStart="refresh" onClick={() => { reorder(o); onClose(); }}>Order again</Button>
      </>}
    >
      {o && <DrawerTitle title={`Order ${o.id}`} lead={`Submitted ${o.date} · ${o.time} by ${o.orderedBy}${o.reference ? ` · ${o.reference}` : ''}`} />}
      {o && (
        <div className="shop-stack shop-order-drawer">
          <Section title="Order items">
            <p className="shop-muted">Prices as they were when you sent the order. Ordering again uses today’s prices.</p>
            <OrderItems order={o} />
            <Summary total={o.total} subtotal={false} />
          </Section>
          <Section title="Order status">
            {o.status === 'Cancelled' ? <OrderStatusBadge status="Cancelled" /> : <OrderTimeline order={o} />}
          </Section>
          <Section title="Order information">
            <SpecList rows={orderInfo(o)} />
          </Section>
        </div>
      )}
    </Drawer>
  );
}

export function OrdersPage({ id }: { id?: string }) {
  const { orders, reorder } = useShop();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const selected = id && orders.find((o) => o.id === id);
  if (selected) return <OrderDetail order={selected} />;

  const q = search.trim().toLowerCase();
  const list = orders.filter((o) => o.orderedBy === CURRENT_USER.name
    && (status === 'all' || o.status === status)
    && `${o.id} ${o.reference}`.toLowerCase().includes(q));

  return (
    <>
      <ShopHeader
        title="My orders"
        lead="Every order you sent, newest first. Open one for its details, or order the same products again in one click."
        back={{ href: routeHref({ name: 'shop' }), label: 'Shop' }}
      />
      <div className="shop-toolbar">
        <TextField className="shop-toolbar__search" label="Search order or reference" hideLabel size="sm" iconStart="search" value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} />
        <Select className="shop-toolbar__sort" label="Order status" size="sm" options={statusFilterOptions} value={status} onChange={setStatus} />
      </div>
      {list.length
        ? (
          // A click anywhere on a row opens its drawer; the order number is the keyboard way in, and Order again keeps its own action.
          <div
            className="shop-rows-open"
            onClick={(e) => {
              const target = e.target as Element;
              if (target.closest('button, a')) return;
              const row = target.closest('tbody tr');
              const index = row ? Array.from(row.parentElement!.children).indexOf(row) : -1;
              if (index >= 0) setOpenId(list[index].id);
            }}
          >
          <Table
            caption="My orders"
            className="shop-table"
            rows={list}
            rowKey={(o) => o.id}
            columns={[
              { key: 'id', header: 'Order', render: (o) => <button type="button" className="shop-cell-link" onClick={() => setOpenId(o.id)}>{o.id}<span>{o.reference || 'No reference'}</span></button> },
              { key: 'date', header: 'Submitted', render: (o) => <span className="shop-cell">{o.date}<span>{o.time}</span></span> },
              {
                key: 'items',
                header: 'Products',
                render: (o) => (
                  <ul className="shop-order-products">
                    {o.items.map((i) => (
                      <li key={i.id}>
                        <ProductArt src={i.image} type={i.type} alt="" size="xs" />
                        <span><strong>{i.qty} × {i.name}</strong><span>{money(i.price)} each</span></span>
                      </li>
                    ))}
                  </ul>
                ),
              },
              { key: 'total', header: 'Total', align: 'end', render: (o) => <strong>{money(o.total)}</strong> },
              { key: 'status', header: 'Status', render: (o) => <OrderStatusBadge status={o.status} /> },
            ]}
            rowActions={(o) => <Button size="sm" iconStart="refresh" onClick={() => reorder(o)} aria-label={`Order ${o.id} again`}>Order again</Button>}
          />
          </div>
        )
        : (
          <EmptyState icon="search" action={<Button size="sm" variant="secondary" onClick={() => { setSearch(''); setStatus('all'); }}>Show all orders</Button>}>
            No orders match this search or status.
          </EmptyState>
        )}
      <MyOrderDrawer order={orders.find((o) => o.id === openId) ?? null} onClose={() => setOpenId(null)} />
    </>
  );
}
