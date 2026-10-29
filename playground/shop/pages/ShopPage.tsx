import { useMemo, useRef, useState } from 'react';
import { Button, Card, EmptyState, Icon, Segmented, Select, Tag, TextField, type IconName } from '../../../src';
import { canOrder, hardwareImages, hasPrice, plural, priceLabel, tagCollage, type Product } from '../data';
import { AvailabilityBadge, InfoNote, LinkButton, ProductArt, ShopHeader } from '../parts';
import { routeHref, useShop } from '../store';

type Filter = 'All' | 'Hardware' | 'Tags';
type Sort = 'featured' | 'name' | 'price-asc' | 'price-desc';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

const benefits: Array<[IconName, string, string]> = [
  ['dublecheck', 'Platform integration', 'Syniotec hardware is designed to work directly with your connected platform.'],
  ['inventory', 'Hardware for every application', 'From Bluetooth beacons to passive telematics for equipment access.'],
  ['settings', 'Quick & easy installation', 'Devices appear in the platform only after installation and commissioning.'],
];

function sortProducts(list: Product[], sort: Sort) {
  const price = (p: Product, empty: number) => (hasPrice(p) ? p.price : empty);
  if (sort === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'price-asc') return [...list].sort((a, b) => price(a, Infinity) - price(b, Infinity));
  if (sort === 'price-desc') return [...list].sort((a, b) => price(b, -Infinity) - price(a, -Infinity));
  return list;
}

function ProductCard({ product: p }: { product: Product }) {
  const { addToCart } = useShop();
  const href = routeHref({ name: 'product', id: p.id });
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
            {hasPrice(p) && <span className="shop-tax">excl. VAT</span>}
          </div>
          <div className="shop-product__actions">
            <LinkButton href={href}>Details</LinkButton>
            <Button size="sm" disabled={!canOrder(p)} iconStart={canOrder(p) ? 'plus' : undefined} onClick={() => addToCart(p)}>
              {unavailable ? 'Unavailable' : hasPrice(p) ? 'Add to cart' : 'On request'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ShopPage() {
  const { products } = useShop();
  const [filter, setFilter] = useState<Filter>('All');
  const [sort, setSort] = useState<Sort>('featured');
  const [search, setSearch] = useState('');
  const catalogue = useRef<HTMLElement>(null);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    const shown = products.filter((p) => p.active
      && (filter === 'All' || p.category === filter)
      && (!q || [p.name, p.id, p.short, p.description, p.category].some((v) => v.toLowerCase().includes(q))));
    return sortProducts(shown, sort);
  }, [products, filter, sort, search]);

  const browse = (f?: Filter) => {
    if (f) setFilter(f);
    catalogue.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const clear = () => { setSearch(''); setFilter('All'); setSort('featured'); };

  return (
    <>
      <ShopHeader title="Shop" lead="Order Syniotec hardware and passive tags directly from your platform." />

      <section className="shop-hero" aria-labelledby="hero-title">
        <div className="shop-hero__copy">
          <p className="shop-eyebrow shop-eyebrow--brand">Syniotec telematics & hardware</p>
          <h2 id="hero-title" className="shop-hero__title">Network your fleet.</h2>
          <p className="shop-hero__lead">A single comprehensive solution that makes equipment management as easy as possible.</p>
          <div><Button size="md" iconEnd="arrow" onClick={() => browse()}>Browse products</Button></div>
          <InfoNote>No online payment is required — Syniotec reviews the order and issues the invoice separately.</InfoNote>
        </div>
        <div className="shop-hero__art" aria-hidden>
          <ProductArt src={hardwareImages.edge} type="hardware" alt="" size="lg" />
          <ProductArt src={hardwareImages.link} type="hardware" alt="" size="sm" />
          <ProductArt src={hardwareImages.dot} type="dot" alt="" size="sm" />
        </div>
      </section>

      <div className="shop-categories">
        <button type="button" className="shop-category" onClick={() => browse('Hardware')}>
          <span className="shop-category__copy">
            <span className="shop-eyebrow">Active telematics</span>
            <span className="shop-category__title">Hardware</span>
            <span className="shop-category__text">Connected devices for machines, vehicles, trailers and powered or unpowered equipment.</span>
            <span className="shop-category__link">Browse hardware<Icon name="arrow" size={16} /></span>
          </span>
          <span className="shop-category__art" aria-hidden>
            <ProductArt src={hardwareImages.edge} type="hardware" alt="" size="sm" />
            <ProductArt src={hardwareImages.dot} type="dot" alt="" size="sm" />
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
            <ProductArt src={tagCollage} type="tags" alt="" size="md" />
          </span>
        </button>
      </div>

      <ul className="shop-benefits">
        {benefits.map(([icon, title, text]) => (
          <li key={title}>
            <span className="shop-benefits__icon"><Icon name={icon} size={20} /></span>
            <span><strong>{title}</strong><span>{text}</span></span>
          </li>
        ))}
      </ul>

      <section ref={catalogue} className="shop-catalogue" aria-labelledby="catalogue-title">
        <div className="shop-section-head">
          <div>
            <h2 id="catalogue-title" className="shop-section-head__title">Hardware for every application</h2>
            <p className="shop-muted">Browse Syniotec hardware and passive tags available to order.</p>
          </div>
          <span className="shop-muted" aria-live="polite">{plural(list.length, 'product')}</span>
        </div>

        <div className="shop-toolbar">
          <TextField
            className="shop-toolbar__search"
            label="Search products"
            hideLabel
            size="sm"
            iconStart="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
          <Segmented
            label="Product category"
            options={[{ value: 'All', label: 'All' }, { value: 'Hardware', label: 'Hardware' }, { value: 'Tags', label: 'Tags' }]}
            value={filter}
            onChange={(v) => setFilter(v as Filter)}
          />
          <Select className="shop-toolbar__sort" label="Sort products" size="sm" options={sortOptions} value={sort} onChange={(v) => setSort(v as Sort)} />
        </div>

        {list.length
          ? <div className="shop-grid">{list.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          : <EmptyState icon="search" action={<Button size="sm" variant="secondary" onClick={clear}>Clear filters</Button>}>No products found. Try a different search or category.</EmptyState>}
      </section>

      <aside className="shop-context">
        <div>
          <strong>Strengthening the construction industry with IoT solutions</strong>
          <p className="shop-muted">Syniotec combines manufacturer-independent telematics with software designed for construction.</p>
        </div>
        <div className="shop-context__tags">
          <Tag variant="soft">Platform integration</Tag>
          <Tag variant="soft">Equipment tracking</Tag>
          <Tag variant="soft">Digital equipment profiles</Tag>
        </div>
      </aside>
    </>
  );
}
