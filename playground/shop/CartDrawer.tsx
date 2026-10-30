import { Button, Drawer, EmptyState } from '../../src';
import { money, plural } from './data';
import { InfoNote, ProductArt, QuantityStepper, Summary } from './parts';
import { useShop } from './store';

/** The cart as a narrow Syn drawer: lines with a quantity stepper, the summary and "Continue to order". */
export function CartDrawer() {
  const { cart, cartQty, cartTotal, cartOpen, setCartOpen, setQty, removeFromCart, go, route } = useShop();
  const close = () => setCartOpen(false);
  const to = (name: 'checkout' | 'shop') => {
    close();
    // The checkout page itself opens the cart for "Back to cart"; going there again only closes the drawer.
    if (route.name !== name) go({ name });
  };

  return (
    <Drawer
      open={cartOpen}
      onClose={close}
      label="Your cart"
      width={480}
      closeLabel="Close cart"
      headerStart={<span className="shop-drawer-title">Your cart<span className="shop-muted">{cartQty ? plural(cartQty, 'item') : 'No products added yet'}</span></span>}
      footer={cart.length ? <Button size="md" fullWidth iconEnd="arrow" onClick={() => to('checkout')}>Check out · {money(cartTotal)}</Button> : undefined}
    >
      {cart.length ? (
        <div className="shop-cart">
          <ul className="shop-cart__lines">
            {cart.map((l) => (
              <li key={l.productId} className="shop-cart__line">
                <ProductArt src={l.product.image} type={l.product.type} alt="" size="xs" />
                <div className="shop-cart__main">
                  <strong>{l.product.name}</strong>
                  <span className="shop-muted">{money(l.product.price)} / item</span>
                  <div className="shop-row">
                    <QuantityStepper size="xs" label={l.product.name} value={l.qty} onChange={(q) => setQty(l.productId, q)} />
                    <Button size="xs" variant="text" onClick={() => removeFromCart(l.productId)} aria-label={`Remove ${l.product.name}`}>Remove</Button>
                  </div>
                </div>
                <strong>{money(l.qty * l.product.price)}</strong>
              </li>
            ))}
          </ul>
          <Summary total={cartTotal} />
          <InfoNote>You pay by invoice after Syniotec confirms the order. Delivery costs are confirmed then too.</InfoNote>
        </div>
      ) : (
        <div className="shop-cart">
          <EmptyState icon="inventory" action={<Button size="sm" onClick={() => to('shop')}>Browse products</Button>}>
            Your cart is empty. Browse the catalogue, or use Quick order on the Shop page if you know the SKUs.
          </EmptyState>
        </div>
      )}
    </Drawer>
  );
}
