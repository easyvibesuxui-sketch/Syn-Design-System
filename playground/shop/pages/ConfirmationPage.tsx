import { Button, Card, Icon } from '../../../src';
import { money } from '../data';
import { routeHref, useShop } from '../store';
import { LinkButton } from '../parts';

export function ConfirmationPage({ id }: { id: string }) {
  const { orders, go } = useShop();
  const o = orders.find((x) => x.id === id);
  if (!o) return null;
  return (
    <Card className="shop-confirmation">
      <span className="shop-confirmation__mark"><Icon name="check" size={32} /></span>
      <h1 className="shop-confirmation__title">Order submitted</h1>
      <p className="shop-text">Your order has been sent to Syniotec. It will be reviewed and processed manually, and you will be contacted regarding delivery and invoicing.</p>
      <span className="shop-order-id">{o.id}</span>
      <dl className="shop-summary shop-confirmation__total">
        <div className="shop-summary__total"><dt>Order total</dt><dd>{money(o.total)}</dd></div>
      </dl>
      <p className="shop-tax">excl. VAT</p>
      <div className="shop-confirmation__actions">
        <LinkButton href={routeHref({ name: 'shop' })}>Continue shopping</LinkButton>
        <Button size="sm" onClick={() => go({ name: 'orders', id: o.id })}>View order</Button>
      </div>
    </Card>
  );
}
