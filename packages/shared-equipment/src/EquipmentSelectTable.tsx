import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { Button, Checkbox, EmptyState, Icon, TextField } from '@syn/design-system';
import equipmentPlaceholder from '../../../assets/default-images/equipment.svg';
import { DestinationCell, EMPTY, ImeiCell, LocationCell, SignalCell } from './cells';
import { OptionsFilterBody, TextFilterBody, TreeFilterBody } from './filters';
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

/** The ten fields of the Add Equipment brief (V15), in order, with their sorting and filtering. */
const COLUMNS: Column[] = [
  { id: 'image', label: 'Image', group: 'Equipment', width: 72 },
  { id: 'inventoryNumber', label: 'Inventory Number', group: 'Equipment', width: 168, sort: 'inventoryNumber', filter: { text: 'inventoryNumber' } },
  { id: 'title', label: 'Title', group: 'Equipment', width: 200, filter: { text: 'title' } },
  { id: 'category', label: 'Category', group: 'Equipment', width: 176, sort: 'categoryId', filter: { tree: 'category' } },
  { id: 'branch', label: 'Branch', group: 'Relations', width: 176, sort: 'branchId', filter: { tree: 'branch' } },
  { id: 'destination', label: 'Current Project / Warehouse / Rental', group: 'Check-in Information', width: 264, sort: 'destination', filter: { text: 'destination' } },
  { id: 'tracker', label: 'Tracker', group: 'Telematic Information', width: 160, filter: { options: 'tracker' } },
  { id: 'imei', label: 'Tracker IMEI', group: 'Telematic Information', width: 212, filter: { text: 'imei' } },
  { id: 'lastSignal', label: 'Last Signal', group: 'Telematic Information', width: 184, sort: 'lastSignal' },
  { id: 'location', label: 'Current Location', group: 'Telematic Information', width: 168, filter: { text: 'location' } },
];
const SELECT_W = 48;
const MIN_W = 64;

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
  /** Shown before the table's title row, e.g. a count. */
  title?: ReactNode;
}

/**
 * SHARED Add Equipment selection table (V15 behaviour, Syn visuals), usable in SAM and RAM: one column per field,
 * column sorting and filtering, resizable columns, horizontal scrolling with the selection, image and inventory
 * number kept in view, the main keyword search and the quick Branch and Category filters (the same state as their
 * column filters), and multiple selection.
 */
