import { Button, Card, Icon } from '../../../src';
import { money, plural } from '../data';
import { routeHref, useShop } from '../store';
import { BackLink, LinkButton } from '../parts';

export function ConfirmationPage({ id }: { id: string }) {
  const { orders, go } = useShop();
  const o = orders.find((x) => x.id === id);
  if (!o) {
    return (
      <Card className="shop-confirmation">
        <h1 className="shop-confirmation__title">Order not found</h1>
        <p className="shop-text">We couldn’t find order {id}. Your sent orders are listed in My orders.</p>
        <BackLink href={routeHref({ name: 'orders' })}>Go to My orders</BackLink>
      </Card>
    );
  }
  const count = o.items.reduce((n, i) => n + i.qty, 0);
  const steps: Array<[string, string]> = [
    ['Sent', `${o.date} · ${o.time}`],
    ['Syniotec confirms', `Prices, stock and delivery costs. The confirmation goes to ${o.email}.`],
    ['Delivery and invoice', 'You pay by invoice; nothing has been charged.'],
  ];
  return (
    <Card className="shop-confirmation">
      <span className="shop-confirmation__mark"><Icon name="check" size={32} /></span>
      <h1 className="shop-confirmation__title">Order sent to Syniotec</h1>
      <p className="shop-text">{plural(count, 'item')} · {money(o.total)} excl. VAT. Syniotec reviews every order and confirms it by email, usually with the delivery date.</p>
      <span className="shop-order-id">{o.id}</span>
      <ol className="shop-timeline shop-confirmation__steps">
        {steps.map(([title, text], i) => <li key={title} className={i === 0 ? 'is-done' : undefined}><strong>{title}</strong><span>{text}</span></li>)}
      </ol>
      <div className="shop-confirmation__actions">
        <LinkButton href={routeHref({ name: 'shop' })}>Back to Shop</LinkButton>
        <Button size="sm" onClick={() => go({ name: 'orders', id: o.id })}>Track this order</Button>
      </div>
    </Card>
  );
}
