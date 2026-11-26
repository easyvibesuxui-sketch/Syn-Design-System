import { useMemo, useRef, useState, useEffect } from 'react';
import { Checkbox, Icon, TextField } from '@syn/design-system';
import { descendants, flatten } from './logic';
import type { TextCondition, TextFilter, TreeNode } from './types';

const conditions: { value: TextCondition; label: string }[] = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'starts', label: 'Starts with' },
  { value: 'ends', label: 'Ends with' },
];

/** Fleet Database text filter: a condition and the text, matched case-insensitively. */
export function TextFilterBody({ field, value, onChange }: { field: string; value?: TextFilter; onChange: (f: TextFilter) => void }) {
  const f = value ?? { condition: 'contains' as TextCondition, value: '' };
  return (
    <div className="seq-text-filter">
      <p className="seq-pop__hint">Match text in {field}</p>
      <label className="seq-text-filter__condition">
        <span>Condition</span>
        <select value={f.condition} onChange={(e) => onChange({ ...f, condition: e.target.value as TextCondition })}>
          {conditions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </label>
      <TextField
        label={`Filter ${field}`} hideLabel size="sm" placeholder="Filter…" value={f.value}
        onChange={(e) => onChange({ ...f, value: e.target.value })} onClear={() => onChange({ ...f, value: '' })}
      />
      <p className="seq-pop__note">Not case-sensitive.</p>
    </div>
  );
}

/** A checkbox whose `indeterminate` state follows the prop (Syn's Checkbox forwards its ref to the input). */
function TriCheckbox({ label, checked, mixed, onChange }: { label: string; checked: boolean; mixed: boolean; onChange: (on: boolean) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = mixed; }, [mixed]);
  return <Checkbox ref={ref} label={label} checked={checked} onChange={(e) => onChange(e.target.checked)} className={mixed ? 'is-mixed' : undefined} />;
}

/**
 * Hierarchical multi-select (Category tree, Branch organisational structure): search, expand and collapse, and a
 * parent that selects its whole subtree. While searching, the matching nodes show with their parents.
 */
export function TreeFilterBody({ tree, selected, onChange, searchLabel, heading, allLabel }: {
  tree: TreeNode[];
  selected: string[];
  onChange: (ids: string[]) => void;
  searchLabel: string;
  heading: string;
  allLabel?: string;
}) {
  const [q, setQ] = useState('');
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const nodes = useMemo(() => flatten(tree), [tree]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const sel = new Set(selected);
  const query = q.trim().toLowerCase();

  // While searching: the matches and every ancestor of a match.
  const visible = useMemo(() => {
    if (!query) return null;
    const keep = new Set<string>();
    nodes.forEach((n) => {
      if (!n.label.toLowerCase().includes(query)) return;
      let cur: typeof n | undefined = n;
      while (cur) { keep.add(cur.id); cur = cur.parent ? byId.get(cur.parent) : undefined; }
    });
    return keep;
  }, [query, nodes, byId]);

  const state = (n: TreeNode) => {
    const ids = [n.id, ...descendants(n)];
    const count = ids.filter((id) => sel.has(id)).length;
    return { checked: count === ids.length, mixed: count > 0 && count < ids.length };
  };
  const toggle = (n: TreeNode, on: boolean) => {
    const ids = [n.id, ...descendants(n)];
    const next = new Set(sel);
    ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
    // A parent stays checked only while all of its subtree is.
    nodes.forEach((p) => { if (p.children?.length && !on && descendants(p).includes(n.id)) next.delete(p.id); });
    onChange([...next]);
  };
  const hidden = (n: (typeof nodes)[number]) => {
    if (visible) return !visible.has(n.id);
    let cur = n.parent ? byId.get(n.parent) : undefined;
    while (cur) { if (collapsed.includes(cur.id)) return true; cur = cur.parent ? byId.get(cur.parent) : undefined; }
    return false;
  };
  const allIds = nodes.map((n) => n.id);
  const allChecked = allIds.every((id) => sel.has(id));

  return (
    <div className="seq-tree">
      <TextField label={searchLabel} hideLabel size="sm" iconStart="search" placeholder={searchLabel} value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} />
      <p className="seq-pop__section">{heading}</p>
      <ul className="seq-tree__list" role="tree" aria-label={heading} aria-multiselectable>
        {allLabel && !query && (
          <li className="seq-tree__row" role="treeitem" aria-selected={allChecked}>
            <TriCheckbox label={allLabel} checked={allChecked} mixed={!allChecked && selected.length > 0} onChange={(on) => onChange(on ? allIds : [])} />
          </li>
        )}
        {nodes.filter((n) => !hidden(n)).map((n) => {
          const s = state(n);
          const open = !collapsed.includes(n.id) || Boolean(visible);
          return (
            <li
              key={n.id} role="treeitem" aria-selected={s.checked} aria-level={n.depth + 1}
              aria-expanded={n.children?.length ? open : undefined}
              className="seq-tree__row" style={{ paddingLeft: 4 + n.depth * 20 + (allLabel && !query ? 20 : 0) }}
            >
              {n.children?.length ? (
                <button
                  type="button" className="seq-tree__twisty" aria-label={open ? `Collapse ${n.label}` : `Expand ${n.label}`}
                  onClick={() => setCollapsed((c) => (c.includes(n.id) ? c.filter((x) => x !== n.id) : [...c, n.id]))}
                >
                  <Icon name={open ? 'down' : 'next'} size={16} />
                </button>
              ) : <span className="seq-tree__twisty" aria-hidden />}
              <TriCheckbox label={n.label} checked={s.checked} mixed={s.mixed} onChange={(on) => toggle(n, on)} />
            </li>
          );
        })}
        {visible && visible.size === 0 && <li className="seq-pop__empty">Nothing matches “{q}”.</li>}
      </ul>
    </div>
  );
}

/** Searchable multi-select of plain options (Tracker). */
export function OptionsFilterBody({ options, selected, onChange, searchLabel, heading }: {
  options: { value: string; label: string; muted?: boolean }[];
  selected: string[];
  onChange: (values: string[]) => void;
  searchLabel: string;
  heading: string;
}) {
  const [q, setQ] = useState('');
  const shown = options.filter((o) => o.label.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div className="seq-tree">
      <TextField label={searchLabel} hideLabel size="sm" iconStart="search" placeholder={searchLabel} value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} />
      <p className="seq-pop__section">{heading}</p>
      <ul className="seq-tree__list">
        {shown.map((o) => (
          <li key={o.value} className={`seq-tree__row${o.muted ? ' is-muted' : ''}`}>
            <Checkbox
              label={o.label} checked={selected.includes(o.value)}
              onChange={(e) => onChange(e.target.checked ? [...selected, o.value] : selected.filter((v) => v !== o.value))}
            />
          </li>
        ))}
        {!shown.length && <li className="seq-pop__empty">Nothing matches “{q}”.</li>}
      </ul>
    </div>
  );
}