export function EquipmentSelectTable({
  records, categoryTree, branchTree, trackers, selected, onSelectedChange, now = Date.now(), title = 'Equipment',
}: EquipmentSelectTableProps) {
  const [filters, setFilters] = useState<EquipmentFilters>(emptyFilters);
  const [sort, setSort] = useState<Sort | null>(null);
  const [widths, setWidths] = useState<Record<string, number>>(() => Object.fromEntries(COLUMNS.map((c) => [c.id, c.width])));
  const [open, setOpen] = useState<{ id: string; anchor: HTMLElement } | null>(null);

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
  const clearFilter = (c: Column) => {
    const k = c.filter;
    if (!k) return;
    if ('text' in k) { const t = { ...filters.text }; delete t[k.text]; set({ text: t }); } else if ('tree' in k) set(k.tree === 'category' ? { categories: [] } : { branches: [] });
    else set({ trackers: [] });
  };
  const anyFilter = Boolean(filters.search.trim()) || COLUMNS.some(filterActive);

  const cycleSort = (key: SortKey) => setSort((s) => (s?.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null));
  const sortLabel = (c: Column) => {
    const on = sort?.key === c.sort;
    if (c.sort === 'lastSignal') return on ? (sort!.dir === 'asc' ? 'Oldest first' : 'Newest first') : 'Not sorted';
    return on ? (sort!.dir === 'asc' ? 'Ascending' : 'Descending') : 'Not sorted';
  };

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

  const filterBody = (c: Column) => {
    const k = c.filter!;
    if ('text' in k) {
      return <TextFilterBody field={c.label} value={filters.text[k.text]} onChange={(f) => set({ text: { ...filters.text, [k.text]: f } })} />;
    }
    if ('tree' in k) {
      return k.tree === 'category'
        ? <TreeFilterBody tree={categoryTree} selected={filters.categories} onChange={(v) => set({ categories: v })} searchLabel="Search categories" heading="Category tree" allLabel="All categories" />
        : <TreeFilterBody tree={branchTree} selected={filters.branches} onChange={(v) => set({ branches: v })} searchLabel="Search branches" heading="Organisational structure" />;
    }
    return (
      <OptionsFilterBody
        options={[{ value: NO_TRACKER, label: 'No tracker added', muted: true }, ...trackers.map((t) => ({ value: t, label: t }))]}
        selected={filters.trackers} onChange={(v) => set({ trackers: v })} searchLabel="Search trackers" heading="Choose trackers"
      />
    );
  };

  const quickLabel = (ids: string[], tree: TreeNode[], all: string) => {
    if (!ids.length) return all;
    // Name the highest chosen nodes only: a chosen parent stands for its chosen children.
    const top = ids.filter((id) => !ids.some((p) => p !== id && isAncestor(tree, p, id)));
    return top.length === 1 ? labelOf(tree, top[0]) : `${top.length} selected`;
  };

  const cell = (c: Column, r: EquipmentRecord): ReactNode => {
    switch (c.id) {
      case 'image': return <img className="seq-thumb" src={r.image ?? equipmentPlaceholder} alt="" width={40} height={40} />;
      case 'inventoryNumber': return <span className="seq-strong">{r.inventoryNumber}</span>;
      case 'title': return <span className="seq-strong">{r.title}</span>;
      case 'category': return labelOf(categoryTree, r.categoryId);
      case 'branch': return <span className="seq-branch"><span aria-hidden className="seq-branch__dot" />{labelOf(branchTree, r.branchId)}</span>;
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

  return (
    <section className="seq" aria-label="Add equipment">
      <header className="seq__head">
        <h2 className="seq__title">{title} <span className="seq__count">{records.length} records</span></h2>
        <span className="seq__selected" aria-live="polite">{selected.length} selected</span>
      </header>

      <div className="seq__toolbar">
        <TextField
          label="Search equipment" hideLabel size="sm" iconStart="search" placeholder="Search equipment" className="seq__search"
          value={filters.search} onChange={(e) => set({ search: e.target.value })} onClear={() => set({ search: '' })}
        />
        <button type="button" className={`seq-quick${filters.branches.length ? ' is-active' : ''}`} aria-haspopup="dialog"
          onClick={(e) => setOpen({ id: 'quick-branch', anchor: e.currentTarget })}>
          <span className="seq-quick__label">Branch</span>
          <span className="seq-quick__value">{quickLabel(filters.branches, branchTree, 'All branches')}</span>
          <Icon name="down" size={16} />
        </button>
        <button type="button" className={`seq-quick${filters.categories.length ? ' is-active' : ''}`} aria-haspopup="dialog"
          onClick={(e) => setOpen({ id: 'quick-category', anchor: e.currentTarget })}>
          <span className="seq-quick__label">Category</span>
          <span className="seq-quick__value">{quickLabel(filters.categories, categoryTree, 'All categories')}</span>
          <Icon name="down" size={16} />
        </button>
        <Button variant="secondary" size="sm" disabled={!anyFilter} onClick={() => { setFilters(emptyFilters()); setSort(null); }}>Clear filters</Button>
      </div>
      <p className="seq__meta" aria-live="polite"><strong>{rows.length} of {records.length}</strong> equipment shown</p>

      <div className="seq__scroll" role="region" aria-label="Equipment table" tabIndex={0}>
        {rows.length ? (
          <table className="seq-table" style={{ width: totalWidth }}>
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
                      {c.sort && (
                        <button
                          type="button" className={`seq-th__btn${sort?.key === c.sort ? ' is-active' : ''}`}
                          aria-label={`Sort ${c.label}: ${sortLabel(c)}`} title={sortLabel(c)} onClick={() => cycleSort(c.sort!)}
                        >
                          <SortGlyph dir={sort?.key === c.sort ? sort.dir : null} />
                        </button>
                      )}
                      {c.filter && (
                        <button
                          type="button" className={`seq-th__btn${filterActive(c) ? ' is-active' : ''}`} aria-haspopup="dialog"
                          aria-expanded={open?.id === c.id} aria-label={`Filter ${c.label}${filterActive(c) ? ' (on)' : ''}`}
                          onClick={(e) => setOpen(open?.id === c.id ? null : { id: c.id, anchor: e.currentTarget })}
                        >
                          <Icon name={filterActive(c) ? 'filter' : 'filter-muted'} size={16} />
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
            action={<Button variant="secondary" size="sm" onClick={() => setFilters(emptyFilters())}>Clear filters</Button>}
          >
            No equipment matches the search and filters
          </EmptyState>
        )}
      </div>

      {open && (open.id === 'quick-branch' || open.id === 'quick-category') && (
        <FilterPopover
          anchor={open.anchor} title={open.id === 'quick-branch' ? 'Branch' : 'Category'} onClose={() => setOpen(null)}
          onClear={() => set(open.id === 'quick-branch' ? { branches: [] } : { categories: [] })}
        >
          {filterBody(COLUMNS.find((c) => c.id === (open.id === 'quick-branch' ? 'branch' : 'category'))!)}
        </FilterPopover>
      )}
      {openCol && openCol.filter && (
        <FilterPopover anchor={open!.anchor} title={`${openCol.label} · Filter`} onClose={() => setOpen(null)} onClear={() => clearFilter(openCol)}>
          {filterBody(openCol)}
        </FilterPopover>
      )}
    </section>
  );
}

function isAncestor(tree: TreeNode[], ancestor: string, id: string): boolean {
  const find = (nodes: TreeNode[]): TreeNode | undefined => nodes.reduce<TreeNode | undefined>((f, n) => f ?? (n.id === ancestor ? n : find(n.children ?? [])), undefined);
  const a = find(tree);
  const has = (n?: TreeNode): boolean => Boolean(n?.children?.some((c) => c.id === id || has(c)));
  return has(a);
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

/** Up and down arrows; the active direction in Eerie Black, the other muted. */
function SortGlyph({ dir }: { dir: 'asc' | 'desc' | null }) {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" aria-hidden className="seq-sort">
      <path d="M6 1 10 6H2z" className={dir === 'asc' ? 'is-on' : undefined} />
      <path d="M6 15 2 10h8z" className={dir === 'desc' ? 'is-on' : undefined} />
    </svg>
  );
}
