/** Mock data from the Figma frames, to be replaced by the API. */
import geofenceIcon from './assets/alert-geofence-exit.png';
import workingHoursIcon from './assets/alert-outside-working-hours.png';
import powerIcon from './assets/alert-power-disconnected.png';

export type AlertType = 'geofence-exit' | 'outside-working-hours' | 'power-disconnected';
/** Figma "Type" switcher of the Geofence Exit alert. */
export type GeofenceKind = 'geofence' | 'warehouse' | 'project' | 'area';
export type AlertStatus = 'active' | 'disabled';

export const alertTypes: Record<AlertType, { label: string; icon: string; description: string }> = {
  'geofence-exit': {
    label: 'Geofence Exit',
    icon: geofenceIcon,
    description: 'Receive an email when selected equipment leaves a manually drawn geofence.',
  },
  'outside-working-hours': {
    label: 'Outside Working Hours',
    icon: workingHoursIcon,
    description: 'Receive an email when selected equipment is working outside its allowed schedule.',
  },
  'power-disconnected': {
    label: 'Power Disconnected',
    icon: powerIcon,
    description: 'Receive an email when external beacon power becomes unavailable or disconnected.',
  },
};
export const alertTypeOrder: AlertType[] = ['geofence-exit', 'outside-working-hours', 'power-disconnected'];

export const geofenceKinds: { value: GeofenceKind; label: string; field?: string }[] = [
  { value: 'geofence', label: 'Geofence Exit' },
  { value: 'warehouse', label: 'Warehouse exit', field: 'Warehouse' },
  { value: 'project', label: 'Project/Contract exit', field: 'Project/Contract' },
  { value: 'area', label: 'Area exit', field: 'Area' },
];

export const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export interface DayHours { on: boolean; from: string; to: string }
export type WorkingHours = DayHours[];
export const emptyWorkingHours = (): WorkingHours => weekdays.map(() => ({ on: false, from: '', to: '' }));
/** "Standard Work week": Monday to Friday, 08:00–17:00. */
export const standardWorkWeek = (): WorkingHours =>
  weekdays.map((_, i) => (i < 5 ? { on: true, from: '08:00', to: '17:00' } : { on: false, from: '', to: '' }));

export interface Equipment {
  id: string;
  name: string;
  listing: string;
  inventory: string;
  category: string;
  tag: string;
  tagCount: number;
  status: string;
  structure: string;
  crew: string;
  branch: string;
  project: string;
  projectSite: string;
  beacon: string;
  imei: string;
  lastSignal: string;
  available: boolean;
}

const models = [
  'Caterpilar 26B', 'Caterpilar 26C', 'JCB 3CX', 'Komatsu PC210', 'Volvo EC950F', 'Hitachi ZX350', 'Doosan DX225',
  'CASE CX210', 'Bobcat E165', 'Liebherr R 926', 'Manitou MT 1440', 'SANY SY215', 'New Holland E85C', 'Terex TC55', 'Kubota KX057',
];
const vendors = [
  'syniotec-obd', 'syniotec-obd', 'jcb-uk', 'komatsu-global', 'volvo-construction', 'hitachi-global', 'doosan-infra',
  'case-construction', 'bobcat-companies', 'liebherr-group', 'manitou-group', 'sany-group', 'new-holland', 'terex-corporation', 'kubota-corp',
];
const categories = ['Heavy Crawler', 'Backhoe Loader', 'Excavator', 'Telehandler', 'Mini Excavator'];
const branches = ['Bremen', 'Hamburg', 'Berlin'];

export const equipment: Equipment[] = models.map((name, i) => ({
  id: `eq-${i + 1}`,
  name,
  listing: 'Listing Title',
  inventory: `INV-${String(i + 1).padStart(3, '0')}`,
  category: categories[i % categories.length],
  tag: 'Dump Truck',
  tagCount: 3,
  status: 'Operational',
  structure: 'Lower Saxony',
  crew: 'Dream Team',
  branch: branches[i % branches.length],
  project: 'Bremen',
  projectSite: 'Halensee Roadworks',
  beacon: vendors[i],
  imei: String(868373071229621 + i),
  lastSignal: '1 Mar 2025 8:47',
  available: i % 5 !== 3,
}));

export const beaconVendors = [...new Set(vendors)].map((v) => ({ value: v, label: v }));

export const recipients = [
  'MaxMustermann@gmail.com', 'AnnaSchmidt@yahoo.com', 'PeterMüller@hotmail.com', 'SophieMeier@outlook.com',
  'LukasSchneider@gmail.com', 'EmilyFischer@icloud.com', 'TobiasWeber@live.com', 'JuliaHoffmann@gmail.com',
  'MichaelWagner@yahoo.com', 'LauraKlein@hotmail.com', 'KevinRichter@outlook.com', 'NinaSchmitt@icloud.com',
  'JonasBauer@gmail.com', 'ClaraZimmermann@yahoo.com', 'FelixKrause@hotmail.com',
];

