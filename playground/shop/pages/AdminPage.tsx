import { useState } from 'react';
import { Button, Card, Dialog, Drawer, EmptyState, IconButton, Icon, Section, Select, StatusBadge, Table, TextArea, TextField, Value, type IconName } from '../../../src';
import { ORDER_STATUSES, money, priceLabel, hasPrice, stamp, type Order, type OrderStatus } from '../data';
import { DrawerContext, DrawerTitle, InfoNote, OrderStatusBadge, PageHeader, ProductArt, SpecList, LinkButton } from '../parts';
import { routeHref, useShop, type AdminTab } from '../store';
import { OrderItems, orderInfo, statusFilterOptions } from './OrdersPage';
import { ProductEditor } from './ProductEditor';

function OrderId({ order, onOpen }: { order: Order; onOpen: (o: Order) => void }) {
  return (
    <button type="button" className="shop-cell-link" onClick={() => onOpen(order)}>
      {order.id}<span>{order.reference || 'No reference'}</span>
    </button>
  );
}

function Overview({ onOpen, onAll }: { onOpen: (o: Order) => void; onAll: (status?: OrderStatus) => void }) {
  const { products, orders, requests } = useShop();
  const active = products.filter((p) => p.active).length;
  const waiting = orders.filter((o) => o.status === 'Submitted');
  const open = orders.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled').length;
  const noPrice = products.filter((p) => p.active && !hasPrice(p)).length;
  // The prototype's four metrics; open orders link to the waiting ones first.
  const metrics: Array<[string, string, string, (() => void)?]> = [
    ['Active products', String(active), noPrice ? `${products.length - active} inactive · ${noPrice} without a price` : `${products.length - active} inactive`],
    ['Open orders', String(open), waiting.length ? `Manual processing · ${waiting.length} waiting for confirmation` : 'Manual processing', open ? () => onAll(waiting.length ? 'Submitted' : undefined) : undefined],
    ['All orders', String(orders.length), 'Customer order requests', () => onAll()],
    ['Order value', money(orders.reduce((n, o) => n + o.total, 0)), 'Excl. VAT · demo data'],
  ];
  return (
    <div className="shop-stack">
      <div className="shop-metrics">
        {metrics.map(([label, value, note, run]) => (
          <Card key={label} className="shop-metric">
            <span className="shop-metric__label">{label}</span>
            <span className="shop-metric__value">{value}</span>
            <span className="shop-muted">{note}</span>
            {run && <Button size="xs" variant="text" iconEnd="arrow" className="shop-metric__link" onClick={run}>Show orders</Button>}
          </Card>
        ))}
      </div>
      {requests.length > 0 && (
        <Section title={`Price requests · ${requests.length}`}>
          <p className="shop-muted">Customers asked for a price on products without one. Reply by email, then set a price in Products.</p>
          <Table
            caption="Price requests"
            className="shop-table"
            rows={requests}
            rowKey={(r) => r.id}
            columns={[
              { key: 'productName', header: 'Product', render: (r) => <span className="shop-cell"><strong>{r.productName}</strong><span>{r.id}</span></span> },
              { key: 'qty', header: 'Quantity', render: (r) => <Value>{r.qty}</Value> },
              { key: 'requestedBy', header: 'Requested by' },
              { key: 'date', header: 'Date' },
              { key: 'note', header: 'Note', render: (r) => r.note || '—' },
            ]}
          />
        </Section>
      )}
      <Section title="Recent orders" actions={<Button size="xs" variant="secondary" onClick={() => onAll()}>View all orders</Button>}>
        <Table
          caption="Recent orders"
          className="shop-table"
          rows={orders.slice(0, 5)}
          rowKey={(o) => o.id}
          columns={[
            { key: 'id', header: 'Order', render: (o) => <OrderId order={o} onOpen={onOpen} /> },
            { key: 'org', header: 'Organisation' },
            { key: 'date', header: 'Submitted' },
            { key: 'total', header: 'Total', align: 'end', render: (o) => money(o.total) },
            { key: 'status', header: 'Status', render: (o) => <OrderStatusBadge status={o.status} /> },
          ]}
        />
      </Section>
    </div>
  );
}

