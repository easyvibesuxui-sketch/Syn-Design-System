import tagL from './assets/tag-l.webp';
import tagM from './assets/tag-m.webp';
import tagS from './assets/tag-s.webp';
import tagQr from './assets/tag-qr.webp';
import toolTags from './assets/tool-tags.webp';
import chainTag from './assets/chain-tag.webp';
import tagCollage from './assets/tag-collage.webp';

export { tagCollage };

export type Category = 'Hardware' | 'Tags';
/** The built-in illustration shown when a product has no image or the image fails to load. */
export type ArtType = 'hardware' | 'dot' | 'tags' | 'tool' | 'chain' | 'qr';
export type Availability = 'Available' | 'Available on request' | 'Temporarily unavailable';
export type OrderStatus = 'Submitted' | 'Confirmed' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';

export interface Product {
  id: string;
  name: string;
  category: Category;
  type: ArtType;
  /** EUR excl. VAT; 0 means "price on request". */
  price: number;
  active: boolean;
  availability: Availability;
  short: string;
  description: string;
  features: string[];
  specs: Array<[string, string]>;
  docs: string[];
  image: string;
  gallery: string[];
}

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  type: ArtType;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  time: string;
  orderedBy: string;
  contactName: string;
  email: string;
  phone: string;
  org: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  address: string;
  billing: string;
  reference: string;
  comment: string;
  internalNote: string;
  history: Array<[OrderStatus, string]>;
}

/** A request for a price on a product that has none yet ("Price on request"). */
export interface PriceRequest {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  note: string;
  date: string;
  requestedBy: string;
}

export interface CartLine {
  productId: string;
  qty: number;
}

export const CURRENT_USER = { name: 'John Smith', company: 'Demo Construction GmbH' };
export const ORDER_STAGES: OrderStatus[] = ['Submitted', 'Confirmed', 'Processing', 'Shipped', 'Completed'];
export const ORDER_STATUSES: OrderStatus[] = [...ORDER_STAGES, 'Cancelled'];
export const AVAILABILITIES: Availability[] = ['Available', 'Available on request', 'Temporarily unavailable'];
export const COUNTRIES = ['Germany', 'Austria', 'Switzerland', 'Netherlands', 'Belgium', 'France', 'Other'];

const sam = (file: string) => `https://sam.dev.syniotec.com/assets/img/${file}`;
export const hardwareImages = { edge: sam('syniotec%20EDGE.png'), link: sam('syniotec%20LINK.png'), dot: sam('syniotec%20DOT.png') };

function hardware(p: Omit<Product, 'category' | 'active' | 'gallery' | 'type'> & { type?: ArtType }): Product {
  return { category: 'Hardware', active: true, type: 'hardware', gallery: [], ...p };
}
function tag(p: Omit<Product, 'category' | 'active' | 'docs'>): Product {
  return { category: 'Tags', active: true, docs: ['Technical data sheet for PASSIVE Telematics'], ...p };
}

const tagFeatures = ['QR code', 'NFC scan', 'Quick and easy installation', 'Direct access to the equipment profile'];
const tagSpecs = (variant: string): Array<[string, string]> => [
  ['Suitable for', 'Construction machinery and large equipment'], ['Access', 'QR code & NFC scan'], ['Variant', variant],
];
const tagDescription = 'Passive telematics tag for direct access to the individual equipment profile using QR and NFC.';

