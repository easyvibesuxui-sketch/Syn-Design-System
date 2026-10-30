import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Button, Checkbox, Drawer, EmptyState, Icon, IconButton, Segmented, Select, Table, Tag, TextField } from '../../../src';
import { cx } from '../../../src/utils';
import {
  CURRENT_USER, FEATURED_ORDER, POWER_OPTIONS, canOrder, hasPrice, money, plural, priceLabel, suitableFor, suitableTerms,
  type Availability, type Category, type Power, type Product,
} from '../data';
import { PriceRequestDialog } from '../PriceRequest';
import { QuickOrder } from '../QuickOrder';
import { AvailabilityBadge, Chips, DrawerContext, DrawerTitle, ProductArt, QuantityStepper, ShopHeader } from '../parts';
import { routeHref, useShop } from '../store';
import { TermIcon } from '../termIcons';

type Sort = 'featured' | 'name' | 'price-asc' | 'price-desc';
type View = 'grid' | 'table';

interface Filters {
  category: Category[];
  /** Values from the products' own "Suitable for" texts. */
  use: string[];
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


function matches(p: Product, f: Filters, q: string) {
  if (f.category.length && !f.category.includes(p.category)) return false;
  if (f.use.length && !f.use.some((u) => suitableTerms(p).includes(u))) return false;
  if (f.power.length && !(p.power && f.power.includes(p.power))) return false;
  if (f.connectivity.length && !f.connectivity.some((c) => p.connectivity?.includes(c))) return false;
  if (f.availability.length && !f.availability.includes(p.availability)) return false;
  if (!q) return true;
  return [p.name, p.id, p.short, p.description, ...(p.connectivity ?? []), suitableFor(p) ?? ''].some((v) => v.toLowerCase().includes(q));
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
          {suitableFor(p) && <div><dt>For</dt><dd>{suitableFor(p)}</dd></div>}
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

/** A collapsible filter group: the header shows the title and how many values are selected; the options fold away. */
function FilterGroup<T extends string>({ title, options, selected, onChange, counts, total, label, limit, defaultOpen = false }: {
  title: string; options: T[]; selected: T[]; onChange: (next: T[]) => void; counts: (o: T) => number; label?: (o: T) => string;
  /** Products shown with this group cleared ("All"). */
  total: number;
  /** Long lists show this many options, plus any selected ones, behind a "Show all" toggle. */
  limit?: number;
  defaultOpen?: boolean;
}) {
  const [all, setAll] = useState(false);
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = `filter-${title.replace(/\W+/g, '-').toLowerCase()}`;
  const shown = !limit || all ? options : options.filter((o, i) => i < limit || selected.includes(o));
  return (
    <fieldset className={cx('shop-filter', open && 'is-open')}>
      <legend className="shop-filter__title">
        <button type="button" className="shop-filter__toggle" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen(!open)}>
          <span>{title}</span>
          {selected.length > 0 && <span className="shop-filter__selected">{selected.length}</span>}
          <Icon name="down" size={16} className="shop-filter__chevron" />
        </button>
      </legend>
      <div id={bodyId} className="shop-filter__body" hidden={!open}>
      <div className="shop-filter__row">
        <Checkbox label="All" checked={!selected.length} onChange={() => onChange([])} />
        <span className="shop-filter__count">{total}</span>
      </div>
      {shown.map((o) => {
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
      {limit && options.length > limit && (
        <Button size="xs" variant="text" className="shop-filter__more" aria-expanded={all} onClick={() => setAll(!all)}>
          {all ? 'Show fewer' : `Show all ${options.length}`}
        </Button>
      )}
      </div>
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
/** The buyer's latest order as one compact line with Order again, in the corner of the finder. */
/** The signed-in user's latest order, as a clickable card beside the ordering steps: one click puts the same items back in the cart. */
function LastOrder() {
  const { orders, reorder } = useShop();
  const last = orders.find((o) => o.orderedBy === CURRENT_USER.name);
  if (!last) return null;
  return (
    <button type="button" className="shop-last" onClick={() => reorder(last)}>
      <span className="shop-last__icon"><Icon name="refresh" size={20} /></span>
      <span className="shop-last__text">
        <span className="shop-last__title">Order again</span>
        <span className="shop-last__meta">Last order {last.id} · {money(last.total)}</span>
      </span>
      <Icon name="next" size={16} />
    </button>
  );
}

/**
 * Airbnb-style category bar: one scrolling row of icon-over-label items, muted until hovered, the selected one
 * black with a 2px underline, and round arrow buttons when the row overflows.
 */
/**
 * Splits a term into as few lines as fit `fit` characters, at most `max`, so the row stays narrow.
 * A line never starts with “&” or “/”: they stay with the word before them.
 */
function termLines(term: string, max = 3, fit = 13): string[] {
  const words = term.split(' ');
  const options: string[][] = [];
  const walk = (from: number, lines: string[]) => {
    if (from === words.length) { options.push(lines); return; }
    if (lines.length === max) return;
    for (let to = from + 1; to <= words.length; to++) {
      if (to < words.length && /^[&/]$/.test(words[to])) continue;
      walk(to, [...lines, words.slice(from, to).join(' ')]);
    }
  };
  walk(0, []);
  const width = (lines: string[]) => Math.max(...lines.map((l) => l.length));
  const fitting = options.filter((o) => width(o) <= fit).sort((a, b) => a.length - b.length || width(a) - width(b));
  return fitting[0] ?? options.sort((a, b) => width(a) - width(b))[0] ?? [term];
}

function TermLabel({ term }: { term: string }) {
  return (
    <span className="shop-termbar__label">
      {termLines(term).map((line, i) => <span key={line}>{i > 0 && ' '}{line}</span>)}
    </span>
  );
}

function TermBar({ terms, selected, onToggle, onAll }: { terms: string[]; selected: string[]; onToggle: (t: string) => void; onAll: () => void }) {
  const row = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const measure = useCallback(() => {
    const el = row.current;
    if (el) setEdges({ start: el.scrollLeft <= 1, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 });
  }, []);
  useEffect(() => {
    measure();
    // Labels change width once the web font loads.
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure, terms]);
  const scroll = (dir: 1 | -1) => row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <div className="shop-termbar">
      {!edges.start && <IconButton icon="back" label="Scroll back" size="sm" variant="outline" className="shop-termbar__arrow shop-termbar__arrow--start" onClick={() => scroll(-1)} />}
      <div ref={row} className="shop-termbar__row" role="group" aria-label="Suitable for" onScroll={measure}>
        <button type="button" className={cx('shop-termbar__item', !selected.length && 'is-on')} aria-pressed={!selected.length} onClick={onAll}>
          <TermIcon term={null} />
          <TermLabel term="All" />
        </button>
        {terms.map((t) => {
          const on = selected.includes(t);
          return (
            <button key={t} type="button" className={cx('shop-termbar__item', on && 'is-on')} aria-pressed={on} onClick={() => onToggle(t)}>
              <TermIcon term={t} />
              <TermLabel term={t} />
            </button>
          );
        })}
      </div>
      {!edges.end && <IconButton icon="next" label="Scroll forward" size="sm" variant="outline" className="shop-termbar__arrow shop-termbar__arrow--end" onClick={() => scroll(1)} />}
    </div>
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
  const countAll = (key: keyof Filters) => active.filter((p) => matches(p, { ...filters, [key]: [] }, q)).length;
  const set = <K extends keyof Filters>(key: K) => (next: Filters[K]) => setFilters({ ...filters, [key]: next });
  // Every "Suitable for" value in the catalogue, most common first.
  const terms = useMemo(() => {
    const n = new Map<string, number>();
    active.forEach((p) => suitableTerms(p).forEach((t) => n.set(t, (n.get(t) ?? 0) + 1)));
    return [...n.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t);
  }, [active]);
  const toggleUse = (u: string) => {
    set('use')(filters.use.includes(u) ? filters.use.filter((x) => x !== u) : [u]);
    document.getElementById('results-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const toggleCompare = (id: string) => setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id].slice(0, MAX_COMPARE)));

  const applied: Array<[string, () => void]> = [
    ...filters.category.map((v): [string, () => void] => [v, () => set('category')(filters.category.filter((x) => x !== v))]),
    ...filters.use.map((v): [string, () => void] => [v, () => set('use')(filters.use.filter((x) => x !== v))]),
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

      <section className="shop-panel shop-finder" aria-labelledby="finder-title">
        <div className="shop-panel__head">
          <h2 id="finder-title" className="shop-panel__title">What do you want to track?</h2>
        </div>
        <TermBar terms={terms} selected={filters.use} onToggle={toggleUse} onAll={() => set('use')([])} />
      </section>

      <div className="shop-ordering">
        <ol className="shop-steps" aria-label="How ordering works">
          {steps.map(([title, text], i) => (
            <li key={title}><span className="shop-steps__n">{i + 1}</span><span><strong>{title}</strong> {text}</span></li>
          ))}
        </ol>
        <LastOrder />
      </div>

      <div className="shop-catalog">
        <aside className={cx('shop-filters', filtersOpen && 'is-open')} aria-label="Filters">
          <div className="shop-filters__head">
            <h2 className="shop-panel__title">Filters{applied.length ? ` · ${applied.length}` : ''}</h2>
            {applied.length > 0 && <Button size="xs" variant="text" onClick={clearAll}>Clear all</Button>}
            {/* On narrow screens the filters fold away so the results stay near the top. */}
            <Button size="xs" variant="secondary" className="shop-filters__toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}>{filtersOpen ? 'Hide' : 'Show'}</Button>
          </div>
          <FilterGroup<Category> defaultOpen title="Category" options={['Hardware', 'Tags']} selected={filters.category} onChange={set('category')} counts={(o) => countWith('category', o)} total={countAll('category')} label={(o) => (o === 'Hardware' ? 'Active telematics' : 'Passive tags')} />
          <FilterGroup<string> title="Suitable for" options={terms} selected={filters.use} onChange={set('use')} counts={(o) => countWith('use', o)} total={countAll('use')} limit={6} />
          <FilterGroup<Power> title="Power source" options={POWER_OPTIONS} selected={filters.power} onChange={set('power')} counts={(o) => countWith('power', o)} total={countAll('power')} />
          <FilterGroup<string> title="Connectivity" options={CONNECTIVITY} selected={filters.connectivity} onChange={set('connectivity')} counts={(o) => countWith('connectivity', o)} total={countAll('connectivity')} />
          <FilterGroup<Availability> title="Availability" options={['Available', 'Available on request']} selected={filters.availability} onChange={set('availability')} counts={(o) => countWith('availability', o)} total={countAll('availability')} />
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
                { key: 'use', header: 'Suitable for', render: (p) => suitableFor(p) ?? '—' },
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