function Products({ onEdit }: { onEdit: (id: string | null) => void }) {
  const { products } = useShop();
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();
  const list = products.filter((p) => [p.name, p.id, p.category, p.short].join(' ').toLowerCase().includes(q));
  return (
    <div className="shop-stack">
      <div className="shop-toolbar">
        <TextField className="shop-toolbar__search" label="Search products" hideLabel size="sm" iconStart="search" value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} />
        <Button size="sm" iconStart="plus" onClick={() => onEdit(null)}>Add product</Button>
      </div>
      {list.length ? (
        <Table
          caption="Products"
          className="shop-table"
          rows={list}
          rowKey={(p) => p.id}
          columns={[
            {
              key: 'name', header: 'Product', width: '34%', render: (p) => (
                <span className="shop-product-cell">
                  <ProductArt src={p.image} type={p.type} alt="" size="xs" />
                  <span className="shop-cell"><strong>{p.name}</strong><span>{p.short}</span></span>
                </span>
              ),
            },
            { key: 'category', header: 'Category' },
            { key: 'id', header: 'SKU' },
            { key: 'price', header: 'Price', align: 'end', render: (p) => <span className="shop-cell"><strong>{priceLabel(p)}</strong>{hasPrice(p) && <span>excl. VAT</span>}</span> },
            { key: 'availability', header: 'Availability' },
            { key: 'active', header: 'Status', render: (p) => <StatusBadge tone={p.active ? 'success' : 'neutral'}>{p.active ? 'Active' : 'Inactive'}</StatusBadge> },
          ]}
          rowActions={(p) => <IconButton icon="edit" label={`Edit ${p.name}`} variant="outline" size="xs" onClick={() => onEdit(p.id)} />}
        />
      ) : <EmptyState icon="search">No matching products.</EmptyState>}
    </div>
  );
}

function Orders({ onOpen, initialStatus = 'all' }: { onOpen: (o: Order) => void; initialStatus?: string }) {
  const { orders } = useShop();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const q = search.trim().toLowerCase();
  const list = orders.filter((o) => (status === 'all' || o.status === status)
    && [o.id, o.org, o.orderedBy, o.reference].join(' ').toLowerCase().includes(q));
  return (
    <div className="shop-stack">
      <div className="shop-toolbar">
        <TextField className="shop-toolbar__search" label="Search order, organisation or person" hideLabel size="sm" iconStart="search" value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} />
        <Select className="shop-toolbar__sort" label="Order status" size="sm" options={statusFilterOptions} value={status} onChange={setStatus} />
      </div>
      {list.length ? (
        <Table
          caption="Orders"
          className="shop-table"
          rows={list}
          rowKey={(o) => o.id}
          columns={[
            { key: 'id', header: 'Order', render: (o) => <OrderId order={o} onOpen={onOpen} /> },
            { key: 'org', header: 'Organisation' },
            { key: 'orderedBy', header: 'Ordered by' },
            { key: 'date', header: 'Submitted', render: (o) => <span className="shop-cell">{o.date}<span>{o.time}</span></span> },
            { key: 'total', header: 'Total', align: 'end', render: (o) => <strong>{money(o.total)}</strong> },
            { key: 'status', header: 'Status', render: (o) => <OrderStatusBadge status={o.status} /> },
          ]}
        />
      ) : <EmptyState icon="search">No matching orders.</EmptyState>}
    </div>
  );
}

