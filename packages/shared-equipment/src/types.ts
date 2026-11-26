/**
 * The equipment fields every listing (SAM, RAM, SHARED) can show. Nothing here depends on entities that only one
 * product has (Tags, Crew, equipment status), so the same table works in both.
 */
export type DestinationKind = 'project' | 'warehouse' | 'rental';

export interface EquipmentRecord {
  id: string;
  /** Photo URL; Syn's equipment placeholder when missing. */
  image?: string;
  inventoryNumber: string;
  title: string;
  categoryId: string;
  branchId: string;
  /** Current Project / Warehouse / Rental (check-in information); null when not checked in anywhere. */
  destination: { kind: DestinationKind; name: string; detail?: string } | null;
  /** Tracker name or type, e.g. "syniotec CORE"; null when no tracker is added. */
  tracker: string | null;
  imei: string | null;
  /** ISO date-time of the last signal; null when the tracker never sent one. */
  lastSignal: string | null;
  /** Current address; null when unknown. */
  location: string | null;
}

/** A node of a hierarchical filter (Category tree, Branch organisational structure). */
export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

export type TextCondition = 'contains' | 'equals' | 'starts' | 'ends';
export interface TextFilter { condition: TextCondition; value: string }

export type TextColumn = 'inventoryNumber' | 'title' | 'destination' | 'imei' | 'location';
export type SortKey = 'inventoryNumber' | 'categoryId' | 'branchId' | 'destination' | 'lastSignal';
export interface Sort { key: SortKey; dir: 'asc' | 'desc' }

export interface EquipmentFilters {
  search: string;
  text: Partial<Record<TextColumn, TextFilter>>;
  /** Selected category node ids (a parent's id stands for itself; its children are listed too). */
  categories: string[];
  branches: string[];
  /** Tracker names; NO_TRACKER finds equipment without one. */
  trackers: string[];
}

export const NO_TRACKER = '__none__';
export const emptyFilters = (): EquipmentFilters => ({ search: '', text: {}, categories: [], branches: [], trackers: [] });
