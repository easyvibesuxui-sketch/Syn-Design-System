import { Button, Card, Icon } from '../../../src';
import { money, plural } from '../data';
import { routeHref, useShop } from '../store';
import { BackLink, LinkButton } from '../parts';
import { t } from '../i18n';

export function ConfirmationPage({ id }: { id: string }) {
  const { orders, go } = useShop();
  const o = orders.find((x) => x.id === id);
  if (!o) {
    return (
      <Card className="shop-confirmation">
        <h1 className="shop-confirmation__title">{t("Order not found")}</h1>
        <p className="shop-text">{t("We couldn’t find order")} {id}{t(". Your sent orders are listed in My orders.")}</p>
        <BackLink href={routeHref({ name: 'orders' })}>{t("Go to My orders")}</BackLink>
      </Card>
    );
  }
  const count = o.items.reduce((n, i) => n + i.qty, 0);
  const steps: Array<[string, string]> = [
    ['Submitted', `${o.date} · ${o.time}`],
    ['Syniotec confirms', t('Prices, stock and delivery costs. The confirmation goes to {0}.', [o.email])],
    ['Delivery and invoice', t('You pay by invoice; nothing has been charged.')],
  ];
  return (
    <>
    <BackLink href={routeHref({ name: 'shop' })}>{t("Shop")}</BackLink>
    <Card className="shop-confirmation">
      <span className="shop-confirmation__mark"><Icon name="check" size={32} /></span>
      <h1 className="shop-confirmation__title">{t("Order submitted")}</h1>
      <p className="shop-text">{plural(count, 'item')} · {money(o.total)} {t("excl. VAT. Syniotec reviews every order and confirms it by email, usually with the delivery date.")}</p>
      <span className="shop-order-id">{o.id}</span>
      <ol className="shop-timeline shop-confirmation__steps">
        {steps.map(([title, text], i) => <li key={title} className={i === 0 ? 'is-done' : undefined}><strong>{t(title)}</strong><span>{text}</span></li>)}
      </ol>
      <div className="shop-confirmation__actions">
        <LinkButton href={routeHref({ name: 'shop' })}>{t("Continue shopping")}</LinkButton>
        <Button size="sm" onClick={() => go({ name: 'orders', id: o.id })}>{t("View order")}</Button>
      </div>
    </Card>
    </>
  );
}
