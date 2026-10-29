import { useRef, useState } from 'react';
import { Button, Dialog, Drawer, Grid, GridItem, IconButton, Section, Select, Switch, TextArea, TextField } from '../../../src';
import { AVAILABILITIES, type ArtType, type Availability, type Category, type Product } from '../data';
import { ProductArt } from '../parts';
import { useShop } from '../store';

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
  short: '', description: '', features: [], specs: [], docs: [], image: '', gallery: [],
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
      notify('Image too large', 'For this prototype, please use an image smaller than 2 MB.', 'error');
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
    notify('Product saved', `${next.name} is now in the catalogue.`);
    onClose();
  };

  const remove = () => {
    if (!existing) return;
    setProducts(products.filter((p) => p.id !== existing.id));
    setCart((list) => list.filter((l) => l.productId !== existing.id));
    notify('Product deleted', `${existing.id} was removed from the catalogue.`);
    setConfirmDelete(false);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      label={existing ? `Edit ${existing.name}` : 'Add product'}
      width={880}
      headerStart={<span className="shop-drawer-title">{existing ? 'Edit product' : 'Add product'}</span>}
      footer={<>
        {existing ? <Button variant="text" iconStart="trash" onClick={() => setConfirmDelete(true)}>Delete</Button> : <span />}
        <span className="shop-drawer-actions">
          <Button variant="text" onClick={onClose}>Cancel</Button>
          <Button size="md" onClick={save}>Save product</Button>
        </span>
      </>}
    >
      <div className="shop-drawer-body">
        <Section title="General">
          <Grid gap={16}>
            <GridItem span={6}><TextField label="Product name *" size="md" value={form.name} error={errors.name} onChange={(e) => set('name', e.target.value)} /></GridItem>
            <GridItem span={6}><TextField label="SKU / Product code *" size="md" value={form.id} error={errors.id} readOnly={!!existing} hint={existing ? 'The SKU cannot be changed' : undefined} onChange={(e) => set('id', e.target.value)} /></GridItem>
            <GridItem span={6}>
              <Select label="Category *" hideLabel={false} size="md" value={form.category} onChange={(v) => set('category', v as Category)} options={[{ value: 'Hardware', label: 'Hardware' }, { value: 'Tags', label: 'Tags' }]} />
            </GridItem>
            <GridItem span={6}>
              <Select label="Default illustration" hideLabel={false} size="md" value={form.type} onChange={(v) => set('type', v as ArtType)} options={artOptions} />
            </GridItem>
            <GridItem span={12}><TextField label="Short description *" size="md" value={form.short} error={errors.short} onChange={(e) => set('short', e.target.value)} /></GridItem>
            <GridItem span={12}><TextArea label="Description" hideLabel={false} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} /></GridItem>
            <GridItem span={12}><TextArea label="Key benefits / feature lines" hideLabel={false} hint="One per line" rows={3} value={form.features} onChange={(e) => set('features', e.target.value)} /></GridItem>
          </Grid>
        </Section>

        <Section title="Price & availability">
          <Grid gap={16}>
            <GridItem span={6}>
              <TextField label="General price (excl. VAT)" size="md" type="number" min={0} step="0.01" suffix="EUR" hint="Leave empty for “Price on request”" value={form.price} onChange={(e) => set('price', e.target.value)} />
            </GridItem>
            <GridItem span={6}>
              <Select label="Availability" hideLabel={false} size="md" value={form.availability} onChange={(v) => set('availability', v as Availability)} options={AVAILABILITIES.map((a) => ({ value: a, label: a }))} />
            </GridItem>
            <GridItem span={12}>
              <Switch label="Active in the Shop" hideLabel={false} checked={form.active} onChange={(e) => set('active', e.target.checked)} />
            </GridItem>
          </Grid>
        </Section>

        <Section title="Media">
          <div className="shop-upload">
            <ProductArt src={form.image} type={form.type} alt="Product image preview" size="sm" />
            <div className="shop-stack">
              <strong className="shop-card-title">Main product image</strong>
              <p className="shop-muted">PNG, JPG or WebP up to 2 MB. Without an image the built-in illustration is used.</p>
              <input ref={file} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => pickImage(e.target.files?.[0])} />
              <div className="shop-row">
                <Button size="sm" variant="secondary" iconStart="cloud-upload" onClick={() => file.current?.click()}>Upload image</Button>
                {form.image && <Button size="sm" variant="text" onClick={() => set('image', '')}>Use default illustration</Button>}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Technical specifications" actions={<Button size="xs" variant="secondary" iconStart="plus" onClick={() => setSpecs([...specs, { key: Date.now(), label: '', value: '' }])}>Add specification</Button>}>
          {specs.map((s, i) => (
            <div key={s.key} className="shop-spec-row">
              <TextField label={`Specification ${i + 1} label`} placeholder="Label" hideLabel size="sm" value={s.label} onChange={(e) => setSpecs(specs.map((x) => (x.key === s.key ? { ...x, label: e.target.value } : x)))} />
              <TextField label={`Specification ${i + 1} value`} placeholder="Value" hideLabel size="sm" value={s.value} onChange={(e) => setSpecs(specs.map((x) => (x.key === s.key ? { ...x, value: e.target.value } : x)))} />
              <IconButton icon="trash" label={`Remove specification ${i + 1}`} size="sm" variant="outline" onClick={() => setSpecs(specs.filter((x) => x.key !== s.key))} />
            </div>
          ))}
        </Section>

        <Section title="Documents">
          <TextArea label="Document names" hideLabel={false} hint="One per line" rows={3} value={form.docs} onChange={(e) => set('docs', e.target.value)} />
        </Section>
      </div>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`Delete ${existing?.name ?? ''}`}
        icon="trash"
        description="The product is removed from the catalogue and from carts. Submitted orders keep their product snapshots."
        actions={<Button size="md" variant="brand" fullWidth onClick={remove}>Delete product</Button>}
      />
    </Drawer>
  );
}
