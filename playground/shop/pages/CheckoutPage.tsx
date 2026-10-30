import { useState, type FormEvent } from 'react';
import { Button, Card, Checkbox, Grid, GridItem, Icon, Section, Select, TextArea, TextField } from '../../../src';
import { COUNTRIES, CURRENT_USER, money, plural, stamp, type Order } from '../data';
import { BackLink, ProductArt, ShopHeader, Summary } from '../parts';
import { routeHref, useShop } from '../store';

const initial = {
  name: CURRENT_USER.name, email: 'john.smith@example.com', phone: '+49 421 123456',
  street: 'Bauhofstraße 18', zip: '28195', city: 'Bremen', country: 'Germany',
  billingAddress: '', billingZip: '', billingCity: '', billingCountry: 'Germany',
  reference: '', comment: '',
};
type Form = typeof initial;
type Field = keyof Form;

const required: Field[] = ['name', 'email', 'phone', 'street', 'zip', 'city'];
const billingRequired: Field[] = ['billingAddress', 'billingZip', 'billingCity', 'billingCountry'];

/** Error copy says what to enter, not that something is wrong. */
const missing: Partial<Record<Field, string>> = {
  name: 'Enter who Syniotec should contact about this order',
  email: 'Enter an email address for the order confirmation',
  phone: 'Enter a phone number for delivery questions',
  street: 'Enter the street and house number',
  zip: 'Enter the postal code',
  city: 'Enter the city',
  billingAddress: 'Enter the billing street and house number',
  billingZip: 'Enter the billing postal code',
  billingCity: 'Enter the billing city',
  billingCountry: 'Enter the billing country',
};

function validate(form: Form, billingSame: boolean) {
  const errors: Partial<Record<Field, string>> = {};
  for (const f of [...required, ...(billingSame ? [] : billingRequired)]) {
    if (!form[f].trim()) errors[f] = missing[f];
  }
  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter an email address like name@company.com';
  return errors;
}

const nextSteps = [
  ['Syniotec reviews your order', 'and confirms prices, stock and delivery costs.'],
  ['You get a confirmation by email', 'with the delivery date. The invoice follows separately.'],
  ['Track it in My orders', 'from confirmed to shipped and completed.'],
];

