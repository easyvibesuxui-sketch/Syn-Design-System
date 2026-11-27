import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { Button, Checkbox, EmptyState, Icon, OptionList, Select, TextField } from '@syn/design-system';
import equipmentPlaceholder from '../../../assets/default-images/equipment.svg';
import { DestinationCell, EMPTY, ImeiCell, LocationCell, SignalCell } from './cells';
import { OptionsFilterPanel, TextFilterPanel, TreeFilterPanel, treeLeaves, treeOptions, withWholeNodes } from './filters';
import { FilterPopover } from './Popover';
import { applyFilters, applySort, labelOf } from './logic';
import {
  emptyFilters, NO_TRACKER, type EquipmentFilters, type EquipmentRecord, type Sort, type SortKey, type TextColumn, type TreeNode,
} from './types';
import './EquipmentSelectTable.css';

type ColumnId = 'select' | 'image' | 'inventoryNumber' | 'title' | 'category' | 'branch' | 'destination' | 'tracker' | 'imei' | 'lastSignal' | 'location';
type FilterKind = { text: TextColumn } | { tree: 'category' | 'branch' } | { options: 'tracker' };

interface Column {
  id: ColumnId;
  label: string;
  group: string;
  width: number;
  sort?: SortKey;
  filter?: FilterKind;
}

/**
 * The ten fields of the Add Equipment brief (V15), in order, with their sorting and filtering. Widths as in Figma
 * (SAM › Add Equipment): all ten fit the 1232px table of the drawer, long values end in an ellipsis.
 */
const COLUMNS: Column[] = [
  { id: 'image', label: 'Image', group: 'Equipment', width: 64 },
  { id: 'inventoryNumber', label: 'Inventory Number', group: 'Equipment', width: 112, sort: 'inventoryNumber', filter: { text: 'inventoryNumber' } },
  { id: 'title', label: 'Title', group: 'Equipment', width: 110, filter: { text: 'title' } },
  { id: 'category', label: 'Category', group: 'Equipment', width: 110, sort: 'categoryId', filter: { tree: 'category' } },
  { id: 'branch', label: 'Branch', group: 'Relations', width: 130, sort: 'branchId', filter: { tree: 'branch' } },
  { id: 'destination', label: 'Current Project / Warehouse / Rental', group: 'Check-in Information', width: 176, sort: 'destination', filter: { text: 'destination' } },
  { id: 'tracker', label: 'Tracker', group: 'Telematic Information', width: 92, filter: { options: 'tracker' } },
  { id: 'imei', label: 'Tracker IMEI', group: 'Telematic Information', width: 153, filter: { text: 'imei' } },
  { id: 'lastSignal', label: 'Last Signal', group: 'Telematic Information', width: 116, sort: 'lastSignal' },
  { id: 'location', label: 'Current Location', group: 'Telematic Information', width: 121, filter: { text: 'location' } },
];
const SELECT_W = 48;
const MIN_W = 56;

export interface EquipmentSelectTableProps {
  records: EquipmentRecord[];
  categoryTree: TreeNode[];
  branchTree: TreeNode[];
  /** Tracker names offered in the Tracker filter ("No tracker added" is added). */
  trackers: string[];
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
  /** Reference time for the signal recency dot; defaults to now. */
  now?: number;
  /** The table's title (Figma: "Fleet"). */
  title?: ReactNode;
}

/**
 * SHARED Add Equipment selection table (V15 behaviour, Syn visuals), usable in SAM and RAM: one column per field,
 * column filters (Syn dropdown panels with Clear / Save) and the column menu (sort), resizable columns, the main
 * keyword search and the quick Branch and Category dropdowns (the same state as their column filters), and
 * multiple selection, marked with a black border as everywhere in SAM and RAM.
 */
