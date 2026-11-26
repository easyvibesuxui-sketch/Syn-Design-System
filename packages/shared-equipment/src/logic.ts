import { NO_TRACKER, type EquipmentFilters, type EquipmentRecord, type Sort, type TextColumn, type TextFilter, type TreeNode } from './types';

/** Every node of a tree, depth first. */
export function flatten(tree: TreeNode[], depth = 0, parent?: string): Array<TreeNode & { depth: number; parent?: string }> {
  return tree.flatMap((n) => [{ ...n, depth, parent }, ...flatten(n.children ?? [], depth + 1, n.id)]);
}
export const descendants = (n: TreeNode): string[] => (n.children ?? []).flatMap((c) => [c.id, ...descendants(c)]);
export const labelOf = (tree: TreeNode[], id: string) => flatten(tree).find((n) => n.id === id)?.label ?? id;

export function matchText(value: string | null | undefined, f?: TextFilter) {
  if (!f || !f.value.trim()) return true;
  const v = (value ?? '').toLowerCase();
  const q = f.value.trim().toLowerCase();
  if (f.condition === 'equals') return v === q;
  if (f.condition === 'starts') return v.startsWith(q);
  if (f.condition === 'ends') return v.endsWith(q);
  return v.includes(q);
}

/** Name, detail and kind ("Project", "Warehouse", "Rental"), so a filter for "rental" finds every rental. */
export const destinationText = (r: EquipmentRecord) => (r.destination
  ? `${r.destination.name} ${r.destination.detail ?? ''} ${r.destination.kind}`.trim()
  : '');
const textOf: Record<TextColumn, (r: EquipmentRecord) => string | null> = {
  inventoryNumber: (r) => r.inventoryNumber,
  title: (r) => r.title,
  destination: destinationText,
  imei: (r) => r.imei,
  location: (r) => r.location,
};

export function applyFilters(records: EquipmentRecord[], f: EquipmentFilters, categories: TreeNode[], branches: TreeNode[]) {
  const q = f.search.trim().toLowerCase();
  const cats = new Set(f.categories);
  const brs = new Set(f.branches);
  return records.filter((r) => {
    if (q && ![r.inventoryNumber, r.title, labelOf(categories, r.categoryId), labelOf(branches, r.branchId), destinationText(r), r.tracker, r.imei, r.location]
      .some((v) => v?.toLowerCase().includes(q))) return false;
    if (cats.size && !cats.has(r.categoryId)) return false;
    if (brs.size && !brs.has(r.branchId)) return false;
    if (f.trackers.length && !f.trackers.includes(r.tracker ?? NO_TRACKER)) return false;
    return (Object.keys(f.text) as TextColumn[]).every((k) => matchText(textOf[k](r), f.text[k]));
  });
}

export function applySort(records: EquipmentRecord[], sort: Sort | null, categories: TreeNode[], branches: TreeNode[]) {
  if (!sort) return records;
  const key = (r: EquipmentRecord): string => {
    switch (sort.key) {
      case 'categoryId': return labelOf(categories, r.categoryId);
      case 'branchId': return labelOf(branches, r.branchId);
      case 'destination': return r.destination?.name ?? '';
      case 'lastSignal': return r.lastSignal ?? '';
      default: return r.inventoryNumber;
    }
  };
  const sign = sort.dir === 'asc' ? 1 : -1;
  return [...records].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    // Empty values (no destination, no signal) always go last.
    if (!ka !== !kb) return ka ? -1 : 1;
    return sign * ka.localeCompare(kb, undefined, { numeric: true, sensitivity: 'base' });
  });
}

/**
 * Signal recency: Mantis within 12 hours, Honey within 24 hours, Vermilion when older. The thresholds are an
 * assumption until the Fleet Database rule is confirmed.
 */
export function signalRecency(iso: string | null, now = Date.now()): 'recent' | 'stale' | 'old' | 'none' {
  if (!iso) return 'none';
  const hours = (now - new Date(iso).getTime()) / 36e5;
  return hours <= 12 ? 'recent' : hours <= 24 ? 'stale' : 'old';
}