export function CheckoutPage() {
  const { cart, cartQty, cartTotal, orders, setOrders, setCart, setCartOpen, go, notify } = useShop();
  const [form, setForm] = useState(initial);
  const [billingSame, setBillingSame] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  if (!cart.length) {
    return (
      <>
        <ShopHeader title="Your cart is empty" lead="Add products to your cart, then come back here to send the order." />
        <BackLink href={routeHref({ name: 'shop' })}>Back to products</BackLink>
      </>
    );
  }

  const field = (key: Field, label: string, extra?: { type?: string; placeholder?: string; hint?: string }) => (
    <TextField
      label={label}
      size="md"
      value={form[key]}
      error={errors[key]}
      onChange={(e) => {
        setForm({ ...form, [key]: e.target.value });
        if (errors[key]) setErrors({ ...errors, [key]: undefined });
      }}
      {...extra}
    />
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(form, billingSame);
    setErrors(found);
    const count = Object.keys(found).length;
    if (count) {
      notify(`${plural(count, 'field')} still ${count === 1 ? 'needs' : 'need'} your input`, 'Fill in the highlighted fields, then send the order again.', 'error');
      document.querySelector<HTMLInputElement>('.shop-checkout [aria-invalid="true"]')?.focus();
      return;
    }
    const now = stamp();
    const id = `SO-${now.year}-${String(orders.length + 125).padStart(5, '0')}`;
    const order: Order = {
      id, date: now.date, time: now.time, orderedBy: CURRENT_USER.name, contactName: form.name.trim(),
      email: form.email.trim(), phone: form.phone.trim(), org: CURRENT_USER.company,
      items: cart.map((l) => ({ id: l.product.id, name: l.product.name, qty: l.qty, price: l.product.price, type: l.product.type, image: l.product.image })),
      total: cartTotal, status: 'Submitted',
      address: `${form.street.trim()}, ${form.zip.trim()} ${form.city.trim()}, ${form.country}`,
      billing: billingSame ? 'Same as company billing address' : `${form.billingAddress.trim()}, ${form.billingZip.trim()} ${form.billingCity.trim()}, ${form.billingCountry.trim()}`,
      reference: form.reference.trim(), comment: form.comment.trim(), internalNote: '',
      history: [['Submitted', now.both]],
    };
    setOrders([order, ...orders]);
    setCart([]);
    go({ name: 'confirmation', id });
  };

  return (
    <>
      <ShopHeader title="Send order" lead="Check your contact, delivery and billing details. Syniotec reviews every order before it is confirmed." />
      <button type="button" className="shop-back" onClick={() => setCartOpen(true)}><Icon name="back" size={16} />Back to cart</button>

      <form className="shop-checkout" onSubmit={submit} noValidate>
        <div className="shop-checkout__main">
          <Section title="Company & contact">
            <p className="shop-muted">Filled in from your account. Change them if someone else should be contacted.</p>
            <Grid gap={16}>
              <GridItem span={6}><TextField label="Company" size="md" value={CURRENT_USER.company} readOnly hint="From your account" /></GridItem>
              <GridItem span={6}>{field('name', 'Contact person *')}</GridItem>
              <GridItem span={6}>{field('email', 'Email *', { type: 'email' })}</GridItem>
              <GridItem span={6}>{field('phone', 'Phone *', { type: 'tel' })}</GridItem>
            </Grid>
          </Section>

          <Section title="Delivery address">
            <p className="shop-muted">Where the hardware should go. Syniotec confirms delivery costs before shipping.</p>
            <Grid gap={16}>
              <GridItem span={12}>{field('street', 'Street / address *')}</GridItem>
              <GridItem span={6}>{field('zip', 'ZIP / Postal code *')}</GridItem>
              <GridItem span={6}>{field('city', 'City *')}</GridItem>
              <GridItem span={12}>
                <Select label="Country *" hideLabel={false} size="md" value={form.country} onChange={(country) => setForm({ ...form, country })} options={COUNTRIES.map((c) => ({ value: c, label: c }))} />
              </GridItem>
            </Grid>
          </Section>

          <Section title="Billing & reference">
            <p className="shop-muted">You pay by invoice after Syniotec confirms the order. No payment is taken here.</p>
            <Checkbox label="Use company billing address" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} />
            {!billingSame && (
              <Grid gap={16}>
                <GridItem span={12}>{field('billingAddress', 'Billing address *')}</GridItem>
                <GridItem span={6}>{field('billingZip', 'ZIP / Postal code *')}</GridItem>
                <GridItem span={6}>{field('billingCity', 'City *')}</GridItem>
                <GridItem span={12}>{field('billingCountry', 'Country *')}</GridItem>
              </Grid>
            )}
            <Grid gap={16}>
              <GridItem span={12}>{field('reference', 'PO / Reference number (optional)', { placeholder: 'PO / Reference number (optional), e.g. SITE-NORD-042', hint: 'Printed on the invoice so your accounting can match it' })}</GridItem>
              <GridItem span={12}>
                <TextArea label="Comment (optional)" hideLabel={false} hint="For example a contact on site or delivery hours" placeholder="Add delivery or order instructions" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={3} />
              </GridItem>
            </Grid>
          </Section>
        </div>

        <Card className="shop-order-summary" title="Order summary" actions={<Button size="xs" variant="text" onClick={() => setCartOpen(true)}>Edit cart</Button>}>
          <p className="shop-muted">{plural(cartQty, 'item')} in this order</p>
          <ul className="shop-lines">
            {cart.map((l) => (
              <li key={l.productId}>
                <ProductArt src={l.product.image} type={l.product.type} alt="" size="xs" />
                <span><strong>{l.product.name}</strong><span className="shop-muted">{l.qty} × {money(l.product.price)}</span></span>
                <strong>{money(l.qty * l.product.price)}</strong>
              </li>
            ))}
          </ul>
          <Summary total={cartTotal} />
          <Button type="submit" size="md" fullWidth>Send order · {money(cartTotal)}</Button>
          <div className="shop-next">
            <span className="shop-eyebrow">What happens next</span>
            <ol>
              {nextSteps.map(([title, text]) => <li key={title}><strong>{title}</strong> {text}</li>)}
            </ol>
          </div>
        </Card>
      </form>
    </>
  );
}
