import { useMemo, useRef, useState } from 'react';
import { Button, Card, EmptyState, Icon, Segmented, Select, Tag, TextField } from '../../../src';
import { CURRENT_USER, canOrder, hardwareImages, hasPrice, money, plural, priceLabel, type Product } from '../data';
import { PriceRequestDialog } from '../PriceRequest';
import { QuickOrder } from '../QuickOrder';
import { AvailabilityBadge, InfoNote, LinkButton, OrderStatusBadge, ProductArt, ShopHeader } from '../parts';
import { routeHref, useShop } from '../store';

type Filter = 'All' | 'Hardware' | 'Tags';
type Sort = 'featured' | 'name' | 'price-asc' | 'price-desc';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

const benefits = [
  'Works directly with your syniotec platform',
  'Invoice after review, no online payment',
  'Devices appear once installed and commissioned',
];

function sortProducts(list: Product[], sort: Sort) {
  const price = (p: Product, empty: number) => (hasPrice(p) ? p.price : empty);
  if (sort === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'price-asc') return [...list].sort((a, b) => price(a, Infinity) - price(b, Infinity));
  if (sort === 'price-desc') return [...list].sort((a, b) => price(b, -Infinity) - price(a, -Infinity));
  return list;
}

function ProductCard({ product: p, onRequest }: { product: Product; onRequest: (p: Product) => void }) {
  const { addToCart, cart } = useShop();
  const href = routeHref({ name: 'product', id: p.id });
  const inCart = cart.find((l) => l.productId === p.id)?.qty ?? 0;
  const unavailable = p.availability === 'Temporarily unavailable';
  return (
    <Card className="shop-product">
      <a className="shop-product__media" href={href} aria-label={`View ${p.name}`}>
        <span className="shop-product__badges">
          <Tag variant="soft">{p.category === 'Hardware' ? 'Hardware' : 'Tag'}</Tag>
          <AvailabilityBadge availability={p.availability} />
        </span>
        <ProductArt src={p.image} type={p.type} alt="" size="md" />
      </a>
      <div className="shop-product__info">
        <h3 className="shop-product__name"><a href={href}>{p.name}</a></h3>
        <p className="shop-product__short">{p.short}</p>
        <p className="shop-sku">SKU · {p.id}</p>
        <div className="shop-product__foot">
          <div>
            <span className="shop-price">{priceLabel(p)}</span>
            <span className="shop-tax">{hasPrice(p) ? 'excl. VAT' : 'Quoted for your quantity'}</span>
          </div>
          <div className="shop-product__actions">
            <LinkButton href={href}>Details</LinkButton>
            {canOrder(p) && <Button size="sm" iconStart="plus" onClick={() => addToCart(p)}>{inCart ? 'Add 1 more' : 'Add to cart'}</Button>}
            {!canOrder(p) && !unavailable && <Button size="sm" variant="secondary" iconStart="mail" onClick={() => onRequest(p)}>Request price</Button>}
            {unavailable && <Button size="sm" disabled>Unavailable</Button>}
          </div>
        </div>
        {inCart > 0 && <p className="shop-in-cart"><Icon name="check" size={16} />{inCart} in your cart</p>}
      </div>
    </Card>
  );
}

/** The buyer's latest order, one click from being ordered again. Most B2B orders repeat an earlier one. */
function OrderAgain() {
  const { orders, reorder } = useShop();
  const last = orders.find((o) => o.orderedBy === CURRENT_USER.name);
  if (!last) return null;
  const count = last.items.reduce((n, i) => n + i.qty, 0);
  return (
    <Card className="shop-again">
      <span className="shop-again__thumbs" aria-hidden>
        {last.items.slice(0, 3).map((i) => <ProductArt key={i.id} src={i.image} type={i.type} alt="" size="xs" />)}
      </span>
      <div className="shop-again__copy">
        <span className="shop-eyebrow">Your last order</span>
        <strong>{last.items.map((i) => `${i.qty} × ${i.name}`).join(', ')}</strong>
        <span className="shop-muted">{last.id} · {last.date} · {plural(count, 'item')} · {money(last.total)}</span>
      </div>
      <OrderStatusBadge status={last.status} />
      <div className="shop-again__actions">
        <LinkButton href={routeHref({ name: 'orders', id: last.id })}>View order</LinkButton>
        <Button size="sm" iconStart="refresh" onClick={() => reorder(last)}>Order again</Button>
      </div>
    </Card>
  );
}

