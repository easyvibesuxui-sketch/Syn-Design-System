import { useMemo, useRef, useState } from 'react';
import { Button, EmptyState, Icon, Segmented, Select, TextField, type IconName } from '../../../src';
import { cx } from '../../../src/utils';
import { CURRENT_USER, FEATURED_ORDER, canOrder, hardwareImages, hasPrice, money, plural, priceLabel, tagCollage, type Product } from '../data';
import { PriceRequestDialog } from '../PriceRequest';
import { QuickOrder } from '../QuickOrder';
import { AvailabilityBadge, Chips, LinkButton, OrderStatusBadge, ProductArt, ShopHeader } from '../parts';
import { routeHref, useShop } from '../store';

type Filter = 'All' | 'Hardware' | 'Tags';
type Sort = 'featured' | 'name' | 'price-asc' | 'price-desc';
type TileSize = 'lg' | 'md' | 'sm';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

// The prototype's benefit strip, drawn like the syniotec.com benefits row.
const benefits: Array<[IconName, string, string]> = [
  ['dublecheck', 'Platform integration', 'Syniotec hardware is designed to work directly with your connected platform.'],
  ['inventory', 'Hardware for every application', 'From Bluetooth beacons to passive telematics for equipment access.'],
  ['settings', 'Quick & easy installation', 'Devices appear in the platform only after installation and commissioning.'],
];

const HERO_IMAGE = 'https://syniotec.com/wp-content/uploads/2026/03/24_syniotec-IOT.png';

/**
 * Bento rhythm of the syniotec.com hardware page: two large tiles, three medium, two large, then four small.
 * Tags run in rows of three. Search, filters and sorting fall back to an even grid.
 */
const hardwareRhythm: TileSize[] = ['lg', 'lg', 'md', 'md', 'md', 'lg', 'lg', 'sm', 'sm', 'sm', 'sm'];

function sortProducts(list: Product[], sort: Sort) {
  const price = (p: Product, empty: number) => (hasPrice(p) ? p.price : empty);
  const featured = (p: Product) => { const i = FEATURED_ORDER.indexOf(p.id); return i < 0 ? 999 : i; };
  if (sort === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'price-asc') return [...list].sort((a, b) => price(a, Infinity) - price(b, Infinity));
  if (sort === 'price-desc') return [...list].sort((a, b) => price(b, -Infinity) - price(a, -Infinity));
  return [...list].sort((a, b) => featured(a) - featured(b));
}

/** Product tile: big name top left, the product on the right, chips bottom left, price and action in the footer. */
function ProductTile({ product: p, size, onRequest }: { product: Product; size: TileSize; onRequest: (p: Product) => void }) {
  const { addToCart, cart } = useShop();
  const href = routeHref({ name: 'product', id: p.id });
  const inCart = cart.find((l) => l.productId === p.id)?.qty ?? 0;
  const unavailable = p.availability === 'Temporarily unavailable';
  return (
    <article className={cx('shop-tile', `shop-tile--${size}`)}>
      {p.badge && <span className="shop-tile__ribbon" aria-hidden><span>{p.badge}</span></span>}
      <div className="shop-tile__pills">
        <span className="shop-pill">{p.category === 'Hardware' ? 'Hardware' : 'Tag'}</span>
        <AvailabilityBadge availability={p.availability} />
      </div>
      <a className="shop-tile__link" href={href}>
        <h3 className="shop-tile__name">{p.name}</h3>
        <span className="syn-visually-hidden">{p.badge ? `, ${p.badge}` : ''}, view details</span>
      </a>
      <p className="shop-tile__short">{p.short}<span className="shop-sku">SKU · {p.id}</span></p>
      <ProductArt src={p.image} type={p.type} alt="" size="tile" className="shop-tile__art" />
      <div className="shop-tile__chips">
        <Chips items={p.connectivity ?? []} />
      </div>
      <div className="shop-tile__foot">
        <div>
          <span className="shop-price">{priceLabel(p)}</span>
          <span className="shop-tax">{hasPrice(p) ? 'excl. VAT' : 'Quoted for your quantity'}</span>
        </div>
        <div className="shop-tile__actions">
          {inCart > 0 && <span className="shop-in-cart"><Icon name="check" size={16} />{inCart} in cart</span>}
          <LinkButton href={href}>Details</LinkButton>
          {canOrder(p) && <Button size="sm" iconStart="plus" onClick={() => addToCart(p)}>{inCart ? 'Add 1 more' : 'Add to cart'}</Button>}
          {!canOrder(p) && !unavailable && <Button size="sm" variant="secondary" iconStart="mail" onClick={() => onRequest(p)}>Request price</Button>}
          {unavailable && <Button size="sm" disabled>Unavailable</Button>}
        </div>
      </div>
    </article>
  );
}