export const defaultProducts: Product[] = [
  hardware({
    id: 'EDGE', name: 'EDGE', price: 199, availability: 'Available',
    short: 'Telematics for construction machinery',
    description: 'Full overview of your construction machinery with live tracking and machine data directly in the syniotec platform.',
    features: ['Live tracking & CAN bus vehicle data', 'Operating hours & usage evaluation', 'Designed for powered construction machinery'],
    specs: [['Suitable for', 'Construction machinery, lifting technology, special machines, pumps & generators'], ['Power supply', '8 V to 32 V DC'], ['Water resistance', 'IP67']],
    docs: ['Technical data sheet', 'Instructions for installing EDGE'],
    image: hardwareImages.edge,
  }),
  hardware({
    id: 'LINK', name: 'LINK', price: 159, availability: 'Available',
    short: 'Telematics for attachments & devices without power supply',
    description: 'Tracking for attachments and devices that do not have their own permanent power supply.',
    features: ['GPS tracking without a fixed power connection', 'Replaceable batteries', 'Designed for attachments, trailers and medium-sized equipment'],
    specs: [['Suitable for', 'Trailers, containers, attachments & medium-sized devices'], ['Power', 'Replaceable batteries'], ['Connectivity', 'LTE-M / NB-IoT']],
    docs: ['Technical data sheet LINK', 'Technical data sheet LINK Mini'],
    image: hardwareImages.link,
  }),
  hardware({
    id: 'LINK-MINI', name: 'LINK mini', price: 0, availability: 'Available on request',
    short: 'Compact telematics for attachments & devices without power supply',
    description: 'Compact LINK variant for assets without a fixed power source.',
    features: ['GPS tracking without a fixed power connection', 'Replaceable battery concept', 'Compact form factor'],
    specs: [['Suitable for', 'Attachments & smaller mobile assets'], ['Product family', 'LINK'], ['Variant', 'LINK mini']],
    docs: ['Technical data sheet LINK Mini'],
    image: sam('syniotec%20LINK%20mini.png'),
  }),
  hardware({
    id: 'DOT', name: 'DOT', type: 'dot', price: 49, availability: 'Available',
    short: 'BLE Beacon for small machines & devices',
    description: 'Keep an eye on equipment without its own power supply using Bluetooth tracking in the syniotec platform.',
    features: ['Track equipment without a power supply', 'Installation in 3-4 minutes', 'Ideal for tools, attachments & small appliances'],
    specs: [['Housing material', 'ABS plastic'], ['Size (L×W×H)', 'Ø 46 × 40 × 18 mm'], ['Weight', '24 g ± 1 g'], ['Waterproof', 'according to IP67'], ['Bluetooth®', 'BLE 5.1'], ['NFC', 'supported']],
    docs: ['Technical data sheet', 'Instructions for installing DOT'],
    image: hardwareImages.dot,
  }),
  hardware({
    id: 'DOT-MINI', name: 'DOT mini', type: 'dot', price: 0, availability: 'Available on request',
    short: 'Compact BLE beacon for small equipment & devices',
    description: 'Compact DOT variant for Bluetooth-based equipment identification and tracking.',
    features: ['Bluetooth beacon', 'Compact form factor', 'For small equipment and devices'],
    specs: [['Product family', 'DOT'], ['Variant', 'DOT mini'], ['Type', 'BLE beacon']],
    docs: [],
    image: sam('syniotec%20DOT%20mini.png'),
  }),
  hardware({
    id: 'LITE', name: 'LITE', price: 0, availability: 'Available on request',
    short: 'Compact Syniotec telematics hardware',
    description: 'Compact telematics hardware for connected equipment and asset tracking.',
    features: ['Compact hardware', 'Equipment tracking', 'Syniotec platform integration'],
    specs: [['Product', 'LITE'], ['Category', 'Telematics hardware']],
    docs: [],
    image: sam('LITE.png'),
  }),
  hardware({
    id: 'VOLT', name: 'VOLT', price: 189, availability: 'Available',
    short: 'Telematics for trailers & mobile machines',
    description: 'Tracking for mobile assets with their own power supply or without a permanent fixed connection.',
    features: ['Live tracking & operating-hours recording', 'Long battery life without external power', 'Suitable for trailers and mobile machines'],
    specs: [['Suitable for', 'Trailers, lifting technology, construction & agricultural machinery'], ['Connectivity', 'LTE CAT M1/NB1 with 2G fallback'], ['Bluetooth®', 'BLE 5.0']],
    docs: ['Technical data sheet', 'Instructions for installing VOLT'],
    image: sam('syniotec%20VOLT.png'),
  }),
  hardware({
    id: 'OBD', name: 'OBD', price: 129, availability: 'Available',
    short: 'Telematics for passenger cars',
    description: 'Vehicle tracking and diagnostic data directly through the OBD-II interface.',
    features: ['CAN bus vehicle data', 'Plug-and-play installation', 'Designed for passenger cars and light commercial vehicles'],
    specs: [['Suitable for', 'Passenger cars, company & service vehicles'], ['Power supply', '10 V to 30 V DC'], ['Bluetooth®', 'Bluetooth® 4.0 + Low Energy']],
    docs: ['Technical data sheet'],
    image: sam('syniotec-obd.png'),
  }),
  hardware({
    id: 'CORE', name: 'CORE', price: 249, availability: 'Available',
    short: 'Telematics for trucks',
    description: 'Robust telematics for commercial vehicles with live tracking, CAN bus information and vehicle-use data.',
    features: ['Live tracking & CAN bus vehicle data', 'Tachograph and vehicle information', 'Designed for trucks and heavy commercial vehicles'],
    specs: [['Suitable for', 'Trucks, tractor units & special machines'], ['Connectivity', 'LTE CAT1 with 2G fallback'], ['Bluetooth®', 'BLE 5.2']],
    docs: [],
    image: sam('syniotec%20CORE.png'),
  }),
  hardware({
    id: 'SOLAR', name: 'SOLAR', price: 219, availability: 'Available',
    short: 'Telematics for mobile storage units',
    description: 'Solar-powered tracking for mobile assets without a fixed power supply.',
    features: ['Integrated solar energy supply', 'GPS tracking & alarm functions', 'Designed for containers, trailers and mobile infrastructure'],
    specs: [['Suitable for', 'Trailers, containers, pumps & generators'], ['Internal battery', 'Li-Polymer 7500 mAh / 3.6 V'], ['Water resistance', 'IP67']],
    docs: ['Technical data sheet', 'Instructions for installing SOLAR'],
    image: sam('syniotec-solar.png'),
  }),
  hardware({
    id: 'DASHCAM', name: 'DASHCAM', price: 199, availability: 'Available',
    short: 'Dashcam for construction machinery & vehicles',
    description: 'Video-based documentation for journeys, incidents and vehicle use with integration into the syniotec platform.',
    features: ['Live video & event recording', 'GNSS tracking', 'Integration into the syniotec platform'],
    specs: [['Suitable for', 'Construction machinery & vehicles'], ['Tracking', 'Integrated GNSS'], ['Recording', 'Video & audio']],
    docs: [],
    image: sam('dashcam-cam.png'),
  }),
  tag({
    id: 'TAG-L', name: 'TAG L', type: 'tags', price: 24.9, availability: 'Available',
    short: 'For construction machinery and large equipment', description: tagDescription,
    features: tagFeatures, specs: tagSpecs('TAG L'), image: tagL, gallery: [tagM, tagS, tagCollage],
  }),
  tag({
    id: 'TAG-M', name: 'TAG M', type: 'tags', price: 21.9, availability: 'Available',
    short: 'For construction machinery and large equipment', description: tagDescription,
    features: tagFeatures, specs: tagSpecs('TAG M'), image: tagM, gallery: [tagL, tagS, tagCollage],
  }),
  tag({
    id: 'TAG-S', name: 'TAG S', type: 'tags', price: 18.9, availability: 'Available',
    short: 'For construction machinery and large equipment', description: tagDescription,
    features: tagFeatures, specs: tagSpecs('TAG S'), image: tagS, gallery: [tagM, tagL, tagCollage],
  }),
  tag({
    id: 'TOOL-TAGS', name: 'TOOL-TAGS', type: 'tool', price: 9.9, availability: 'Available',
    short: 'For tools and small equipment',
    description: 'A passive telematics variant for tools and small equipment with direct access to the equipment profile.',
    features: ['For tools and small equipment', 'Direct equipment-profile access', 'Part of Syniotec passive telematics'],
    specs: [['Suitable for', 'Tools and small equipment'], ['Access', 'Digital equipment profile'], ['Type', 'Passive telematics']],
    image: toolTags, gallery: [tagCollage],
  }),
  tag({
    id: 'CHAIN-TAG', name: 'CHAIN-TAG', type: 'chain', price: 14.9, availability: 'Available on request',
    short: 'For heavy chains',
    description: 'The passive telematics variant for heavy chains, providing access to the associated equipment profile.',
    features: ['For heavy chains', 'Direct equipment-profile access', 'Part of Syniotec passive telematics'],
    specs: [['Suitable for', 'Heavy chains'], ['Access', 'Equipment profile'], ['Type', 'Passive telematics']],
    image: chainTag, gallery: [tagCollage],
  }),
  tag({
    id: 'QR-STICKER', name: 'QR-Sticker', type: 'qr', price: 3.5, availability: 'Available',
    short: 'For QR access to the equipment profile',
    description: 'A passive QR-based option for direct access to the equipment profile.',
    features: ['QR access', 'Quick and easy installation', 'Part of Syniotec passive telematics'],
    specs: [['Suitable for', 'Equipment / driver cab'], ['Access', 'QR code'], ['Type', 'Passive telematics']],
    image: tagQr, gallery: [tagCollage],
  }),
];