export function ShopPage() {
  const { products } = useShop();
  const [filter, setFilter] = useState<Filter>('All');
  const [sort, setSort] = useState<Sort>('featured');
  const [search, setSearch] = useState('');
  const [quick, setQuick] = useState(false);
  const [requesting, setRequesting] = useState<Product | null>(null);
  const catalogue = useRef<HTMLElement>(null);

  const active = products.filter((p) => p.active);
  const count = (c: Filter) => active.filter((p) => c === 'All' || p.category === c).length;
  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    const shown = active.filter((p) => (filter === 'All' || p.category === filter)
      && (!q || [p.name, p.id, p.short, p.description, p.category].some((v) => v.toLowerCase().includes(q))));
    return sortProducts(shown, sort);
  }, [active, filter, sort, search]);

  const clear = () => { setSearch(''); setFilter('All'); setSort('featured'); };

  return (
    <>
      <ShopHeader
        title="Shop"
        lead="Order syniotec hardware and passive tags for your fleet."
        extra={<Button size="sm" variant="secondary" iconStart="list" onClick={() => setQuick(true)}>Quick order</Button>}
      />

      <section className="shop-hero" aria-labelledby="hero-title">
        <div className="shop-hero__copy">
          <p className="shop-eyebrow shop-eyebrow--brand">Telematics & hardware</p>
          <h2 id="hero-title" className="shop-hero__title">Network your fleet.</h2>
          <p className="shop-hero__lead">Trackers, beacons and passive tags for every machine, vehicle and tool, ordered from the platform you already use.</p>
          <ul className="shop-hero__points">
            {benefits.map((b) => <li key={b}><Icon name="check" size={16} />{b}</li>)}
          </ul>
          <div className="shop-row">
            <Button size="md" iconEnd="arrow" onClick={() => catalogue.current?.scrollIntoView({ behavior: 'smooth' })}>Browse products</Button>
            <Button size="md" variant="secondary" onClick={() => setQuick(true)}>Order by SKU</Button>
          </div>
        </div>
        <div className="shop-hero__art" aria-hidden>
          <ProductArt src={hardwareImages.edge} type="hardware" alt="" size="lg" />
          <ProductArt src={hardwareImages.link} type="hardware" alt="" size="sm" />
          <ProductArt src={hardwareImages.dot} type="dot" alt="" size="sm" />
        </div>
      </section>

      <OrderAgain />

      <section ref={catalogue} className="shop-catalogue" aria-labelledby="catalogue-title">
        <div className="shop-section-head">
          <div>
            <h2 id="catalogue-title" className="shop-section-head__title">Products</h2>
            <p className="shop-muted">Active telematics for powered and unpowered equipment, and passive tags for direct access to the equipment profile.</p>
          </div>
          <span className="shop-muted" aria-live="polite">{plural(list.length, 'product')}</span>
        </div>

        <div className="shop-toolbar">
          <TextField
            className="shop-toolbar__search"
            label="Search by name, SKU or use"
            hideLabel
            size="sm"
            iconStart="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
          <Segmented
            label="Product category"
            options={(['All', 'Hardware', 'Tags'] as Filter[]).map((c) => ({ value: c, label: `${c} · ${count(c)}` }))}
            value={filter}
            onChange={(v) => setFilter(v as Filter)}
          />
          <Select className="shop-toolbar__sort" label="Sort products" size="sm" options={sortOptions} value={sort} onChange={(v) => setSort(v as Sort)} />
        </div>

        {list.length
          ? <div className="shop-grid">{list.map((p) => <ProductCard key={p.id} product={p} onRequest={setRequesting} />)}</div>
          : (
            <EmptyState icon="search" action={<Button size="sm" variant="secondary" onClick={clear}>Clear search and filters</Button>}>
              {search ? `No products match “${search.trim()}”.` : 'No products in this category.'} Try a SKU such as DOT or TAG-S, or clear the filters.
            </EmptyState>
          )}
      </section>

      <InfoNote>Prices are general list prices excl. VAT. Syniotec confirms delivery costs and dates when it reviews your order.</InfoNote>

      <QuickOrder open={quick} onClose={() => setQuick(false)} />
      <PriceRequestDialog key={requesting?.id ?? 'none'} product={requesting} onClose={() => setRequesting(null)} />
    </>
  );
}
