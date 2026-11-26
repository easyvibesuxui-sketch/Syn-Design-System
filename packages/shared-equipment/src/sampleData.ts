import type { EquipmentRecord, TreeNode } from './types';

/**
 * Sample records from the V15 prototype (Equipment Views Explorer › Target Design › Add Equipment), to be replaced
 * by the SAM or RAM API. The category tree groups V15's categories; the real tree comes from the Fleet Database.
 */
export const sampleCategoryTree: TreeNode[] = [
  {
    id: 'cat-earthmoving', label: 'Earthmoving',
    children: [
      { id: 'cat-excavators', label: 'Excavators' },
      { id: 'cat-heavy-crawler', label: 'Heavy Crawler' },
      { id: 'cat-heavy-dozer', label: 'Heavy Dozer' },
      { id: 'cat-wheel-loader', label: 'Wheel Loader' },
    ],
  },
  {
    id: 'cat-transport', label: 'Transport',
    children: [
      { id: 'cat-articulated-truck', label: 'Articulated truck' },
      { id: 'cat-concrete-mixer', label: 'Concrete Mixer Trucks' },
      { id: 'cat-self-loader', label: 'Self-loader' },
    ],
  },
  { id: 'cat-scaffolding', label: 'Scaffolding' },
];

export const sampleBranchTree: TreeNode[] = [
  {
    id: 'br-syniotec', label: 'syniotec',
    children: [
      {
        id: 'br-bayern', label: 'Bayern',
        children: [
          { id: 'br-hochbau-regensburg', label: 'Hochbau Regensburg' },
          { id: 'br-kanalbau-augsburg', label: 'Kanalbau Augsburg' },
          { id: 'br-tiefbau-muenchen', label: 'Straßen- und Tiefbau München' },
        ],
      },
      { id: 'br-bremen', label: 'Bremen' },
      { id: 'br-dresden', label: 'Dresden' },
    ],
  },
];

export const sampleTrackers = ['syniotec CORE', 'syniotec DOT', 'syniotec DOT Mini', 'syniotec OBD', 'syniotec VOLT'];

export const sampleEquipment: EquipmentRecord[] = [
  { id: 'eq-1', inventoryNumber: '44584DB48', title: 'Caterpillar 320', categoryId: 'cat-heavy-crawler', branchId: 'br-bremen', destination: { kind: 'project', name: 'Bremen', detail: 'Hafensee Roadworks' }, tracker: 'syniotec CORE', imei: '861607001255463', lastSignal: '2026-11-24T08:47', location: 'Am Wall 120, 28195 Bremen' },
  { id: 'eq-2', inventoryNumber: '02062026-1', title: 'HOTFIX-CHECK-ANO-1', categoryId: 'cat-articulated-truck', branchId: 'br-bayern', destination: { kind: 'project', name: 'KST-HB-01', detail: 'AG Weser Straße 78, Bremen' }, tracker: 'syniotec VOLT', imei: '861607001255471', lastSignal: '2026-11-24T08:02', location: 'Weser Straße 78, 28217 Bremen' },
  { id: 'eq-3', inventoryNumber: 'INV-00018', title: 'Volvo EC220', categoryId: 'cat-excavators', branchId: 'br-hochbau-regensburg', destination: { kind: 'warehouse', name: 'Warehouse 01', detail: 'Regensburg, Germany' }, tracker: 'syniotec DOT', imei: '861607001255489', lastSignal: '2026-11-24T01:10', location: 'Industriestraße 4, 93055 Regensburg' },
  { id: 'eq-4', inventoryNumber: '14082023-2', title: 'ANO - Reg.1408-2', categoryId: 'cat-scaffolding', branchId: 'br-bremen', destination: null, tracker: null, imei: null, lastSignal: null, location: null },
  { id: 'eq-5', inventoryNumber: '61010370', title: 'Mobilbagger A900 CZW', categoryId: 'cat-wheel-loader', branchId: 'br-bayern', destination: { kind: 'project', name: 'KST-BS-02', detail: 'Hauptlagerplatz Bayern' }, tracker: 'syniotec OBD', imei: '861607001255497', lastSignal: '2026-11-22T14:10', location: 'Hauptlagerplatz 1, 85748 Garching' },
  { id: 'eq-6', inventoryNumber: 'Q600', title: 'ABB RA 280TE', categoryId: 'cat-articulated-truck', branchId: 'br-dresden', destination: { kind: 'project', name: 'ProjTest', detail: 'Current project' }, tracker: 'syniotec CORE', imei: '861607001255505', lastSignal: '2026-11-23T21:10', location: 'Königsbrücker Straße 96, 01099 Dresden' },
  { id: 'eq-7', inventoryNumber: '20502026-2', title: 'NEW EQU-1', categoryId: 'cat-earthmoving', branchId: 'br-kanalbau-augsburg', destination: { kind: 'warehouse', name: 'Warehouse 02', detail: 'Augsburg, Germany' }, tracker: null, imei: null, lastSignal: '2026-11-18T08:44', location: 'Haunstetter Straße 112, 86161 Augsburg' },
  { id: 'eq-8', inventoryNumber: '12451B88', title: '2013 Caterpillar ZX350LC-5N', categoryId: 'cat-heavy-dozer', branchId: 'br-tiefbau-muenchen', destination: { kind: 'project', name: 'Construction Site A', detail: 'München, Germany' }, tracker: 'syniotec DOT Mini', imei: '861607001255513', lastSignal: '2026-11-24T10:16', location: 'Leopoldstraße 50, 80802 München' },
  { id: 'eq-9', inventoryNumber: 'R-007', title: 'Liebherr L 507', categoryId: 'cat-wheel-loader', branchId: 'br-bremen', destination: { kind: 'rental', name: 'Rental Contract R-2026-17', detail: 'External equipment rental' }, tracker: 'syniotec VOLT', imei: '861607001255521', lastSignal: null, location: null },
  { id: 'eq-10', inventoryNumber: 'CH-00012', title: 'Concrete Mixer Truck', categoryId: 'cat-concrete-mixer', branchId: 'br-hochbau-regensburg', destination: { kind: 'rental', name: 'RA2025-138', detail: 'Am Fallhammer 18-20, Düsseldorf' }, tracker: 'syniotec CORE', imei: '861607001255539', lastSignal: '2026-11-24T09:53', location: 'Am Fallhammer 18-20, 40221 Düsseldorf' },
  { id: 'eq-11', inventoryNumber: 'ZZ-00033', title: 'Takeuchi TB216A', categoryId: 'cat-scaffolding', branchId: 'br-dresden', destination: { kind: 'warehouse', name: 'Warehouse Dresden', detail: 'Dresden, Germany' }, tracker: 'syniotec DOT', imei: '861607001255547', lastSignal: '2026-11-23T09:14', location: 'Löbtauer Straße 70, 01159 Dresden' },
  { id: 'eq-12', inventoryNumber: '2701-2', title: 'Reg 27.01-2', categoryId: 'cat-self-loader', branchId: 'br-bayern', destination: { kind: 'project', name: 'KST-HB-01', detail: 'Construction project' }, tracker: 'syniotec OBD', imei: '861607001255554', lastSignal: '2026-11-23T17:15', location: 'Rosenheimer Straße 145, 81671 München' },
];