/** Three red arcs, the "signal" mark from the syniotec hero. */
function Signal() {
  return (
    <svg className="shop-hero__signal" viewBox="0 0 160 200" aria-hidden>
      <path d="M8 20 A140 140 0 0 1 148 160" />
      <path d="M8 64 A96 96 0 0 1 104 160" />
      <path d="M8 108 A52 52 0 0 1 60 160" />
    </svg>
  );
}

/** The buyer's latest order, one click from being ordered again. Most B2B orders repeat an earlier one. */
function OrderAgain() {
  const { orders, reorder } = useShop();
  const last = orders.find((o) => o.orderedBy === CURRENT_USER.name);
  if (!last) return null;
  const count = last.items.reduce((n, i) => n + i.qty, 0);
  return (
    <section className="shop-again" aria-label="Your last order">
      <span className="shop-again__thumbs" aria-hidden>
        {last.items.slice(0, 3).map((i) => <ProductArt key={i.id} src={i.image} type={i.type} alt="" size="xs" />)}
      </span>
      <div className="shop-again__copy">
        <span className="shop-eyebrow">Your last order · {last.id}</span>
        <strong>{last.items.map((i) => `${i.qty} × ${i.name}`).join(', ')}</strong>
        <span className="shop-muted">{last.date} · {plural(count, 'item')} · {money(last.total)}</span>
      </div>
      <OrderStatusBadge status={last.status} />
      <div className="shop-again__actions">
        <LinkButton href={routeHref({ name: 'orders', id: last.id })}>View order</LinkButton>
        <Button size="sm" iconStart="refresh" onClick={() => reorder(last)}>Order again</Button>
      </div>
    </section>
  );
}

