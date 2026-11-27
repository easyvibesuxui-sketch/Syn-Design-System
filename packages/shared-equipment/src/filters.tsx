import { useState } from 'react';
import { DropdownPanel, OptionList, Select, TextField, type SelectOption } from '@syn/design-system';
import type { TextCondition, TextFilter, TreeNode } from './types';

/**
 * The column filter panels, built from Syn's dropdown list (Figma "Barrell select", "Multi Select list") and
 * dropdown panel (Figma "Location filter"): no search of their own, a "Clear" text button and an Amber "Save".
 * Changes apply on Save; closing the panel otherwise keeps the filter as it was.
 */

const ACTIONS = { secondaryLabel: 'Clear', actionLabel: 'Save' } as const;

const conditions: { value: TextCondition; label: string }[] = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'starts', label: 'Starts with' },
  { value: 'ends', label: 'Ends with' },
];

/** Fleet Database text filter: a condition and the text, matched case-insensitively. */
export function TextFilterPanel({ field, value, onSave }: { field: string; value?: TextFilter; onSave: (f: TextFilter) => void }) {
  const [draft, setDraft] = useState<TextFilter>(value ?? { condition: 'contains', value: '' });
  return (
    <DropdownPanel
      className="seq-text-filter"
      actions={{ ...ACTIONS, onSecondary: () => setDraft({ condition: 'contains', value: '' }), onAction: () => onSave(draft) }}
    >
      <Select
        label={`${field}: condition`} size="sm" options={conditions} value={draft.condition}
        onChange={(v) => setDraft({ ...draft, condition: v as TextCondition })}
      />
      <TextField
        label={`Filter ${field}`} hideLabel size="sm" iconStart="search" placeholder={field} value={draft.value}
        onChange={(e) => setDraft({ ...draft, value: e.target.value })} onClear={() => setDraft({ ...draft, value: '' })}
        onKeyDown={(e) => { if (e.key === 'Enter') onSave(draft); }}
      />
    </DropdownPanel>
  );
}

const toOptions = (tree: TreeNode[]): SelectOption[] => tree.map((n) => ({
  value: n.id, label: n.label, children: n.children?.length ? toOptions(n.children) : undefined,
}));
const leaves = (tree: TreeNode[]): string[] => tree.flatMap((n) => (n.children?.length ? leaves(n.children) : [n.id]));

/**
 * The chosen leaves plus every node whose leaves are all chosen: equipment assigned to a parent node (a region,
 * a category group) is found when the whole node is ticked.
 */
export function withWholeNodes(tree: TreeNode[], chosen: string[]): string[] {
  const set = new Set(chosen);
  const out: string[] = [];
  const walk = (nodes: TreeNode[]) => nodes.forEach((n) => {
    if (n.children?.length) {
      walk(n.children);
      if (leaves(n.children).every((l) => set.has(l))) out.push(n.id);
    } else if (set.has(n.id)) out.push(n.id);
  });
  walk(tree);
  return out;
}

/** Hierarchical multi-select (Category tree, Branch organisational structure); a group ticks its whole subtree. */
export function TreeFilterPanel({ tree, selected, onSave, label }: {
  tree: TreeNode[];
  selected: string[];
  onSave: (ids: string[]) => void;
  label: string;
}) {
  const allLeaves = leaves(tree);
  const [draft, setDraft] = useState(() => selected.filter((id) => allLeaves.includes(id)));
  // Open the groups that hold a choice; with nothing chosen, the top level.
  const [expanded] = useState(() => {
    const open: string[] = [];
    const walk = (nodes: TreeNode[], top: boolean): boolean => nodes.reduce((any, n) => {
      if (!n.children?.length) return any || draft.includes(n.id);
      const has = walk(n.children, false);
      if (has || (top && !draft.length)) open.push(n.id);
      return any || has;
    }, false);
    walk(tree, true);
    return open;
  });
  return (
    <OptionList
      label={label} multiple options={toOptions(tree)} values={draft} onValuesChange={setDraft} defaultExpanded={expanded}
      actions={{ ...ACTIONS, onSecondary: () => setDraft([]), onAction: () => onSave(withWholeNodes(tree, draft)) }}
    />
  );
}

/** Multi-select of plain options (Tracker). */
export function OptionsFilterPanel({ options, selected, onSave, label }: {
  options: { value: string; label: string }[];
  selected: string[];
  onSave: (values: string[]) => void;
  label: string;
}) {
  const [draft, setDraft] = useState(selected);
  return (
    <OptionList
      label={label} multiple options={options} values={draft} onValuesChange={setDraft}
      actions={{ ...ACTIONS, onSecondary: () => setDraft([]), onAction: () => onSave(draft) }}
    />
  );
}

/** Syn dropdown options for a tree (the quick Branch and Category filters). */
export { toOptions as treeOptions, leaves as treeLeaves };