/** Admin record drawer for one order: customer data and items on the left, status and internal note on the right. */
function OrderDrawer({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const { orders, setOrders, notify } = useShop();
  const [status, setStatus] = useState<OrderStatus>(order?.status ?? 'Submitted');
  const [note, setNote] = useState(order?.internalNote ?? '');

  const save = () => {
    if (!order) return;
    const history = status === order.status ? order.history : [...order.history, [status, stamp().both] as [OrderStatus, string]];
    setOrders(orders.map((o) => (o.id === order.id ? { ...o, status, internalNote: note.trim(), history } : o)));
    notify(status === order.status ? `${order.id} saved` : `${order.id} is now ${status}`, status === order.status ? 'The internal note was updated.' : 'The customer sees the new status in My orders.');
    onClose();
  };

  return (
    <Drawer
      open={!!order}
      onClose={onClose}
      label={order ? `Order ${order.id}` : 'Order'}
      width={1024}
      headerStart={order && <>
        <OrderStatusBadge status={order.status} />
        <DrawerContext icon="inventory">{order.id}</DrawerContext>
      </>}
      footer={<>
        <Button variant="text" onClick={onClose}>Discard</Button>
        <Button size="md" onClick={save}>Save changes</Button>
      </>}
    >
      {order && <DrawerTitle title={order.org} lead={`Submitted ${order.date} · ${order.time} by ${order.contactName || order.orderedBy}${order.reference ? ` · ${order.reference}` : ''}`} />}
      {order && (
        <div className="shop-drawer-grid">
          <div className="shop-stack">
            <Section title="Customer & delivery">
              <SpecList rows={orderInfo(order).map(([k, v]) => [k === 'Contact' ? 'Ordered by' : k === 'Comment' ? 'Customer comment' : k, v])} />
            </Section>
            <Section title="Order items">
              <OrderItems order={order} />
              <dl className="shop-summary"><div className="shop-summary__total"><dt>Total</dt><dd>{money(order.total)}</dd></div></dl>
            </Section>
          </div>
          <div className="shop-stack">
            <Section title="Processing">
              <Select label="Status" hideLabel={false} size="md" value={status} onChange={(v) => setStatus(v as OrderStatus)} options={ORDER_STATUSES.map((s) => ({ value: s, label: s }))} />
              <TextArea label="Internal note" hideLabel={false} hint="Not visible to customer" rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
            </Section>
            <Section title="Status history">
              <ol className="shop-timeline">
                {order.history.map(([s, when], i) => <li key={`${s}-${i}`} className="is-done"><strong>{s}</strong><span>{when}</span></li>)}
              </ol>
            </Section>
          </div>
        </div>
      )}
    </Drawer>
  );
}

// The prototype's admin side navigation (Overview, Products, Orders).
const adminSections: Array<[AdminTab, string, IconName]> = [['overview', 'Overview', 'inventory'], ['products', 'Products', 'list'], ['orders', 'Orders', 'kanban']];

export function AdminPage({ tab }: { tab: AdminTab }) {
  const { go, reset, notify } = useShop();
  const [order, setOrder] = useState<Order | null>(null);
  const [editing, setEditing] = useState<string | null | undefined>(undefined);
  const [confirmReset, setConfirmReset] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');
  const setTab = (t: string) => { setOrderFilter('all'); go({ name: 'admin', tab: t as AdminTab }); };
  const showOrders = (status?: OrderStatus) => { setTab('orders'); setOrderFilter(status ?? 'all'); };

  const content = tab === 'products'
    ? <Products onEdit={setEditing} />
    : tab === 'orders' ? <Orders key={orderFilter} onOpen={setOrder} initialStatus={orderFilter} /> : <Overview onOpen={setOrder} onAll={showOrders} />;

  return (
    <>
      <PageHeader
        title="Shop Admin"
        lead="Manage the product catalogue, general prices and incoming Shop orders."
        actions={<>
          <Button size="sm" variant="text" iconStart="refresh" onClick={() => setConfirmReset(true)}>Reset demo data</Button>
          <LinkButton href={routeHref({ name: 'shop' })}>Open Shop</LinkButton>
        </>}
      />
      <InfoNote tone="warning"><strong>Prototype note:</strong> product prices shown here are sample values until Syniotec provides the real selling prices. In production, Shop Admin is the source of truth.</InfoNote>
      <div className="shop-admin">
        <nav className="shop-admin__nav" aria-label="Shop Admin">
          <span className="shop-eyebrow">Shop Admin</span>
          {adminSections.map(([id, label, icon]) => (
            <a key={id} href={routeHref({ name: 'admin', tab: id })} className={tab === id ? 'is-active' : undefined} aria-current={tab === id ? 'page' : undefined} onClick={() => setOrderFilter('all')}>
              <Icon name={icon} size={16} />{label}
            </a>
          ))}
        </nav>
        <div className="shop-admin__main">{content}</div>
      </div>

      <OrderDrawer key={order?.id ?? 'none'} order={order} onClose={() => setOrder(null)} />
      <ProductEditor key={String(editing)} open={editing !== undefined} productId={editing ?? null} onClose={() => setEditing(undefined)} />
      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset demo data?"
        icon="refresh"
        description="Products, sample orders and price requests go back to their defaults and the cart is emptied. Your changes in this demo are lost."
        actions={<Button size="md" fullWidth onClick={() => { reset(); setConfirmReset(false); notify('Demo data reset', 'Products, sample orders and price requests are back to their defaults.'); }}>Reset demo data</Button>}
      />
    </>
  );
}
