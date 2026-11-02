import { useState } from 'react';
import { Button, Dialog, TextArea } from '../../src';
import type { Product } from './data';
import { QuantityStepper } from './parts';
import { useShop } from './store';

/** "Price on request" products get a real next step instead of a disabled button. */
export function PriceRequestDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { requestPrice } = useShop();
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  return (
    <Dialog
      open={!!product}
      onClose={onClose}
      title={product ? `Request a price for ${product.name}` : 'Request a price'}
      icon={null}
      description="Syniotec replies by email with a price for your quantity. Nothing is ordered yet."
      actions={<Button size="md" fullWidth onClick={() => { if (product) requestPrice(product, qty, note.trim()); onClose(); }}>Send price request</Button>}
    >
      {product && (
        <div className="shop-stack shop-price-request">
          <div className="shop-row shop-row--between">
            <span className="shop-card-title">Quantity</span>
            <QuantityStepper label={product.name} value={qty} onChange={setQty} />
          </div>
          <TextArea label="Note for Syniotec" hideLabel={false} hint="Optional, e.g. delivery date or site" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      )}
    </Dialog>
  );
}