export function ShopPage() {
  const { products } = useShop();
  const [filter, setFilter] = useState<Filter>('All');
  const [sort, setSort] = useState<Sort>('featured');
  const [search, setSearch] = useState('');
  const [quick, setQuick] = useState(false);
  const [requesting, setRequesting] = useState<Product | null>(null);
  const [heroImage, setHeroImage] = useState(true);
  const catalogue = useRef<HTMLElement>(null);
  const browse = (f?: Filter) => {
    if (f) setFilter(f);
    catalogue.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const active = products.filter((p) => p.active);
  const count = (c: Filter) => active.filter((p) => c === 'All' || p.category === c).length;
  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    const shown = active.filter((p) => (filter === 'All' || p.category === filter)
      && (!q || [p.name, p.id, p.short, p.description, p.category, ...(p.connectivity ?? [])].some((v) => v.toLowerCase().includes(q))));
    return sortProducts(shown, sort);
  }, [active, filter, sort, search]);

  // The bento layout only reads well for the full, featured catalogue.
  const bento = sort === 'featured' && !search.trim();
  const hardware = list.filter((p) => p.category === 'Hardware');
  const tags = list.filter((p) => p.category === 'Tags');
  const clear = () => { setSearch(''); setFilter('All'); setSort('featured'); };
  const tiles = (items: Product[], rhythm?: TileSize[]) => items.map((p, i) => (
    <ProductTile key={p.id} product={p} size={bento ? (rhythm?.[i] ?? 'sm') : 'sm'} onRequest={setRequesting} />
  ));

  return (
    <>
      <ShopHeader
        title="Shop"
        lead="Order syniotec hardware and passive tags for your fleet."
        extra={<Button size="sm" variant="secondary" iconStart="list" onClick={() => setQuick(true)}>Quick order</Button>}
      />

      <section className="shop-hero" aria-labelledby="hero-title">
        <div className="shop-hero__copy">
          <p className="shop-eyebrow shop-eyebrow--brand">Syniotec telematics & hardware</p>
          <h2 id="hero-title" className="shop-hero__title">Network<br />your fleet.</h2>
          <p className="shop-hero__lead">A single comprehensive solution that makes equipment management as easy as possible.</p>
          <div className="shop-row">
            <Button size="md" variant="brand" onClick={() => browse()}>Browse products</Button>
            <Button size="md" variant="secondary" className="shop-hero__secondary" onClick={() => setQuick(true)}>Order by SKU</Button>
          </div>
          <p className="shop-hero__note"><Icon name="info-circle" size={16} />No online payment is required — Syniotec reviews the order and issues the invoice separately.</p>
        </div>
        <div className="shop-hero__art" aria-hidden>
          {heroImage ? <img className="shop-hero__image" src={HERO_IMAGE} alt="" onError={() => setHeroImage(false)} /> : <>
            <Signal />
            <ProductArt src={hardwareImages.core} type="hardware" alt="" size="hero" className="shop-hero__device shop-hero__device--main" />
            <ProductArt src={hardwareImages.link} type="hardware" alt="" size="hero" className="shop-hero__device shop-hero__device--side" />
          </>}
        </div>
      </section>

      <OrderAgain />

      <div className="shop-categories">
        <button type="button" className="shop-category" onClick={() => browse('Hardware')}>
          <span className="shop-category__copy">
            <span className="shop-eyebrow">Active telematics</span>
            <span className="shop-category__title">Hardware</span>
            <span className="shop-category__text">Connected devices for machines, vehicles, trailers and powered or unpowered equipment.</span>
            <span className="shop-category__link">Browse hardware<Icon name="arrow" size={16} /></span>
          </span>
          <span className="shop-category__art shop-category__art--hardware" aria-hidden>
            <ProductArt src={hardwareImages.edge} type="hardware" alt="" size="hero" />
            <ProductArt src={hardwareImages.dot} type="dot" alt="" size="hero" />
            <ProductArt src={hardwareImages.link} type="hardware" alt="" size="hero" />
          </span>
        </button>
        <button type="button" className="shop-category" onClick={() => browse('Tags')}>
          <span className="shop-category__copy">
            <span className="shop-eyebrow">Passive telematics</span>
            <span className="shop-category__title">Tags</span>
            <span className="shop-category__text">TAG L, TAG M, TAG S, TOOL-TAGS, CHAIN-TAG and QR-Sticker for direct equipment-profile access.</span>
            <span className="shop-category__link">Browse tags<Icon name="arrow" size={16} /></span>
          </span>
          <span className="shop-category__art" aria-hidden>
            <ProductArt src={tagCollage} type="tags" alt="" size="hero" />
          </span>
        </button>
      </div>

      <section className="shop-benefits" aria-label="Benefits">
        <ul>
          {benefits.map(([icon, title, text], i) => (
            <li key={title}>
              <span className={cx('shop-benefits__icon', i === 0 && 'is-brand')}><Icon name={icon} size={48} /></span>
              <span>
                <strong>{title}</strong>
                <span>{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section ref={catalogue} className="shop-catalogue" aria-labelledby="catalogue-title">
        <div className="shop-catalogue__head">
          <h2 id="catalogue-title" className="shop-display">Hardware for every application</h2>
          <p className="shop-muted">Browse Syniotec hardware and passive tags available to order.</p>
        </div>

        <div className="shop-toolbar">
          <TextField
            className="shop-toolbar__search"
            label="Search by name, SKU or connectivity"
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
          <span className="shop-muted" aria-live="polite">{plural(list.length, 'product')}</span>
        </div>

        {!list.length && (
          <EmptyState icon="search" action={<Button size="sm" variant="secondary" onClick={clear}>Clear filters</Button>}>
            No products found. Try a different search or category.
          </EmptyState>
        )}

        {bento ? (
          <>
            {hardware.length > 0 && <div className="shop-bento">{tiles(hardware, hardwareRhythm)}</div>}
            {tags.length > 0 && (
              <>
                <div className="shop-subhead">
                  <h3 className="shop-subhead__title">Passive telematics</h3>
                  <p className="shop-muted">Tags with QR code and NFC give direct access to the equipment profile, no power supply needed.</p>
                </div>
                <div className="shop-bento">{tiles(tags, tags.map(() => 'md' as TileSize))}</div>
              </>
            )}
          </>
        ) : list.length > 0 && <div className="shop-bento">{tiles(list)}</div>}
      </section>

      <aside className="shop-context">
        <div>
          <strong>Strengthening the construction industry with IoT solutions</strong>
          <p className="shop-muted">Syniotec combines manufacturer-independent telematics with software designed for construction. Product imagery uses the current Syniotec hardware and passive-tag assets.</p>
        </div>
        <ul className="shop-context__points">
          <li>Platform integration</li>
          <li>Equipment tracking</li>
          <li>Digital equipment profiles</li>
        </ul>
      </aside>

      <QuickOrder open={quick} onClose={() => setQuick(false)} />
      <PriceRequestDialog key={requesting?.id ?? 'none'} product={requesting} onClose={() => setRequesting(null)} />
    </>
  );
}