export function EquipmentSelectTable({
  records, categoryTree, branchTree, trackers, selected, onSelectedChange, now = Date.now(), title = 'Fleet',
}: EquipmentSelectTableProps) {
  const [filters, setFilters] = useState<EquipmentFilters>(emptyFilters);
  const [sort, setSort] = useState<Sort | null>(null);
  const [widths, setWidths] = useState<Record<string, number>>(() => Object.fromEntries(COLUMNS.map((c) => [c.id, c.width])));
  const [open, setOpen] = useState<{ id: string; anchor: HTMLElement; menu?: boolean } | null>(null);

  const rows = useMemo(
    () => applySort(applyFilters(records, filters, categoryTree, branchTree), sort, categoryTree, branchTree),
    [records, filters, sort, categoryTree, branchTree],
  );
  const shownIds = rows.map((r) => r.id);
  const shownSelected = shownIds.filter((id) => selected.includes(id)).length;
  const allShown = rows.length > 0 && shownSelected === rows.length;
  const someShown = shownSelected > 0 && !allShown;

  const toggleAll = () => onSelectedChange(allShown
    ? selected.filter((id) => !shownIds.includes(id))
    : [...new Set([...selected, ...shownIds])]);
  const toggle = (id: string, on: boolean) => onSelectedChange(on ? [...selected, id] : selected.filter((x) => x !== id));

  const set = (patch: Partial<EquipmentFilters>) => setFilters((f) => ({ ...f, ...patch }));
  const filterActive = (c: Column): boolean => {
    const k = c.filter;
    if (!k) return false;
    if ('text' in k) return Boolean(filters.text[k.text]?.value.trim());
    if ('tree' in k) return (k.tree === 'category' ? filters.categories : filters.branches).length > 0;
    return filters.trackers.length > 0;
  };

  const sortNames = (c: Column) => (c.sort === 'lastSignal'
    ? { asc: 'Oldest first', desc: 'Newest first' }
    : { asc: 'Sort ascending', desc: 'Sort descending' });
  const sortLabel = (c: Column) => (sort?.key === c.sort ? sortNames(c)[sort!.dir] : 'Not sorted');

  // Column resizing: drag the right edge of a header.
  const drag = useRef<{ id: string; x: number; w: number } | null>(null);
  const startResize = (e: ReactPointerEvent, id: string) => {
    e.preventDefault();
    drag.current = { id, x: e.clientX, w: widths[id] };
    const move = (ev: PointerEvent) => {
      const d = drag.current;
      if (d) setWidths((w) => ({ ...w, [d.id]: Math.max(MIN_W, d.w + ev.clientX - d.x) }));
    };
    const up = () => { drag.current = null; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const resizeByKey = (key: string, id: string) => {
    if (key === 'ArrowLeft') setWidths((w) => ({ ...w, [id]: Math.max(MIN_W, w[id] - 16) }));
    if (key === 'ArrowRight') setWidths((w) => ({ ...w, [id]: w[id] + 16 }));
  };

  // The selection, image and inventory number stay in view while scrolling sideways.
  const stickyLeft: Partial<Record<ColumnId, number>> = {
    select: 0, image: SELECT_W, inventoryNumber: SELECT_W + widths.image,
  };
  const stickyStyle = (id: ColumnId) => (stickyLeft[id] !== undefined ? { left: stickyLeft[id] } : undefined);
  const stickyClass = (id: ColumnId) => (stickyLeft[id] !== undefined ? ` is-sticky${id === 'inventoryNumber' ? ' is-sticky-last' : ''}` : '');

  const groups = COLUMNS.reduce<{ label: string; span: number }[]>((acc, c) => {
    const last = acc[acc.length - 1];
    if (last && last.label === c.group) last.span += 1; else acc.push({ label: c.group, span: 1 });
    return acc;
  }, []);

  const filterPanel = (c: Column) => {
    const k = c.filter!;
    const done = () => { setOpen(null); open?.anchor.focus(); };
    if ('text' in k) {
      return (
        <TextFilterPanel
          field={c.label} value={filters.text[k.text]}
          onSave={(f) => { set({ text: { ...filters.text, [k.text]: f } }); done(); }}
        />
      );
    }
    if ('tree' in k) {
      return k.tree === 'category'
        ? <TreeFilterPanel label="Category" tree={categoryTree} selected={filters.categories} onSave={(v) => { set({ categories: v }); done(); }} />
        : <TreeFilterPanel label="Branch" tree={branchTree} selected={filters.branches} onSave={(v) => { set({ branches: v }); done(); }} />;
    }
    return (
      <OptionsFilterPanel
        label="Tracker" options={[{ value: NO_TRACKER, label: 'No tracker added' }, ...trackers.map((t) => ({ value: t, label: t }))]}
        selected={filters.trackers} onSave={(v) => { set({ trackers: v }); done(); }}
      />
    );
  };

  const sortMenu = (c: Column) => {
    const names = sortNames(c);
    return (
      <OptionList
        label={`${c.label}: sort`} options={[{ value: 'asc', label: names.asc }, { value: 'desc', label: names.desc }, { value: 'none', label: 'Not sorted' }]}
        value={sort?.key === c.sort ? sort!.dir : 'none'}
        onSelect={(v) => { setSort(v === 'none' ? null : { key: c.sort!, dir: v as 'asc' | 'desc' }); setOpen(null); open?.anchor.focus(); }}
      />
    );
  };

  const cell = (c: Column, r: EquipmentRecord): ReactNode => {
    switch (c.id) {
      case 'image': return <img className="seq-thumb" src={r.image ?? equipmentPlaceholder} alt="" width={40} height={40} />;
      case 'inventoryNumber': return <span className="seq-strong">{r.inventoryNumber}</span>;
      case 'title': return <span className="seq-strong">{r.title}</span>;
      case 'category': return labelOf(categoryTree, r.categoryId);
      case 'branch': return <span className="seq-branch"><span aria-hidden className="seq-branch__dot" /><span className="seq-ellipsis">{labelOf(branchTree, r.branchId)}</span></span>;
      case 'destination': return <DestinationCell value={r.destination} />;
      case 'tracker': return r.tracker ? <span className="seq-strong">{r.tracker}</span> : <span className="seq-empty">No tracker added</span>;
      case 'imei': return <ImeiCell imei={r.imei} tracker={r.tracker} />;
      case 'lastSignal': return <SignalCell iso={r.lastSignal} now={now} />;
      case 'location': return <LocationCell record={r} />;
      default: return EMPTY;
    }
  };

  const totalWidth = SELECT_W + COLUMNS.reduce((s, c) => s + widths[c.id], 0);
  const openCol = open && COLUMNS.find((c) => c.id === open.id);
  const categoryLeaves = treeLeaves(categoryTree);
  const branchLeaves = treeLeaves(branchTree);

  return (
    <section className="seq" aria-label="Add equipment">
      <header className="seq__head">
        <h2 className="seq__title">{title}</h2>
      </header>

      <div className="seq__toolbar">
        <TextField
          label="Search equipment" hideLabel size="sm" iconStart="search" placeholder="Search" className="seq__search"
          value={filters.search} onChange={(e) => set({ search: e.target.value })} onClear={() => set({ search: '' })}
        />
        <Select
          label="Branch" size="sm" searchable multiple showTags={false} className="seq__quick"
          options={treeOptions(branchTree)} values={filters.branches.filter((id) => branchLeaves.includes(id))}
          onValuesChange={(v) => set({ branches: withWholeNodes(branchTree, v) })} listActions={{ secondaryLabel: 'Clear', actionLabel: 'Save' }}
        />
        <Select
          label="Category" size="sm" searchable multiple showTags={false} className="seq__quick"
          options={treeOptions(categoryTree)} values={filters.categories.filter((id) => categoryLeaves.includes(id))}
          onValuesChange={(v) => set({ categories: withWholeNodes(categoryTree, v) })} listActions={{ secondaryLabel: 'Clear', actionLabel: 'Save' }}
        />
      </div>
      <p className="syn-visually-hidden" aria-live="polite">{rows.length} of {records.length} equipment shown</p>

      <div className="seq__scroll" role="region" aria-label="Equipment table" tabIndex={0}>
        {rows.length ? (
          <table className="seq-table" style={{ width: '100%', minWidth: totalWidth }}>
            <caption className="syn-visually-hidden">Equipment to add. Sort and filter from the column headers.</caption>
            <colgroup>
              <col style={{ width: SELECT_W }} />
              {COLUMNS.map((c) => <col key={c.id} style={{ width: widths[c.id] }} />)}
            </colgroup>
            <thead>
              <tr className="seq-table__groups">
                <th aria-hidden className="is-sticky" style={{ left: 0 }} />
                {groups.map((g, i) => (
                  <th key={g.label + i} colSpan={g.span} scope="colgroup">
                    <span className="seq-table__group">{g.label}</span>
                  </th>
                ))}
              </tr>
              <tr>
                <th scope="col" className={`seq-table__select${stickyClass('select')}`} style={stickyStyle('select')}>
                  <SelectAll checked={allShown} mixed={someShown} onChange={toggleAll} />
                </th>
                {COLUMNS.map((c) => (
                  <th
                    key={c.id} scope="col" className={stickyClass(c.id).trim() || undefined} style={stickyStyle(c.id)}
                    aria-sort={c.sort && sort?.key === c.sort ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    <span className="seq-th">
                      <span className="seq-th__label" title={c.label}>{c.label}</span>
                      {c.filter && (
                        <button
                          type="button" className={`seq-th__btn${filterActive(c) ? ' is-active' : ''}`} aria-haspopup="dialog"
                          aria-expanded={open?.id === c.id && !open.menu} aria-label={`Filter ${c.label}${filterActive(c) ? ' (on)' : ''}`}
                          onClick={(e) => setOpen(open?.id === c.id && !open.menu ? null : { id: c.id, anchor: e.currentTarget })}
                        >
                          <Icon name={filterActive(c) ? 'filter' : 'filter-muted'} size={16} />
                        </button>
                      )}
                      {c.sort && (
                        <button
                          type="button" className={`seq-th__btn${sort?.key === c.sort ? ' is-active' : ''}`} aria-haspopup="dialog"
                          aria-expanded={open?.id === c.id && Boolean(open.menu)} aria-label={`${c.label} column menu: ${sortLabel(c)}`}
                          onClick={(e) => setOpen(open?.id === c.id && open.menu ? null : { id: c.id, anchor: e.currentTarget, menu: true })}
                        >
                          <Icon name="dotvertical" size={16} />
                        </button>
                      )}
                    </span>
                    <span
                      role="separator" aria-orientation="vertical" aria-label={`Resize ${c.label}`} tabIndex={0}
                      aria-valuenow={widths[c.id]} className="seq-th__resize"
                      onPointerDown={(e) => startResize(e, c.id)} onKeyDown={(e) => resizeByKey(e.key, c.id)}
                      onDoubleClick={() => setWidths((w) => ({ ...w, [c.id]: c.width }))}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const on = selected.includes(r.id);
                return (
                  <tr key={r.id} className={on ? 'is-selected' : undefined} onClick={(e) => {
                    // A click on the row toggles it, but not on its own controls.
                    if (!(e.target as HTMLElement).closest('button, a, input, label')) toggle(r.id, !on);
                  }}>
                    <td className={`seq-table__select${stickyClass('select')}`} style={stickyStyle('select')}>
                      <Checkbox label={<span className="syn-visually-hidden">Select {r.inventoryNumber} {r.title}</span>} checked={on} onChange={(e) => toggle(r.id, e.target.checked)} />
                    </td>
                    {COLUMNS.map((c) => (
                      <td key={c.id} className={stickyClass(c.id).trim() || undefined} style={stickyStyle(c.id)}>{cell(c, r)}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <EmptyState
            variant="general" icon="search-empty" className="seq__empty"
            action={<Button variant="secondary" size="sm" onClick={() => { setFilters(emptyFilters()); setSort(null); }}>Clear filters</Button>}
          >
            No equipment matches the search and filters
          </EmptyState>
        )}
      </div>

      {openCol && (
        <FilterPopover
          key={`${openCol.id}${open!.menu ? '-menu' : ''}`} anchor={open!.anchor} width={open!.menu ? 240 : 370}
          label={open!.menu ? `${openCol.label} column menu` : `${openCol.label} filter`} onClose={() => setOpen(null)}
        >
          {open!.menu ? sortMenu(openCol) : filterPanel(openCol)}
        </FilterPopover>
      )}
    </section>
  );
}

function SelectAll({ checked, mixed, onChange }: { checked: boolean; mixed: boolean; onChange: () => void }) {
  return (
    <Checkbox
      ref={(el) => { if (el) el.indeterminate = mixed; }}
      label={<span className="syn-visually-hidden">Select all shown equipment</span>} checked={checked} onChange={onChange}
      className={mixed ? 'is-mixed' : undefined}
    />
  );
}
