import { useMemo, useState } from 'react';
import { Button, Drawer, Icon, TextArea } from '../../src';
import { cx } from '../../src/utils';
import { canOrder, money, plural, type Product } from './data';
import { useShop } from './store';

interface Parsed {
  line: string;
  product?: Product;
  qty: number;
  problem?: string;
}

const normalise = (v: string) => v.toUpperCase().replace(/[\s_]+/g, '-');

/** One product per line: a SKU or name, then a quantity ("DOT 10", "TAG-S, 15", "QR-Sticker x40"). */
export function parseQuickOrder(text: string, products: Product[]): Parsed[] {
  return text.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
    const m = line.match(/^(.*?)[\s,;:x×*]*(\d+)\s*(?:pcs|pc|st)?\.?$/i);
    const key = normalise((m ? m[1] : line).replace(/[,;:]+$/, '').trim());
    const qty = m ? Math.min(999, Number(m[2])) : 1;
    const product = products.find((p) => p.active && (normalise(p.id) === key || normalise(p.name) === key));
    if (!product) return { line, qty, problem: 'Unknown SKU' };
    if (!canOrder(product)) return { line, product, qty, problem: product.price > 0 ? 'Unavailable' : 'Price on request' };
    if (!qty) return { line, product, qty, problem: 'Quantity is 0' };
    return { line, product, qty };
  });
}

/** Quick order: buyers who know the SKUs paste a list instead of browsing. */
export function QuickOrder({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products, addLines, notify, setCartOpen } = useShop();
  const [text, setText] = useState('');
  const rows = useMemo(() => parseQuickOrder(text, products), [text, products]);
  const ok = rows.filter((r) => !r.problem);
  const total = ok.reduce((n, r) => n + r.qty * (r.product?.price ?? 0), 0);

  const add = () => {
    const added = addLines(ok.map((r) => ({ product: r.product!, qty: r.qty })));
    notify(`${plural(added, 'product')} added to your cart`, rows.length > ok.length ? `${plural(rows.length - ok.length, 'line')} could not be added; check them in Quick order.` : 'You can change quantities in the cart.', rows.length > ok.length ? 'warning' : 'success');
    setText(rows.filter((r) => r.problem).map((r) => r.line).join('\n'));
    onClose();
    setCartOpen(true);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      label="Quick order"
      width={560}
      headerStart={<span className="shop-drawer-title">Quick order<span className="shop-muted">Know the SKUs? Paste them here.</span></span>}
      footer={<>
        <Button variant="text" onClick={onClose}>Cancel</Button>
        <Button size="md" disabled={!ok.length} onClick={add}>{ok.length ? `Add ${plural(ok.length, 'product')} to cart` : 'Add to cart'}</Button>
      </>}
    >
      <div className="shop-drawer-body">
        <TextArea
          label="Products and quantities"
          hideLabel={false}
          hint="One product per line: SKU or name, then the quantity. You can paste a column from Excel."
          placeholder={'DOT 10\nTAG-S 15\nQR-Sticker 40'}
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {rows.length > 0 && (
          <ul className="shop-quick" aria-label="Recognised lines">
            {rows.map((r, i) => (
              <li key={`${r.line}-${i}`} className={cx(r.problem && 'is-problem')}>
                <Icon name={r.problem ? 'warning' : 'check'} size={16} />
                <span className="shop-cell">
                  <strong>{r.product ? r.product.name : r.line}</strong>
                  <span>{r.problem ? `${r.problem}${r.product ? '' : ` · “${r.line}”`}` : `${r.qty} × ${money(r.product!.price)}`}</span>
                </span>
                {!r.problem && <strong>{money(r.qty * r.product!.price)}</strong>}
              </li>
            ))}
          </ul>
        )}
        {ok.length > 0 && <p className="shop-quick__total"><span>Subtotal excl. VAT</span><strong>{money(total)}</strong></p>}
      </div>
    </Drawer>
  );
}
