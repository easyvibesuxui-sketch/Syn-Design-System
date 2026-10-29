import { useState } from 'react';
import { Button, Card, Dialog, Drawer, EmptyState, IconButton, Section, Select, StatusBadge, Table, Tabs, TextArea, TextField } from '../../../src';
import { ORDER_STATUSES, money, priceLabel, hasPrice, stamp, type Order, type OrderStatus } from '../data';
import { InfoNote, OrderStatusBadge, PageHeader, ProductArt, SpecList, LinkButton } from '../parts';
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

function Overview({ onOpen, onAll }: { onOpen: (o: Order) => void; onAll: () => void }) {
  const { products, orders } = useShop();
  const active = products.filter((p) => p.active).length;
  const open = orders.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled').length;
  const metrics: Array<[string, string, string]> = [
    ['Active products', String(active), `${products.length - active} inactive`],
    ['Open orders', String(open), 'Manual processing'],
    ['All orders', String(orders.length), 'Customer order requests'],
    ['Order value', money(orders.reduce((n, o) => n + o.total, 0)), 'Excl. VAT · demo data'],
  ];
  return (
    <div className="shop-stack">
      <div className="shop-metrics">
        {metrics.map(([label, value, note]) => (
          <Card key={label} className="shop-metric">
            <span className="shop-metric__label">{label}</span>
            <span className="shop-metric__value">{value}</span>
            <span className="shop-muted">{note}</span>
          </Card>
        ))}
      </div>
      <Section title="Recent orders" actions={<Button size="xs" variant="secondary" onClick={onAll}>View all orders</Button>}>
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

function Orders({ onOpen }: { onOpen: (o: Order) => void }) {
  const { orders } = useShop();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
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
    notify('Order updated', `${order.id} was saved.`);
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
        <span className="shop-drawer-title">{order.id}</span>
        <span className="shop-muted">{order.org} · {order.date} {order.time}</span>
      </>}
      footer={<>
        <Button variant="text" onClick={onClose}>Discard</Button>
        <Button size="md" onClick={save}>Save changes</Button>
      </>}
    >
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

export function AdminPage({ tab }: { tab: AdminTab }) {
  const { go, reset, notify } = useShop();
  const [order, setOrder] = useState<Order | null>(null);
  const [editing, setEditing] = useState<string | null | undefined>(undefined);
  const [confirmReset, setConfirmReset] = useState(false);
  const setTab = (t: string) => go({ name: 'admin', tab: t as AdminTab });

  const content = tab === 'products'
    ? <Products onEdit={setEditing} />
    : tab === 'orders' ? <Orders onOpen={setOrder} /> : <Overview onOpen={setOrder} onAll={() => setTab('orders')} />;

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
      <Tabs
        label="Shop Admin"
        size="md"
        className="shop-admin-tabs"
        value={tab}
        onChange={setTab}
        items={[
          { id: 'overview', label: 'Overview', iconStart: 'kanban' },
          { id: 'products', label: 'Products', iconStart: 'list' },
          { id: 'orders', label: 'Orders', iconStart: 'inventory' },
        ]}
      />
      {content}

      <OrderDrawer key={order?.id ?? 'none'} order={order} onClose={() => setOrder(null)} />
      <ProductEditor key={String(editing)} open={editing !== undefined} productId={editing ?? null} onClose={() => setEditing(undefined)} />
      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset demo data"
        icon="refresh"
        description="Restore the initial products and sample orders and empty the cart?"
        actions={<Button size="md" fullWidth onClick={() => { reset(); setConfirmReset(false); notify('Prototype reset', 'Initial products and sample orders were restored.'); }}>Reset</Button>}
      />
    </>
  );
}