export interface Place {
  id: string;
  name: string;
  code?: string;
  department: string;
  location: string;
  responsible: string;
  dates?: string;
  /** Centre of the place's geofence on the map. */
  center: [number, number];
}

export const warehouses: Place[] = [
  { id: 'wh-1', name: 'Bremen Lagerplatz', department: 'Lower Saxony', location: 'Bremen Am Wall', responsible: 'Max Mustermann', center: [53.0758, 8.8072] },
  { id: 'wh-2', name: 'Achim Depot', department: 'Lower Saxony', location: 'Achim Bahnhofstraße', responsible: 'Anna Schmidt', center: [53.0137, 9.0263] },
];
export const projects: Place[] = [
  { id: 'pr-1', name: 'Bremen Roadworks', code: 'CC12', department: 'Lower Saxony', location: 'Bremen Am Wall', responsible: 'Max Mustermann', dates: '01.01.2028 – 01.01.2028', center: [53.0793, 8.8017] },
  { id: 'pr-2', name: 'Halensee Roadworks', code: 'CC14', department: 'Berlin', location: 'Berlin Halensee', responsible: 'Peter Müller', dates: '01.02.2028 – 30.06.2028', center: [53.12, 8.73] },
];
export const areas: Place[] = [
  { id: 'ar-1', name: 'Bremen Roadworks', code: 'CC12', department: 'Lower Saxony', location: 'Bremen Am Wall', responsible: 'Max Mustermann', center: [53.0793, 8.8017] },
  { id: 'ar-2', name: 'Osterholz Area', code: 'CC20', department: 'Lower Saxony', location: 'Osterholz-Scharmbeck', responsible: 'Lukas Schneider', center: [53.2275, 8.7947] },
];
export const placesFor: Record<Exclude<GeofenceKind, 'geofence'>, Place[]> = { warehouse: warehouses, project: projects, area: areas };

export interface Alert {
  id: string;
  name: string;
  createdAt: string;
  type: AlertType;
  geofenceKind?: GeofenceKind;
  placeId?: string;
  /** Drawn geofence, [lat, lng] points. */
  polygon?: [number, number][];
  equipment: string[];
  recipients: string[];
  workingHours?: WorkingHours;
  beaconVendors?: string[];
  status: AlertStatus;
}

const pick = <T,>(list: T[], start: number, count: number) => Array.from({ length: count }, (_, k) => list[(start + k) % list.length]);

export const initialAlerts: Alert[] = Array.from({ length: 15 }, (_, i) => {
  const type = alertTypeOrder[i % 3];
  return {
    id: `al-${i + 1}`,
    name: `${alertTypes[type].label} ${i + 1}`,
    createdAt: '2028-01-01T14:14',
    type,
    geofenceKind: type === 'geofence-exit' ? 'geofence' : undefined,
    equipment: pick(equipment, i, 4 + (i % 5)).map((e) => e.id),
    recipients: pick(recipients, i, 1 + ((i * 2) % 6)),
    workingHours: type === 'outside-working-hours' ? standardWorkWeek() : undefined,
    beaconVendors: type === 'power-disconnected' ? [vendors[i % vendors.length]] : undefined,
    status: i === 3 ? 'disabled' : 'active',
  };
});

export interface AlertEvent {
  id: string;
  at: string;
  equipmentId: string;
  type: AlertType;
  rule: string;
  details: string;
}

const sites = ['Bremen', 'Hamburg', 'Berlin', 'Munich', 'Cologne', 'Stuttgart', 'Düsseldorf', 'Frankfurt', 'Leipzig', 'Dresden', 'Nuremberg', 'Hanover', 'Essen', 'Bonn', 'Aachen'];
const details = ['Manager', 'Assistant', 'Developer', 'Designer', 'Product Owner', 'Marketing Specialist', 'Sales Executive', 'Data Analyst', 'Customer Support', 'HR Coordinator', 'Quality Assurance', 'UI/UX Researcher', 'Content Strategist', 'SEO Specialist', 'Social Media Manager'];

export const alertHistory: AlertEvent[] = equipment.map((e, i) => ({
  id: `ev-${i + 1}`,
  at: '2028-01-01T14:14',
  equipmentId: e.id,
  type: alertTypeOrder[i % 3],
  rule: `${sites[i]} Site`,
  details: details[i],
}));

export const equipmentById = (id: string) => equipment.find((e) => e.id === id);

/** "01.01.2028" and "14:14" from an ISO local date-time. */
export function splitDateTime(iso: string) {
  const [date, time] = iso.split('T');
  const [y, m, d] = date.split('-');
  return { date: `${d}.${m}.${y}`, time: time.slice(0, 5) };
}
