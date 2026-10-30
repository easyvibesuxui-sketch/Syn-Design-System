import { useMemo, useState, type ReactNode } from 'react';
import { Button, Checkbox, Drawer, EmptyState, Icon, IconButton, Segmented, Select, Table, Tag, TextField } from '../../../src';
import { cx } from '../../../src/utils';
import {
  CURRENT_USER, FEATURED_ORDER, POWER_OPTIONS, USE_CASES, canOrder, hasPrice, money, plural, priceLabel,
  type Availability, type Category, type Power, type Product, type UseCase,
} from '../data';
import { PriceRequestDialog } from '../PriceRequest';
import { QuickOrder } from '../QuickOrder';
import { AvailabilityBadge, Chips, DrawerContext, DrawerTitle, LinkButton, OrderStatusBadge, ProductArt, QuantityStepper, ShopHeader } from '../parts';
import { routeHref, useShop } from '../store';

type Sort = 'featured' | 'name' | 'price-asc' | 'price-desc';
type View = 'grid' | 'table';

interface Filters {
  category: Category[];
  use: UseCase[];
  power: Power[];
  connectivity: string[];
  availability: Availability[];
}
const noFilters: Filters = { category: [], use: [], power: [], connectivity: [], availability: [] };

const sortOptions = [
  { value: 'featured', label: 'Most relevant' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];
const CONNECTIVITY = ['LTE-M', '4G', 'NB-IoT', '2G fallback', 'Bluetooth', 'CAN', 'GPS', 'QR', 'NFC'];
const MAX_COMPARE = 3;

const useLabel = (u: UseCase) => USE_CASES.find((x) => x.id === u)?.label ?? u;

function matches(p: Product, f: Filters, q: string) {
  if (f.category.length && !f.category.includes(p.category)) return false;
  if (f.use.length && !f.use.some((u) => p.useCases?.includes(u))) return false;
  if (f.power.length && !(p.power && f.power.includes(p.power))) return false;
  if (f.connectivity.length && !f.connectivity.some((c) => p.connectivity?.includes(c))) return false;
  if (f.availability.length && !f.availability.includes(p.availability)) return false;
  if (!q) return true;
  return [p.name, p.id, p.short, p.description, ...(p.connectivity ?? []), ...(p.useCases ?? []).map(useLabel)].some((v) => v.toLowerCase().includes(q));
}

function sortProducts(list: Product[], sort: Sort) {
  const price = (p: Product, empty: number) => (hasPrice(p) ? p.price : empty);
  const rank = (p: Product) => { const i = FEATURED_ORDER.indexOf(p.id); return i < 0 ? 999 : i; };
  if (sort === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'price-asc') return [...list].sort((a, b) => price(a, Infinity) - price(b, Infinity));
  if (sort === 'price-desc') return [...list].sort((a, b) => price(b, -Infinity) - price(a, -Infinity));
  return [...list].sort((a, b) => rank(a) - rank(b));
}

/** Quantity and the main action, inline: B2B buyers order in quantities, so the stepper sits next to the button. */
function BuyControls({ product: p, onRequest, compact }: { product: Product; onRequest: (p: Product) => void; compact?: boolean }) {
  const { addToCart } = useShop();
  const [qty, setQty] = useState(1);
  if (p.availability === 'Temporarily unavailable') return <Button size="sm" disabled>Unavailable</Button>;
  if (!canOrder(p)) return <Button size="sm" variant="secondary" iconStart="mail" onClick={() => onRequest(p)}>Request price</Button>;
  return (
    <div className={cx('shop-buy-controls', compact && 'is-compact')}>
      <QuantityStepper size="xs" label={p.name} value={qty} onChange={setQty} />
      <Button size="sm" iconStart="plus" onClick={() => { addToCart(p, qty); setQty(1); }}>Add</Button>
    </div>
  );
}

function CompareToggle({ product: p, compare, onToggle }: { product: Product; compare: string[]; onToggle: (id: string) => void }) {
  const on = compare.includes(p.id);
  return (
    <Checkbox
      className="shop-compare-toggle"
      label="Compare"
      checked={on}
      disabled={!on && compare.length >= MAX_COMPARE}
      onChange={() => onToggle(p.id)}
      aria-label={`Compare ${p.name}`}
    />
  );
}

function ProductCard({ product: p, compare, onCompare, onRequest }: {
  product: Product; compare: string[]; onCompare: (id: string) => void; onRequest: (p: Product) => void;
}) {
  const { cart } = useShop();
  const href = routeHref({ name: 'product', id: p.id });
  const inCart = cart.find((l) => l.productId === p.id)?.qty ?? 0;
  return (
    <article className="shop-card">
      <a className="shop-card__media" href={href} tabIndex={-1} aria-hidden>
        <ProductArt src={p.image} type={p.type} alt="" size="md" />
      </a>
      <div className="shop-card__tags">
        <span className="shop-pill">{p.category === 'Hardware' ? 'Hardware' : 'Tag'}</span>
        {p.badge && <Tag color="var(--syn-action-brand)">{p.badge}</Tag>}
      </div>
      <div className="shop-card__body">
        <h3 className="shop-card__name"><a href={href}>{p.name}</a></h3>
        <p className="shop-card__short">{p.short}</p>
        <dl className="shop-card__facts">
          {p.power && <div><dt>Power</dt><dd>{p.power}{p.ip ? ` · ${p.ip}` : ''}</dd></div>}
          {!!p.useCases?.length && <div><dt>For</dt><dd>{p.useCases.map(useLabel).join(', ')}</dd></div>}
        </dl>
        <Chips items={p.connectivity ?? []} />
      </div>
      <div className="shop-card__foot">
        <div className="shop-card__price">
          <span className="shop-price">{priceLabel(p)}</span>
          <span className="shop-tax">{hasPrice(p) ? 'per item, excl. VAT' : 'quoted for your quantity'}</span>
        </div>
        <AvailabilityBadge availability={p.availability} />
      </div>
      <div className="shop-card__actions">
        <BuyControls product={p} onRequest={onRequest} />
        <CompareToggle product={p} compare={compare} onToggle={onCompare} />
      </div>
      {inCart > 0 && <p className="shop-in-cart"><Icon name="check" size={16} />{inCart} in your cart</p>}
    </article>
  );
}

function FilterGroup<T extends string>({ title, options, selected, onChange, counts, label }: {
  title: string; options: T[]; selected: T[]; onChange: (next: T[]) => void; counts: (o: T) => number; label?: (o: T) => string;
}) {
  return (
    <fieldset className="shop-filter">
      <legend className="shop-filter__title">{title}</legend>
      {options.map((o) => {
        const n = counts(o);
        const on = selected.includes(o);
        return (
          <div key={o} className="shop-filter__row">
            <Checkbox
              label={label ? label(o) : o}
              checked={on}
              disabled={!n && !on}
              onChange={() => onChange(on ? selected.filter((x) => x !== o) : [...selected, o])}
            />
            <span className="shop-filter__count">{n}</span>
          </div>
        );
      })}
    </fieldset>
  );
}

/** Side-by-side specs of up to three products: what buyers otherwise do in a spreadsheet. */
function CompareDrawer({ ids, open, onClose, onRemove, onRequest }: {
  ids: string[]; open: boolean; onClose: () => void; onRemove: (id: string) => void; onRequest: (p: Product) => void;
}) {
  const { products } = useShop();
  const items = ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p);
  const specKeys = [...new Set(items.flatMap((p) => p.specs.map(([k]) => k)))];
  const rows: Array<[string, (p: Product) => ReactNode]> = [
    ['Price', (p) => <strong>{priceLabel(p)}</strong>],
    ['Availability', (p) => <AvailabilityBadge availability={p.availability} />],
    ['Power', (p) => [p.power, p.ip].filter(Boolean).join(' · ') || '—'],
    ['Asset types', (p) => p.useCases?.map(useLabel).join(', ') || '—'],
    ['Interfaces', (p) => (p.connectivity?.length ? p.connectivity.join(', ') : '—')],
    ...specKeys.map((k): [string, (p: Product) => ReactNode] => [k, (p) => p.specs.find(([sk]) => sk === k)?.[1] ?? '—']),
  ];
  return (
    <Drawer open={open} onClose={onClose} label="Compare products" width={1024} headerStart={<DrawerContext icon="compare">Syniotec Shop</DrawerContext>}>
      <DrawerTitle title={`Compare ${plural(items.length, 'product')}`} lead="Differences in power, connectivity and specifications at a glance. Values come from the data sheets." />
      <div className="shop-drawer-body">
        <div className="shop-compare" style={{ gridTemplateColumns: `200px repeat(${items.length}, minmax(0, 1fr))` }} role="table" aria-label="Product comparison">
          <div role="row" className="shop-compare__row shop-compare__row--head">
            <span role="columnheader" />
            {items.map((p) => (
              <div role="columnheader" key={p.id} className="shop-compare__product">
                <ProductArt src={p.image} type={p.type} alt="" size="sm" />
                <strong>{p.name}</strong>
                <span className="shop-sku">SKU · {p.id}</span>
                <div className="shop-row">
                  <BuyControls product={p} onRequest={onRequest} compact />
                  <IconButton icon="close" label={`Remove ${p.name} from comparison`} size="sm" variant="outline" onClick={() => onRemove(p.id)} />
                </div>
              </div>
            ))}
          </div>
          {rows.map(([label, value]) => (
            <div role="row" key={label} className="shop-compare__row">
              <span role="rowheader" className="shop-compare__label">{label}</span>
              {items.map((p) => <span role="cell" key={p.id}>{value(p)}</span>)}
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}

/** The buyer's latest order, one click from being ordered again. Most B2B orders repeat an earlier one. */
function LastOrder() {
  const { orders, reorder } = useShop();
  const last = orders.find((o) => o.orderedBy === CURRENT_USER.name);
  if (!last) return null;
  const count = last.items.reduce((n, i) => n + i.qty, 0);
  return (
    <section className="shop-panel shop-last" aria-labelledby="last-title">
      <div className="shop-panel__head">
        <h2 id="last-title" className="shop-panel__title">Your last order</h2>
        <OrderStatusBadge status={last.status} />
      </div>
      <p className="shop-last__items">{last.items.map((i) => `${i.qty} × ${i.name}`).join(', ')}</p>
      <p className="shop-muted">{last.id} · {last.date} · {plural(count, 'item')} · {money(last.total)}</p>
      <div className="shop-row">
        <Button size="sm" iconStart="refresh" onClick={() => reorder(last)}>Order again</Button>
        <LinkButton href={routeHref({ name: 'orders', id: last.id })}>View order</LinkButton>
      </div>
    </section>
  );
}

const steps: Array<[string, string]> = [
  ['Add products', 'Choose hardware and tags and set quantities.'],
  ['Submit the order', 'No online payment. You send an order request.'],
  ['Syniotec confirms', 'Prices, delivery and invoice follow by email.'],
];

export function ShopPage() {
  const { products } = useShop();
  const [filters, setFilters] = useState<Filters>(noFilters);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<Sort>('featured');
  const [view, setView] = useState<View>('grid');
  const [compare, setCompare] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [quick, setQuick] = useState(false);
  const [requesting, setRequesting] = useState<Product | null>(null);

  const active = useMemo(() => products.filter((p) => p.active), [products]);
  const q = search.trim().toLowerCase();
  const list = useMemo(() => sortProducts(active.filter((p) => matches(p, filters, q)), sort), [active, filters, q, sort]);

  // Facet counts: how many products a value would show, given every other active filter.
  const countWith = <K extends keyof Filters>(key: K, value: Filters[K][number]) =>
    active.filter((p) => matches(p, { ...filters, [key]: [value] }, q)).length;
  const set = <K extends keyof Filters>(key: K) => (next: Filters[K]) => setFilters({ ...filters, [key]: next });
  const toggleUse = (u: UseCase) => {
    set('use')(filters.use.includes(u) ? filters.use.filter((x) => x !== u) : [u]);
    document.getElementById('results-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const toggleCompare = (id: string) => setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id].slice(0, MAX_COMPARE)));

  const applied: Array<[string, () => void]> = [
    ...filters.category.map((v): [string, () => void] => [v, () => set('category')(filters.category.filter((x) => x !== v))]),
    ...filters.use.map((v): [string, () => void] => [useLabel(v), () => set('use')(filters.use.filter((x) => x !== v))]),
    ...filters.power.map((v): [string, () => void] => [v, () => set('power')(filters.power.filter((x) => x !== v))]),
    ...filters.connectivity.map((v): [string, () => void] => [v, () => set('connectivity')(filters.connectivity.filter((x) => x !== v))]),
    ...filters.availability.map((v): [string, () => void] => [v, () => set('availability')(filters.availability.filter((x) => x !== v))]),
  ];
  const clearAll = () => { setFilters(noFilters); setSearch(''); };

  return (
    <>
      <ShopHeader
        title="Shop"
        lead="Order Syniotec hardware and passive tags directly from your platform."
        extra={<Button size="sm" variant="secondary" iconStart="list" onClick={() => setQuick(true)}>Order by SKU</Button>}
      />

      <div className="shop-start">
        <section className="shop-panel shop-finder" aria-labelledby="finder-title">
          <div className="shop-panel__head">
            <h2 id="finder-title" className="shop-panel__title">What do you want to track?</h2>
            {filters.use.length > 0 && <Button size="xs" variant="text" onClick={() => set('use')([])}>Show all</Button>}
          </div>
          <div className="shop-finder__options">
            {USE_CASES.map((u) => {
              const on = filters.use.includes(u.id);
              return (
                <button key={u.id} type="button" className={cx('shop-finder__option', on && 'is-on')} aria-pressed={on} onClick={() => toggleUse(u.id)}>
                  <Icon name={u.icon} size={24} />
                  <span className="shop-finder__label">{u.label}</span>
                  <span className="shop-finder__hint">{u.hint}</span>
                  <span className="shop-finder__count">{plural(active.filter((p) => p.useCases?.includes(u.id)).length, 'product')}</span>
                </button>
              );
            })}
          </div>
        </section>
        <LastOrder />
      </div>

      <ol className="shop-steps" aria-label="How ordering works">
        {steps.map(([title, text], i) => (
          <li key={title}><span className="shop-steps__n">{i + 1}</span><span><strong>{title}</strong> {text}</span></li>
        ))}
      </ol>

      <div className="shop-catalog">
        <aside className={cx('shop-filters', filtersOpen && 'is-open')} aria-label="Filters">
          <div className="shop-filters__head">
            <h2 className="shop-panel__title">Filters{applied.length ? ` · ${applied.length}` : ''}</h2>
            {applied.length > 0 && <Button size="xs" variant="text" onClick={clearAll}>Clear all</Button>}
            {/* On narrow screens the filters fold away so the results stay near the top. */}
            <Button size="xs" variant="secondary" className="shop-filters__toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}>{filtersOpen ? 'Hide' : 'Show'}</Button>
          </div>
          <FilterGroup<Category> title="Category" options={['Hardware', 'Tags']} selected={filters.category} onChange={set('category')} counts={(o) => countWith('category', o)} label={(o) => (o === 'Hardware' ? 'Active telematics' : 'Passive tags')} />
          <FilterGroup<UseCase> title="Suitable for" options={USE_CASES.map((u) => u.id)} selected={filters.use} onChange={set('use')} counts={(o) => countWith('use', o)} label={useLabel} />
          <FilterGroup<Power> title="Power source" options={POWER_OPTIONS} selected={filters.power} onChange={set('power')} counts={(o) => countWith('power', o)} />
          <FilterGroup<string> title="Connectivity" options={CONNECTIVITY} selected={filters.connectivity} onChange={set('connectivity')} counts={(o) => countWith('connectivity', o)} />
          <FilterGroup<Availability> title="Availability" options={['Available', 'Available on request']} selected={filters.availability} onChange={set('availability')} counts={(o) => countWith('availability', o)} />
        </aside>

        <section className="shop-results" aria-labelledby="results-title">
          <div className="shop-results__bar">
            <TextField
              className="shop-results__search"
              label="Search by name, SKU or connectivity"
              hideLabel
              size="sm"
              iconStart="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
            <Select className="shop-results__sort" label="Sort by" size="sm" options={sortOptions} value={sort} onChange={(v) => setSort(v as Sort)} />
            <Segmented label="View" options={[{ value: 'grid', label: 'Grid' }, { value: 'table', label: 'Table' }]} value={view} onChange={(v) => setView(v as View)} />
          </div>
          <div className="shop-results__meta">
            <h2 id="results-title" className="shop-results__count" aria-live="polite">{plural(list.length, 'product')}</h2>
            {applied.map(([label, remove]) => <Tag key={label} variant="soft" onRemove={remove} removeLabel={`Remove filter ${label}`}>{label}</Tag>)}
          </div>

          {!list.length && (
            <EmptyState icon="search" action={<Button size="sm" variant="secondary" onClick={clearAll}>Clear filters</Button>}>
              No products found. Try a different search or fewer filters.
            </EmptyState>
          )}

          {list.length > 0 && view === 'grid' && (
            <div className="shop-cards">
              {list.map((p) => <ProductCard key={p.id} product={p} compare={compare} onCompare={toggleCompare} onRequest={setRequesting} />)}
            </div>
          )}

          {list.length > 0 && view === 'table' && (
            <Table
              caption="Products"
              className="shop-table shop-product-table"
              rows={list}
              rowKey={(p) => p.id}
              columns={[
                {
                  key: 'name', header: 'Product', width: '26%', render: (p) => (
                    <a className="shop-product-cell" href={routeHref({ name: 'product', id: p.id })}>
                      <ProductArt src={p.image} type={p.type} alt="" size="xs" />
                      <span className="shop-cell"><strong>{p.name}</strong><span>SKU · {p.id}</span></span>
                    </a>
                  ),
                },
                { key: 'use', header: 'Suitable for', render: (p) => p.useCases?.map(useLabel).join(', ') || '—' },
                { key: 'power', header: 'Power', render: (p) => p.power ?? '—' },
                { key: 'conn', header: 'Connectivity', render: (p) => p.connectivity?.join(', ') || '—' },
                { key: 'availability', header: 'Availability', render: (p) => <AvailabilityBadge availability={p.availability} /> },
                { key: 'price', header: 'Price', align: 'end', render: (p) => <strong>{priceLabel(p)}</strong> },
                { key: 'buy', header: 'Order', render: (p) => <BuyControls product={p} onRequest={setRequesting} compact /> },
              ]}
              rowActions={(p) => <CompareToggle product={p} compare={compare} onToggle={toggleCompare} />}
            />
          )}
        </section>
      </div>

      {compare.length > 0 && (
        <div className="shop-compare-bar" role="region" aria-label="Comparison">
          <span><strong>{plural(compare.length, 'product')}</strong> selected to compare{compare.length >= MAX_COMPARE ? ' (maximum)' : ''}</span>
          <div className="shop-row">
            <Button size="sm" variant="text" onClick={() => setCompare([])}>Clear</Button>
            <Button size="sm" iconStart="compare" disabled={compare.length < 2} onClick={() => setComparing(true)}>Compare</Button>
          </div>
        </div>
      )}

      <aside className="shop-context">
        <div>
          <strong>Strengthening the construction industry with IoT solutions</strong>
          <p className="shop-muted">Syniotec combines manufacturer-independent telematics with software designed for construction. Devices appear in the platform after installation and commissioning.</p>
        </div>
        <ul className="shop-context__points">
          <li>Platform integration</li>
          <li>Equipment tracking</li>
          <li>Digital equipment profiles</li>
        </ul>
      </aside>

      <CompareDrawer ids={compare} open={comparing} onClose={() => setComparing(false)} onRemove={toggleCompare} onRequest={setRequesting} />
      <QuickOrder open={quick} onClose={() => setQuick(false)} />
      <PriceRequestDialog key={requesting?.id ?? 'none'} product={requesting} onClose={() => setRequesting(null)} />
    </>
  );
}
