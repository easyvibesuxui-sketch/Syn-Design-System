import { useState } from 'react';
import { Button, Card, FileItem, Icon, Section, Tag } from '../../../src';
import { cx } from '../../../src/utils';
import { canOrder, hasPrice, money, priceLabel } from '../data';
import { PriceRequestDialog } from '../PriceRequest';
import { AvailabilityBadge, BackLink, Chips, InfoNote, ProductArt, QuantityStepper, ShopHeader, SpecList } from '../parts';
import { routeHref, useShop } from '../store';

export function ProductPage({ id }: { id: string }) {
  const { products, addToCart, notify, cart } = useShop();
  const [requesting, setRequesting] = useState(false);
  const p = products.find((x) => x.id === id && x.active);
  const [qty, setQty] = useState(1);
  const [shown, setShown] = useState(0);

  if (!p) {
    return (
      <>
        <ShopHeader title="Product not found" lead="This product is no longer in the catalogue. It may have been renamed or removed." />
        <BackLink href={routeHref({ name: 'shop' })}>Back to products</BackLink>
      </>
    );
  }

  const gallery = [...new Set([p.image, ...p.gallery].filter(Boolean))];
  const unavailable = p.availability === 'Temporarily unavailable';
  const inCart = cart.find((l) => l.productId === p.id)?.qty ?? 0;

  return (
    <>
      <ShopHeader title="Product details" lead="Review product information, specifications and ordering options." />
      <BackLink href={routeHref({ name: 'shop' })}>Back to products</BackLink>

      <div className="shop-detail">
        <div className="shop-detail__main">
          <Card className="shop-gallery">
            {p.badge && <span className="shop-gallery__badge"><Tag color="var(--syn-action-brand)">{p.badge}</Tag></span>}
            <ProductArt src={gallery[shown]} type={p.type} alt={`${p.name}, image ${shown + 1} of ${Math.max(gallery.length, 1)}`} size="lg" />
            {gallery.length > 1 && (
              <div className="shop-gallery__thumbs" role="group" aria-label="Product images">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    className={cx('shop-gallery__thumb', i === shown && 'is-active')}
                    aria-label={`Show image ${i + 1}`}
                    aria-pressed={i === shown}
                    onClick={() => setShown(i)}
                  >
                    <ProductArt src={src} type={p.type} alt="" size="xs" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          <div className="shop-detail__panels">
            <Section title="Overview">
              <p className="shop-text">{p.description}</p>
              <ul className="shop-features">
                {p.features.map((f) => <li key={f}><Icon name="check" size={16} />{f}</li>)}
              </ul>
            </Section>
            <Section title="Technical specifications">
              <SpecList rows={p.specs} empty="No technical specifications have been added yet." />
            </Section>
            <Section title="Resources & documents" className="shop-detail__wide">
              {p.docs.length
                ? (
                  <ul className="shop-docs">
                    {p.docs.map((d) => (
                      <li key={d}>
                        <FileItem name={d} meta="PDF" />
                        <Button size="sm" variant="secondary" iconStart="download" onClick={() => notify('No file in this demo', `In the live Shop, “${d}” downloads as a PDF.`, 'info')}>Download</Button>
                      </li>
                    ))}
                  </ul>
                )
                : <p className="shop-muted">No documents for this product yet. Ask Syniotec if you need a data sheet.</p>}
            </Section>
          </div>
        </div>

        <Card className="shop-buy">
          <p className="shop-sku">{p.category === 'Hardware' ? 'Hardware' : 'Passive telematics'} · {p.id}</p>
          <h2 className="shop-buy__name">{p.name}</h2>
          <p className="shop-text">{p.short}</p>
          <Chips items={p.connectivity ?? []} />
          <AvailabilityBadge availability={p.availability} />
          <div>
            <p className="shop-buy__price">{priceLabel(p)}</p>
            <p className="shop-tax">{hasPrice(p) ? 'Per item, excl. VAT' : 'Syniotec quotes a price for your quantity'}</p>
          </div>
          {unavailable ? (
            <Button size="md" fullWidth disabled>Temporarily unavailable</Button>
          ) : canOrder(p) ? (<>
            <span className="shop-card-title">Quantity</span>
            <div className="shop-buy__row">
              <QuantityStepper label={p.name} value={qty} onChange={setQty} />
              <Button size="md" fullWidth iconStart="plus" onClick={() => addToCart(p, qty)}>
                Add {qty > 1 ? `${qty} ` : ''}to cart{qty > 1 ? ` · ${money(qty * p.price)}` : ''}
              </Button>
            </div>
          </>) : (
            <Button size="md" fullWidth variant="secondary" iconStart="mail" onClick={() => setRequesting(true)}>Request a price</Button>
          )}
          {inCart > 0 && <p className="shop-in-cart"><Icon name="check" size={16} />{inCart} already in your cart</p>}
          <InfoNote>Ordering doesn’t add devices to your equipment yet. They appear in the platform once they are installed and commissioned.</InfoNote>
        </Card>
        {requesting && <PriceRequestDialog product={p} onClose={() => setRequesting(false)} />}
      </div>
    </>
  );
}
