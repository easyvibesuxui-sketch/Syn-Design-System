import { useState } from 'react';
import { Button, Dialog, TextArea } from '../../src';
import type { Product } from './data';
import { QuantityStepper } from './parts';
import { useShop } from './store';
import { t } from './i18n';

/** "Price on request" products get a real next step instead of a disabled button. */
export function PriceRequestDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { requestPrice } = useShop();
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  return (
    <Dialog
      closeLabel={t('Close')}
      open={!!product}
      onClose={onClose}
      title={product ? t("Request a price for {0}", [product.name]) : t("Request a price")}
      icon={null}
      description={t("Syniotec replies by email with a price for your quantity. Nothing is ordered yet.")}
      actions={<Button size="md" fullWidth onClick={() => { if (product) requestPrice(product, qty, note.trim()); onClose(); }}>{t("Send price request")}</Button>}
    >
      {product && (
        <div className="shop-stack shop-price-request">
          <div className="shop-row shop-row--between">
            <span className="shop-field-label">{t("Quantity")}</span>
            <QuantityStepper label={product.name} value={qty} onChange={setQty} />
          </div>
          <TextArea label={t("Note for Syniotec")} hideLabel={false} labelPosition="outside" hint={t("Optional, e.g. delivery date or site")} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      )}
    </Dialog>
  );
}
