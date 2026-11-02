import { useState } from 'react';
import { Button, Card, Dialog, Drawer, EmptyState, IconButton, Section, Select, StatusBadge, Table, Tabs, TextArea, TextField, Value, type IconName } from '../../../src';
import { ORDER_STATUSES, money, priceLabel, hasPrice, stamp, type Order, type OrderStatus } from '../data';
import { DrawerContext, DrawerTitle, InfoNote, OrderStatusBadge, PageHeader, ProductArt, SpecList, LinkButton } from '../parts';
import { routeHref, useShop, type AdminTab } from '../store';
import { OrderItems, orderInfo, statusFilterOptions } from './OrdersPage';
import { ProductEditor } from './ProductEditor';
import { t } from '../i18n';

function OrderId({ order, onOpen }: { order: Order; onOpen: (o: Order) => void }) {
  return (
    <button type="button" className="shop-cell-link" onClick={() => onOpen(order)}>
      {order.id}<span>{order.reference || t("No reference")}</span>
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
    ['Active products', String(active), noPrice ? t('{0} inactive · {1} without a price', [products.length - active, noPrice]) : t('{0} inactive', [products.length - active])],
    ['Open orders', String(open), waiting.length ? t('Manual processing · {0} waiting for confirmation', [waiting.length]) : t('Manual processing'), open ? () => onAll(waiting.length ? 'Submitted' : undefined) : undefined],
    ['All orders', String(orders.length), t('Customer order requests'), () => onAll()],
    ['Order value', money(orders.reduce((n, o) => n + o.total, 0)), t('Excl. VAT · demo data')],
  ];
  return (
    <div className="shop-stack">
      <div className="shop-metrics">
        {metrics.map(([label, value, note, run]) => (
          <Card key={label} className="shop-metric">
            <span className="shop-metric__label">{t(label)}</span>
            <span className="shop-metric__value">{value}</span>
            <span className="shop-muted">{note}</span>
            {run && <Button size="xs" variant="text" iconEnd="arrow" className="shop-metric__link" onClick={run}>{t("Show orders")}</Button>}
          </Card>
        ))}
      </div>
      {requests.length > 0 && (
        <Section title={t("Price requests · {0}", [requests.length])}>
          <p className="shop-muted">{t("Customers asked for a price on products without one. Reply by email, then set a price in Products.")}</p>
          <Table
            caption={t("Price requests")}
            className="shop-table"
            rows={requests}
            rowKey={(r) => r.id}
            columns={[
              { key: 'productName', header: t("Product"), render: (r) => <span className="shop-cell"><strong>{r.productName}</strong><span>{r.id}</span></span> },
              { key: 'qty', header: t("Quantity"), render: (r) => <Value>{r.qty}</Value> },
              { key: 'requestedBy', header: t("Requested by") },
              { key: 'date', header: t("Date") },
              { key: 'note', header: t("Note"), render: (r) => r.note || '—' },
            ]}
          />
        </Section>
      )}
      <Section title={t("Recent orders")} actions={<Button size="xs" variant="secondary" onClick={() => onAll()}>{t("View all orders")}</Button>}>
        <Table
          caption={t("Recent orders")}
          className="shop-table"
          rows={orders.slice(0, 5)}
          rowKey={(o) => o.id}
          columns={[
            { key: 'id', header: t("Order"), render: (o) => <OrderId order={o} onOpen={onOpen} /> },
            { key: 'org', header: t("Organisation") },
            { key: 'date', header: t("Submitted") },
            { key: 'total', header: t("Total"), align: 'end', render: (o) => money(o.total) },
            { key: 'status', header: t("Status"), render: (o) => <OrderStatusBadge status={o.status} /> },
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
        <TextField className="shop-toolbar__search" label={t("Search products")} hideLabel size="sm" iconStart="search" value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} />
        <Button size="sm" iconStart="plus" onClick={() => onEdit(null)}>{t("Add product")}</Button>
      </div>
      {list.length ? (
        <Table
          caption={t("Products")}
          className="shop-table"
          rows={list}
          rowKey={(p) => p.id}
          columns={[
            {
              key: 'name', header: t("Product"), width: '34%', render: (p) => (
                <span className="shop-product-cell">
                  <ProductArt src={p.image} type={p.type} alt="" size="xs" />
                  <span className="shop-cell"><strong>{p.name}</strong><span>{t(p.short)}</span></span>
                </span>
              ),
            },
            { key: 'category', header: t("Category") },
            { key: 'id', header: t("SKU") },
            { key: 'price', header: t("Price"), align: 'end', render: (p) => <span className="shop-cell"><strong>{priceLabel(p)}</strong>{hasPrice(p) && <span>{t("excl. VAT")}</span>}</span> },
            { key: 'availability', header: t("Availability"), render: (p) => t(p.availability) },
            { key: 'active', header: t("Status"), render: (p) => <StatusBadge tone={p.active ? 'success' : 'neutral'}>{p.active ? t("Active") : t("Inactive")}</StatusBadge> },
          ]}
          rowActions={(p) => <IconButton icon="edit" label={t("Edit {0}", [p.name])} variant="outline" size="xs" onClick={() => onEdit(p.id)} />}
        />
      ) : <EmptyState icon="search">{t("No matching products.")}</EmptyState>}
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
        <TextField className="shop-toolbar__search" label={t("Search order, organisation or person")} hideLabel size="sm" iconStart="search" value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} />
        <Select className="shop-toolbar__sort" label={t("Order status")} size="sm" options={statusFilterOptions.map((o) => ({ ...o, label: t(o.label) }))} value={status} onChange={setStatus} />
      </div>
      {list.length ? (
        <Table
          caption={t("Orders")}
          className="shop-table"
          rows={list}
          rowKey={(o) => o.id}
          columns={[
            { key: 'id', header: t("Order"), render: (o) => <OrderId order={o} onOpen={onOpen} /> },
            { key: 'org', header: t("Organisation") },
            { key: 'orderedBy', header: t("Ordered by") },
            { key: 'date', header: t("Submitted"), render: (o) => <span className="shop-cell">{o.date}<span>{o.time}</span></span> },
            { key: 'total', header: t("Total"), align: 'end', render: (o) => <strong>{money(o.total)}</strong> },
            { key: 'status', header: t("Status"), render: (o) => <OrderStatusBadge status={o.status} /> },
          ]}
        />
      ) : <EmptyState icon="search">{t("No matching orders.")}</EmptyState>}
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
    notify(status === order.status ? t("{0} saved", [order.id]) : t("{0} is now {1}", [order.id, status]), status === order.status ? t("The internal note was updated.") : t("The customer sees the new status in My orders."));
    onClose();
  };

  return (
    <Drawer
      closeLabel={t('Close')}
      open={!!order}
      onClose={onClose}
      label={order ? t("Order {0}", [order.id]) : t("Order")}
      width={1024}
      headerStart={order && <>
        <OrderStatusBadge status={order.status} />
        <DrawerContext icon="cart">{order.id}</DrawerContext>
      </>}
      footer={<>
        <Button variant="text" onClick={onClose}>{t("Discard")}</Button>
        <Button size="md" onClick={save}>{t("Save changes")}</Button>
      </>}
    >
      {order && <DrawerTitle title={order.org} lead={t("Submitted {0} · {1} by {2}{3}", [order.date, order.time, order.contactName || order.orderedBy, order.reference ? ` · ${order.reference}` : ''])} />}
      {order && (
        <div className="shop-drawer-grid">
          <div className="shop-stack">
            <Section title={t("Customer & delivery")}>
              <SpecList rows={orderInfo(order).map(([k, v]) => [k === 'Contact' ? 'Ordered by' : k === 'Comment' ? 'Customer comment' : k, v])} />
            </Section>
            <Section title={t("Order items")}>
              <OrderItems order={order} />
              <dl className="shop-summary"><div className="shop-summary__total"><dt>{t("Total")}</dt><dd>{money(order.total)}</dd></div></dl>
            </Section>
          </div>
          <div className="shop-stack">
            <Section title={t("Processing")}>
              <Select label={t("Status")} hideLabel={false} size="md" value={status} onChange={(v) => setStatus(v as OrderStatus)} options={ORDER_STATUSES.map((s) => ({ value: s, label: t(s) }))} />
              <TextArea label={t("Internal note")} hideLabel={false} labelPosition="outside" hint={t("Not visible to customer")} rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
            </Section>
            <Section title={t("Status history")}>
              <ol className="shop-timeline">
                {order.history.map(([s, when], i) => <li key={`${s}-${i}`} className="is-done"><strong>{t(s)}</strong><span>{when}</span></li>)}
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
        title={t("Shop Admin")}
        lead={t("Manage the product catalogue, general prices and incoming Shop orders.")}
        actions={<>
          <Button size="sm" variant="text" iconStart="refresh" onClick={() => setConfirmReset(true)}>{t("Reset demo data")}</Button>
          <LinkButton href={routeHref({ name: 'shop' })}>{t("Open Shop")}</LinkButton>
        </>}
      />
      <InfoNote tone="warning"><strong>{t("Prototype note:")}</strong> {t("product prices shown here are sample values until Syniotec provides the real selling prices. In production, Shop Admin is the source of truth.")}</InfoNote>
      <div className="shop-admin">
        <Tabs
          className="shop-admin__tabs"
          label={t("Shop Admin")}
          size="md"
          value={tab}
          onChange={setTab}
          items={adminSections.map(([id, label, icon]) => ({ id, label: t(label), iconStart: icon }))}
        />
        <div className="shop-admin__main">{content}</div>
      </div>

      <OrderDrawer key={order?.id ?? 'none'} order={order} onClose={() => setOrder(null)} />
      <ProductEditor key={String(editing)} open={editing !== undefined} productId={editing ?? null} onClose={() => setEditing(undefined)} />
      <Dialog
        closeLabel={t('Close')}
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title={t("Reset demo data?")}
        icon="refresh"
        description={t("Products, sample orders and price requests go back to their defaults and the cart is emptied. Your changes in this demo are lost.")}
        actions={<Button size="md" fullWidth onClick={() => { reset(); setConfirmReset(false); notify(t("Demo data reset"), t("Products, sample orders and price requests are back to their defaults.")); }}>{t("Reset demo data")}</Button>}
      />
    </>
  );
}
