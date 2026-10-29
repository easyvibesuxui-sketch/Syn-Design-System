import { useState } from 'react';
import { Button, Card, FileItem, Icon, Section } from '../../../src';
import { cx } from '../../../src/utils';
import { canOrder, hasPrice, priceLabel } from '../data';
import { AvailabilityBadge, BackLink, InfoNote, ProductArt, QuantityStepper, ShopHeader, SpecList } from '../parts';
import { routeHref, useShop } from '../store';

export function ProductPage({ id }: { id: string }) {
  const { products, addToCart, notify } = useShop();
  const p = products.find((x) => x.id === id && x.active);
  const [qty, setQty] = useState(1);
  const [shown, setShown] = useState(0);

  if (!p) {
    return (
      <>
        <ShopHeader title="Product details" lead="This product is not in the catalogue." />
        <BackLink href={routeHref({ name: 'shop' })}>Back to products</BackLink>
      </>
    );
  }

  const gallery = [...new Set([p.image, ...p.gallery].filter(Boolean))];
  const unavailable = p.availability === 'Temporarily unavailable';

  return (
    <>
      <ShopHeader title="Product details" lead="Review product information, specifications and ordering options." />
      <BackLink href={routeHref({ name: 'shop' })}>Back to products</BackLink>

      <div className="shop-detail">
        <div className="shop-detail__main">
          <Card className="shop-gallery">
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
                        <Button size="sm" variant="secondary" iconStart="download" onClick={() => notify('Prototype', 'Document download is shown in the UI, but no file is attached to this demo.', 'info')}>Download</Button>
                      </li>
                    ))}
                  </ul>
                )
                : <p className="shop-muted">No documents have been added for this product.</p>}
            </Section>
          </div>
        </div>

        <Card className="shop-buy">
          <p className="shop-sku">{p.category === 'Hardware' ? 'Hardware' : 'Passive telematics'} · {p.id}</p>
          <h2 className="shop-buy__name">{p.name}</h2>
          <p className="shop-text">{p.short}</p>
          <AvailabilityBadge availability={p.availability} />
          <div>
            <p className="shop-buy__price">{priceLabel(p)}</p>
            {hasPrice(p) && <p className="shop-tax">Price excl. VAT</p>}
          </div>
          <div className="shop-buy__row">
            <QuantityStepper label={p.name} value={qty} onChange={setQty} />
            <Button size="sm" fullWidth disabled={!canOrder(p)} iconStart={canOrder(p) ? 'plus' : undefined} onClick={() => addToCart(p, qty)}>
              {unavailable ? 'Temporarily unavailable' : hasPrice(p) ? 'Add to cart' : 'Price on request'}
            </Button>
          </div>
          <InfoNote>Submitting an order does not automatically add devices to equipment. Hardware appears in the platform only after installation and commissioning.</InfoNote>
        </Card>
      </div>
    </>
  );
}
