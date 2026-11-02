import { useRef, useState } from 'react';
import { Button, Dialog, Drawer, Grid, GridItem, IconButton, Section, Select, StatusBadge, Switch, TextArea, TextField } from '../../../src';
import { AVAILABILITIES, type ArtType, type Availability, type Category, type Product } from '../data';
import { DrawerContext, DrawerTitle, ProductArt } from '../parts';
import { useShop } from '../store';
import { t } from '../i18n';

const artOptions: Array<{ value: ArtType; label: string }> = [
  { value: 'hardware', label: 'Hardware / telematics device' },
  { value: 'dot', label: 'DOT / round beacon' },
  { value: 'tags', label: 'TAGS / plate' },
  { value: 'tool', label: 'TOOL-TAGS' },
  { value: 'chain', label: 'CHAIN-TAG' },
  { value: 'qr', label: 'QR-Sticker' },
];

const blank: Product = {
  id: '', name: '', category: 'Tags', type: 'tags', price: 0, active: true, availability: 'Available',
  short: '', description: '', features: [], specs: [], docs: [], image: '', gallery: [], connectivity: [],
};

const lines = (text: string) => text.split('\n').map((x) => x.trim()).filter(Boolean);

/** Add or edit a product in a Syn drawer: general data, price and availability, media, specifications and documents. */
export function ProductEditor({ open, productId, onClose }: { open: boolean; productId: string | null; onClose: () => void }) {
  const { products, setProducts, setCart, notify } = useShop();
  const existing = productId ? products.find((p) => p.id === productId) : undefined;
  const start = existing ?? blank;

  const [form, setForm] = useState({
    ...start, price: start.price ? String(start.price) : '',
    features: start.features.join('\n'), docs: start.docs.join('\n'),
  });
  const [specs, setSpecs] = useState(() => (start.specs.length ? start.specs : [['', '']]).map(([label, value], i) => ({ key: i, label, value })));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm({ ...form, [key]: value });
    if (errors[key as string]) setErrors({ ...errors, [key]: '' });
  };

  const pickImage = (f?: File) => {
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      notify(t("Image is larger than 2 MB"), t("Choose a smaller PNG, JPG or WebP file."), 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set('image', String(reader.result));
    reader.readAsDataURL(f);
  };

  const save = () => {
    const id = form.id.trim().toUpperCase().replace(/\s+/g, '-');
    const found: Record<string, string> = {};
    if (!form.name.trim()) found.name = 'Enter a product name';
    if (!id) found.id = 'Enter a SKU';
    else if (!existing && products.some((p) => p.id === id)) found.id = 'A product with this SKU already exists';
    if (!form.short.trim()) found.short = 'Enter a short description';
    setErrors(found);
    if (Object.keys(found).length) return;

    const next: Product = {
      ...start,
      id, name: form.name.trim(), category: form.category, type: form.type,
      price: Math.max(0, Number(form.price) || 0), availability: form.availability, active: form.active,
      short: form.short.trim(), description: form.description.trim(),
      features: lines(form.features), docs: lines(form.docs), image: form.image,
      specs: specs.map((s): [string, string] => [s.label.trim(), s.value.trim()]).filter(([l, v]) => l && v),
    };
    setProducts(existing ? products.map((p) => (p.id === existing.id ? next : p)) : [next, ...products]);
    notify(t("{0} saved", [next.name]), next.active ? t("Customers see the changes in the Shop now.") : t("The product is inactive, so customers don’t see it."));
    onClose();
  };

  const remove = () => {
    if (!existing) return;
    setProducts(products.filter((p) => p.id !== existing.id));
    setCart((list) => list.filter((l) => l.productId !== existing.id));
    notify(t("{0} deleted", [existing.name]), t("It is no longer in the catalogue or in any cart."));
    setConfirmDelete(false);
    onClose();
  };

  return (
    <Drawer
      closeLabel={t('Close')}
      open={open}
      onClose={onClose}
      label={existing ? t("Edit {0}", [existing.name]) : t("Add product")}
      width={880}
      headerStart={existing
        ? <><StatusBadge tone={existing.active ? 'success' : 'neutral'}>{existing.active ? t("Active") : t("Inactive")}</StatusBadge><DrawerContext icon="tag">{existing.id}</DrawerContext></>
        : <DrawerContext icon="plus">{t("New product")}</DrawerContext>}
      footer={<>
        {existing ? <Button variant="text" iconStart="trash" onClick={() => setConfirmDelete(true)}>{t("Delete")}</Button> : <span />}
        <span className="shop-drawer-actions">
          <Button variant="text" onClick={onClose}>{t("Cancel")}</Button>
          <Button size="md" onClick={save}>{t("Save product")}</Button>
        </span>
      </>}
    >
      <DrawerTitle
        title={existing ? t("Edit {0}", [existing.name]) : t("Add product")}
        lead={existing ? t("Changes are visible in the Shop as soon as you save.") : t("Fill in the general data, price and availability. Customers see the product once it is active.")}
      />
      <div className="shop-drawer-body">
        <Section title={t("General")}>
          <Grid gap={16}>
            <GridItem span={6}><TextField label={t("Product name *")} size="md" value={form.name} error={errors.name} onChange={(e) => set('name', e.target.value)} /></GridItem>
            <GridItem span={6}><TextField label={t("SKU / Product code *")} size="md" value={form.id} error={errors.id} readOnly={!!existing} hint={existing ? t("The SKU cannot be changed") : undefined} onChange={(e) => set('id', e.target.value)} /></GridItem>
            <GridItem span={6}>
              <Select label={t("Category *")} hideLabel={false} size="md" value={form.category} onChange={(v) => set('category', v as Category)} options={[{ value: 'Hardware', label: t("Hardware") }, { value: 'Tags', label: t("Tags") }]} />
            </GridItem>
            <GridItem span={6}>
              <Select label={t("Default illustration")} hideLabel={false} size="md" value={form.type} onChange={(v) => set('type', v as ArtType)} options={artOptions.map((o) => ({ ...o, label: t(o.label) }))} />
            </GridItem>
            <GridItem span={12}><TextField label={t("Short description *")} size="md" value={form.short} error={errors.short} onChange={(e) => set('short', e.target.value)} /></GridItem>
            <GridItem span={12}><TextArea label={t("Description")} hideLabel={false} labelPosition="outside" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} /></GridItem>
            <GridItem span={12}><TextArea label={t("Key benefits / feature lines")} hideLabel={false} labelPosition="outside" hint={t("One per line")} rows={3} value={form.features} onChange={(e) => set('features', e.target.value)} /></GridItem>
          </Grid>
        </Section>

        <Section title={t("Price & availability")}>
          <Grid gap={16}>
            <GridItem span={6}>
              <TextField label={t("General price (excl. VAT)")} size="md" type="number" min={0} step="0.01" suffix="EUR" hint={t("Leave empty for “Price on request”")} value={form.price} onChange={(e) => set('price', e.target.value)} />
            </GridItem>
            <GridItem span={6}>
              <Select label={t("Availability")} hideLabel={false} size="md" value={form.availability} onChange={(v) => set('availability', v as Availability)} options={AVAILABILITIES.map((a) => ({ value: a, label: t(a) }))} />
            </GridItem>
            <GridItem span={12}>
              <Switch label={t("Active in the Shop")} hideLabel={false} checked={form.active} onChange={(e) => set('active', e.target.checked)} />
            </GridItem>
          </Grid>
        </Section>

        <Section title={t("Media")}>
          <div className="shop-upload">
            <ProductArt src={form.image} type={form.type} alt="Product image preview" size="sm" />
            <div className="shop-stack">
              <strong className="shop-card-title">{t("Main product image")}</strong>
              <p className="shop-muted">{t("PNG, JPG or WebP up to 2 MB. Without an image the built-in illustration is used.")}</p>
              <input ref={file} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => pickImage(e.target.files?.[0])} />
              <div className="shop-row">
                <Button size="sm" variant="secondary" iconStart="cloud-upload" onClick={() => file.current?.click()}>{t("Upload image")}</Button>
                {form.image && <Button size="sm" variant="text" onClick={() => set('image', '')}>{t("Use default illustration")}</Button>}
              </div>
            </div>
          </div>
        </Section>

        <Section title={t("Technical specifications")} actions={<Button size="xs" variant="secondary" iconStart="plus" onClick={() => setSpecs([...specs, { key: Date.now(), label: '', value: '' }])}>{t("Add specification")}</Button>}>
          {specs.map((s, i) => (
            <div key={s.key} className="shop-spec-row">
              <TextField label={t("Specification {0} label", [i + 1])} placeholder={t("Label")} hideLabel size="sm" value={s.label} onChange={(e) => setSpecs(specs.map((x) => (x.key === s.key ? { ...x, label: e.target.value } : x)))} />
              <TextField label={t("Specification {0} value", [i + 1])} placeholder={t("Value")} hideLabel size="sm" value={s.value} onChange={(e) => setSpecs(specs.map((x) => (x.key === s.key ? { ...x, value: e.target.value } : x)))} />
              <IconButton icon="trash" label={t("Remove specification {0}", [i + 1])} size="sm" variant="outline" onClick={() => setSpecs(specs.filter((x) => x.key !== s.key))} />
            </div>
          ))}
        </Section>

        <Section title={t("Documents")}>
          <TextArea label={t("Document names")} hideLabel={false} labelPosition="outside" hint={t("One per line")} rows={3} value={form.docs} onChange={(e) => set('docs', e.target.value)} />
        </Section>
      </div>

      <Dialog
        closeLabel={t('Close')}
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t("Delete {0}?", [existing?.name ?? 'product'])}
        icon="trash"
        description={t("Customers can no longer order it and it is removed from their carts. Orders already sent keep it. This can’t be undone; to hide it for now, switch off “Active in the Shop” instead.")}
        actions={<Button size="md" variant="brand" fullWidth onClick={remove}>{t("Delete")} {existing?.name ?? t("product")}</Button>}
      />
    </Drawer>
  );
}