export const seedOrders: Order[] = [
  {
    id: 'SO-2026-00124', date: '13.10.2026', time: '14:32', orderedBy: 'John Smith', contactName: 'John Smith',
    email: 'john.smith@example.com', phone: '+49 421 123456', org: 'Demo Construction GmbH',
    items: [
      { id: 'DOT', name: 'DOT', qty: 10, price: 49, type: 'dot', image: hardwareImages.dot },
      { id: 'TOOL-TAGS', name: 'TOOL-TAGS', qty: 20, price: 9.9, type: 'tool', image: toolTags },
    ],
    total: 688, status: 'Processing',
    address: 'Bauhofstraße 18, 28195 Bremen, Germany',
    billing: 'Same as company billing address',
    reference: 'SITE-NORD-042',
    comment: 'Please contact our site manager before delivery.',
    internalNote: 'Invoice draft prepared. Waiting for stock confirmation.',
    history: [['Submitted', '13.10.2026 · 14:32'], ['Confirmed', '13.10.2026 · 16:05'], ['Processing', '14.10.2026 · 09:20']],
  },
  {
    id: 'SO-2026-00118', date: '08.10.2026', time: '11:05', orderedBy: 'Anna Becker', contactName: 'Anna Becker',
    email: 'anna.becker@example.com', phone: '+49 421 654321', org: 'Demo Construction GmbH',
    items: [{ id: 'TAG-S', name: 'TAG S', qty: 15, price: 18.9, type: 'tags', image: tagS }],
    total: 283.5, status: 'Completed',
    address: 'Werk 2, Industriestraße 9, Bremen, Germany',
    billing: 'Same as company billing address',
    reference: 'WAREHOUSE-02', comment: '', internalNote: 'Delivered 10.10.2026.',
    history: [['Submitted', '08.10.2026 · 11:05'], ['Confirmed', '08.10.2026 · 11:40'], ['Processing', '08.10.2026 · 14:15'], ['Shipped', '09.10.2026 · 09:10'], ['Completed', '10.10.2026 · 16:25']],
  },
];

const euro = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });
export const money = (n: number) => euro.format(Number(n) || 0);
export const hasPrice = (p: Pick<Product, 'price'>) => Number(p.price) > 0;
export const priceLabel = (p: Pick<Product, 'price'>) => (hasPrice(p) ? money(p.price) : 'Price on request');
export const canOrder = (p: Product) => p.active && p.availability !== 'Temporarily unavailable' && hasPrice(p);
export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export function stamp(now = new Date()) {
  const two = (n: number) => String(n).padStart(2, '0');
  const date = `${two(now.getDate())}.${two(now.getMonth() + 1)}.${now.getFullYear()}`;
  const time = `${two(now.getHours())}:${two(now.getMinutes())}`;
  return { date, time, both: `${date} · ${time}`, year: now.getFullYear() };
}
