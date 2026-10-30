/*
 * Outline icons for the Suitable-for bar, from Tabler Icons (MIT, https://tabler.io/icons). Syn's own set has no
 * construction machines or vehicles, so these fill the gap. Only the picture is chosen here; every label stays the
 * product's own "Suitable for" text. Drawn like syniotec.com's icons: thin black lines with one detail in brand red.
 */
const paths: Record<string, string[]> = {
  bulldozer: ['M2 17a2 2 0 1 0 4 0a2 2 0 0 0 -4 0', 'M12 17a2 2 0 1 0 4 0a2 2 0 0 0 -4 0', 'M19 13v4a2 2 0 0 0 2 2h1', 'M14 19h-10', 'M4 15h10', 'M9 11v-5h2a3 3 0 0 1 3 3v6', 'M5 15v-3a1 1 0 0 1 1 -1h8', 'M19 17h-3'],
  backhoe: ['M2 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M11 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M13 19l-9 0', 'M4 15l9 0', 'M8 12v-5h2a3 3 0 0 1 3 3v5', 'M5 15v-2a1 1 0 0 1 1 -1h7', 'M21.12 9.88l-3.12 -4.88l-5 5', 'M21.12 9.88a3 3 0 0 1 -2.12 5.12a3 3 0 0 1 -2.12 -.88l4.24 -4.24'],
  forklift: ['M3 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M12 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M7 17l5 0', 'M3 17v-6h13v6', 'M5 11v-4h4', 'M9 11v-6h4l3 6', 'M22 15h-3v-10', 'M16 13l3 0'],
  crane: ['M6 21h6', 'M9 21v-18l-6 6h18', 'M9 3l10 6', 'M17 9v4a2 2 0 1 1 -2 2'],
  engine: ['M3 10v6', 'M12 5v3', 'M10 5h4', 'M5 13h-2', 'M6 10h2l2 -2h3.382a1 1 0 0 1 .894 .553l1.448 2.894a1 1 0 0 0 .894 .553h1.382v-2h2a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-2v-2h-3v2a1 1 0 0 1 -1 1h-3.465a1 1 0 0 1 -.832 -.445l-1.703 -2.555h-2v-6'],
  caravan: ['M7 18a2 2 0 1 0 4 0a2 2 0 0 0 -4 0', 'M11 18h7a2 2 0 0 0 2 -2v-7a2 2 0 0 0 -2 -2h-9.5a5.5 5.5 0 0 0 -5.5 5.5v3.5a2 2 0 0 0 2 2h2', 'M8 7l7 -3l1 3', 'M13 11.5a.5 .5 0 0 1 .5 -.5h2a.5 .5 0 0 1 .5 .5v2a.5 .5 0 0 1 -.5 .5h-2a.5 .5 0 0 1 -.5 -.5l0 -2', 'M20 16h2'],
  container: ['M20 4v.01', 'M20 20v.01', 'M20 16v.01', 'M20 12v.01', 'M20 8v.01', 'M8 5a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1l0 -14', 'M4 4v.01', 'M4 20v.01', 'M4 16v.01', 'M4 12v.01', 'M4 8v.01'],
  shovel: ['M17 4l3 3', 'M18.5 5.5l-8 8', 'M8.276 11.284l4.44 4.44a.968 .968 0 0 1 0 1.369l-2.704 2.704a4.108 4.108 0 0 1 -5.809 -5.81l2.704 -2.703a.968 .968 0 0 1 1.37 0l-.001 0'],
  package: ['M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5', 'M12 12l8 -4.5', 'M12 12l0 9', 'M12 12l-8 -4.5', 'M16 5.25l-8 4.5'],
  'truck-delivery': ['M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M5 17h-2v-4m-1 -8h11v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5', 'M3 9l4 0'],
  car: ['M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5'],
  truck: ['M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5'],
  'truck-loading': ['M2 3h1a2 2 0 0 1 2 2v10a2 2 0 0 0 2 2h15', 'M9 9a3 3 0 0 1 3 -3h4a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-4a3 3 0 0 1 -3 -3l0 -2', 'M7 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M16 19a2 2 0 1 0 4 0a2 2 0 1 0 -4 0'],
  tools: ['M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4', 'M14.5 5.5l4 4', 'M12 8l-5 -5l-4 4l5 5', 'M7 8l-1.5 1.5', 'M16 12l5 5l-4 4l-5 -5', 'M16 17l-1.5 1.5'],
  link: ['M9 15l6 -6', 'M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464', 'M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463'],
  'steering-wheel': ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M10 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M12 14l0 7', 'M10 12l-6.75 -2', 'M14 12l6.75 -2'],
  tractor: ['M3 15a4 4 0 1 0 8 0a4 4 0 1 0 -8 0', 'M7 15l0 .01', 'M17 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M10.5 17l6.5 0', 'M20 15.2v-4.2a1 1 0 0 0 -1 -1h-6l-2 -5h-6v6.5', 'M18 5h-1a1 1 0 0 0 -1 1v4'],
  'car-crane': ['M3 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M7 18h8m4 0h2v-6a5 5 0 0 0 -5 -5h-1l1.5 5h4.5', 'M12 18v-11h3', 'M3 17v-5h9', 'M4 12v-6l18 -3v2', 'M8 12v-4l-4 -2'],
  all: ['M4 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4', 'M14 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4', 'M4 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4', 'M14 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4'],
};

/** Which paths of each icon are the red detail, by index into `paths`. */
const accents: Record<string, number[]> = {
  bulldozer: [2], backhoe: [6, 7], forklift: [6, 7], crane: [3], engine: [1, 2], caravan: [3],
  container: [0, 2, 3, 4], shovel: [2], package: [4], 'truck-delivery': [3], car: [1], truck: [1],
  'truck-loading': [1], tools: [4, 5], link: [0], 'steering-wheel': [1], tractor: [2], 'car-crane': [5], all: [1],
};

/** Picture for each Suitable-for value; the first matching rule wins, so specific phrases come before general ones. */
const rules: Array<[RegExp, string]> = [
  [/driver cab/i, 'steering-wheel'],
  [/passenger car/i, 'car'],
  [/service vehicle/i, 'truck-delivery'],
  [/tractor unit/i, 'truck-loading'],
  [/^trucks?$/i, 'truck'],
  [/agricultural/i, 'tractor'],
  [/machinery & vehicles/i, 'car-crane'],
  [/large equipment/i, 'bulldozer'],
  [/construction machinery/i, 'backhoe'],
  [/special machines/i, 'crane'],
  [/lifting/i, 'forklift'],
  [/pump|generator/i, 'engine'],
  [/trailer/i, 'caravan'],
  [/container/i, 'container'],
  [/attachments & medium/i, 'shovel'],
  [/mobile assets/i, 'package'],
  [/tools/i, 'tools'],
  [/chain/i, 'link'],
];

export function TermIcon({ term, size = 32 }: { term: string | null; size?: number }) {
  const key = term === null ? 'all' : rules.find(([re]) => re.test(term))?.[1] ?? 'all';
  return (
    <svg className="shop-term-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths[key].map((d, i) => <path key={d} d={d} className={accents[key]?.includes(i) ? 'shop-term-icon__accent' : undefined} />)}
    </svg>
  );
}
