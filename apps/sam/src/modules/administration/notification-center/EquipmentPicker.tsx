import { useMemo, useState } from 'react';
import { Button, Checkbox, Drawer, EmptyState, Icon, Select, TextField } from '@syn/design-system';
import { equipment, type Equipment } from './data';

const unique = (key: keyof Equipment) => [...new Set(equipment.map((e) => String(e[key])))].map((v) => ({ value: v, label: v }));
const branchOptions = unique('branch');
const categoryOptions = unique('category');
const beaconOptions = unique('beacon');

/**
 * Figma "Choose" (14054:46598): the equipment list the alert watches, opened from the Equipments section's plus.
 * Search, Branch, Category and Beacon filters, Select All, and a round check per row; Submit takes the selection.
 */
export function EquipmentPicker({ open, selected, onClose, onSubmit }: {
  open: boolean;
  selected: string[];
  onClose: () => void;
  onSubmit: (ids: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>(selected);
  const [query, setQuery] = useState('');
  const [branch, setBranch] = useState('');
  const [category, setCategory] = useState('');
  const [beacon, setBeacon] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return equipment.filter((e) => (!branch || e.branch === branch) && (!category || e.category === category) && (!beacon || e.beacon === beacon)
      && (!q || [e.name, e.inventory, e.listing, e.category, e.tag, e.imei].some((v) => v.toLowerCase().includes(q))));
  }, [query, branch, category, beacon]);

  const selectable = rows.filter((e) => e.available);
  const allPicked = selectable.length > 0 && selectable.every((e) => picked.includes(e.id));
  const toggle = (id: string, on: boolean) => setPicked((p) => (on ? [...p, id] : p.filter((x) => x !== id)));
  const toggleAll = () => setPicked((p) => (allPicked
    ? p.filter((id) => !selectable.some((e) => e.id === id))
    : [...new Set([...p, ...selectable.map((e) => e.id)])]));

  return (
    <Drawer
      open={open} onClose={onClose} label="Choose equipment" className="sam-picker"
      headerStart={(
        <button type="button" className="sam-picker__back" onClick={onClose}>
          <Icon name="back" size={20} />
          Choose
        </button>
      )}
      footer={(
        <>
          <Button variant="text" onClick={onClose}>Discard</Button>
          <p className="sam-picker__legend">
            <span><span aria-hidden className="sam-picker__dot" />Not Available</span>
            <span><span aria-hidden className="sam-picker__dot is-available" />Available</span>
          </p>
          <Button onClick={() => onSubmit(picked)}>Submit{picked.length ? ` (${picked.length})` : ''}</Button>
        </>
      )}
    >
      <div className="sam-picker__box">
        <h2 className="sam-picker__title">Equipment</h2>
        <div className="sam-nc-toolbar">
          <div className="sam-nc-toolbar__filters">
            <TextField label="Search equipment" hideLabel size="sm" iconStart="search" placeholder="Search" className="sam-picker__search"
              value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery('')} />
            <Select label="Branch" hideLabel size="sm" placeholder="Branch" options={branchOptions} value={branch} onChange={setBranch} onClear={() => setBranch('')} className="sam-picker__filter" />
            <Select label="Category" hideLabel size="sm" placeholder="Category" options={categoryOptions} value={category} onChange={setCategory} onClear={() => setCategory('')} className="sam-picker__filter" />
            <Select label="Beacon" hideLabel size="sm" placeholder="Beacon" options={beaconOptions} value={beacon} onChange={setBeacon} onClear={() => setBeacon('')} className="sam-picker__filter" />
          </div>
          <Checkbox shape="round" label="Select All" checked={allPicked} onChange={toggleAll} disabled={!selectable.length} />
        </div>

        {rows.length ? (
          <div className="sam-picker__scroll">
            <table className="sam-picker__table">
              <caption className="syn-visually-hidden">Equipment</caption>
              <thead>
                <tr className="sam-picker__groups">
                  <th colSpan={5} scope="colgroup">Equipment</th>
                  <th colSpan={2} scope="colgroup">Relations</th>
                  <th scope="colgroup">Projects</th>
                  <th colSpan={2} scope="colgroup">Telematics</th>
                </tr>
                <tr>
                  <th scope="col"><span className="syn-visually-hidden">Select</span></th>
                  <th scope="col">INumber</th>
                  <th scope="col">Category</th>
                  <th scope="col">Tag</th>
                  <th scope="col">Status</th>
                  <th scope="col">Structure</th>
                  <th scope="col">Crew</th>
                  <th scope="col">Current</th>
                  <th scope="col">Last signal</th>
                  <th scope="col">Beacon</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id} className={e.available ? undefined : 'is-unavailable'}>
                    <td>
                      <Checkbox
                        shape="round" label={<span className="syn-visually-hidden">{e.name}</span>}
                        checked={picked.includes(e.id)} disabled={!e.available}
                        onChange={(ev) => toggle(e.id, ev.target.checked)}
                      />
                    </td>
                    <td>
                      <span className="sam-picker__item">
                        <strong>{e.name}</strong>
                        <span>{e.listing}</span>
                        <span>{e.inventory}</span>
                      </span>
                    </td>
                    <td>{e.category}</td>
                    <td>
                      <span className="sam-picker__tag"><span aria-hidden className="sam-picker__swatch is-info" />{e.tag}</span>
                      <span className="sam-picker__plus">+{e.tagCount}</span>
                    </td>
                    <td><span className="sam-picker__status"><span aria-hidden className="sam-picker__swatch is-success" />{e.status}</span></td>
                    <td><span className="sam-picker__dotted"><span aria-hidden className="sam-picker__swatch is-violet" />{e.structure}</span></td>
                    <td><span className="sam-picker__dotted"><span aria-hidden className="sam-picker__swatch is-orange" />{e.crew}</span></td>
                    <td>{e.project} <span className="sam-nc-muted">({e.projectSite})</span></td>
                    <td><span className="sam-picker__dotted"><span aria-hidden className="sam-picker__swatch is-success" />{e.lastSignal}</span></td>
                    <td className="sam-nc-muted">{e.beacon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState variant="general" className="sam-picker__empty">No equipment matches the filters</EmptyState>
        )}
      </div>
    </Drawer>
  );
}
