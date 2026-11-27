import { useMemo, useRef, useState } from 'react';
import qrcode from 'qrcode-generator';
import { Dialog, DropdownPanel, Icon, type IconName } from '@syn/design-system';
import { FilterPopover } from './Popover';
import { signalRecency } from './logic';
import type { EquipmentRecord, DestinationKind } from './types';

export const EMPTY = '—';

const destinationIcon: Record<DestinationKind, { icon: IconName; label: string }> = {
  project: { icon: 'project-contract', label: 'Project' },
  warehouse: { icon: 'nav-warehouse', label: 'Warehouse' },
  rental: { icon: 'file', label: 'Rental' },
};

/** Current Project / Warehouse / Rental: the kind's icon, the name and, muted, the detail. */
export function DestinationCell({ value }: { value: EquipmentRecord['destination'] }) {
  if (!value) return <span className="seq-empty">{EMPTY}</span>;
  const k = destinationIcon[value.kind];
  return (
    <span className="seq-dest">
      <span className="seq-dest__icon" title={k.label}><Icon name={k.icon} size={14} /><span className="syn-visually-hidden">{k.label}:</span></span>
      <span className="seq-dest__text">
        <span className="seq-dest__name">{value.name}</span>
        {value.detail && <span className="seq-dest__detail"> ({value.detail})</span>}
      </span>
    </span>
  );
}

/** A QR code drawn as SVG (black modules on white), sized by `size`. */
export function QrCode({ value, size }: { value: string; size: number }) {
  const path = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(value);
    qr.make();
    const n = qr.getModuleCount();
    let d = '';
    for (let r = 0; r < n; r += 1) for (let c = 0; c < n; c += 1) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    return { d, n };
  }, [value]);
  return (
    <svg width={size} height={size} viewBox={`-1 -1 ${path.n + 2} ${path.n + 2}`} shapeRendering="crispEdges" aria-hidden>
      <rect x={-1} y={-1} width={path.n + 2} height={path.n + 2} fill="#fff" />
      <path d={path.d} fill="#151515" />
    </svg>
  );
}

/** Tracker IMEI: the QR (opens enlarged) and the number. */
export function ImeiCell({ imei, tracker }: { imei: string | null; tracker: string | null }) {
  const [open, setOpen] = useState(false);
  if (!imei) return <span className="seq-empty">{EMPTY}</span>;
  return (
    <span className="seq-imei">
      <button type="button" className="seq-imei__qr" aria-label={`View QR for IMEI ${imei}`} onClick={() => setOpen(true)}>
        <QrCode value={imei} size={32} />
      </button>
      <span className="seq-mono">{imei}</span>
      <Dialog
        open={open} onClose={() => setOpen(false)} title="Tracker IMEI · QR" icon={null} className="seq-qr-dialog"
      >
        {tracker && <p className="seq-qr-dialog__tracker">{tracker}</p>}
        <QrCode value={imei} size={220} />
        <p className="seq-mono seq-qr-dialog__imei">{imei}</p>
      </Dialog>
    </span>
  );
}

const recencyLabel = { recent: 'Recent signal', stale: 'No signal for over 12 hours', old: 'No signal for over 24 hours', none: 'No signal' };

/** Fleet Database date-time: "1 Mar 2025 8:47". */
export function formatDateTime(iso: string) {
  const d = new Date(iso);
  const month = d.toLocaleString('en-GB', { month: 'short' });
  return `${d.getDate()} ${month} ${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Last Signal: the recency dot and the date-time (1 Mar 2025 8:47). */
export function SignalCell({ iso, now }: { iso: string | null; now: number }) {
  const r = signalRecency(iso, now);
  if (!iso) return <span className="seq-empty">No signal</span>;
  return (
    <span className="seq-signal" title={recencyLabel[r]}>
      <span aria-hidden className={`seq-signal__dot is-${r}`} />
      <time dateTime={iso}>{formatDateTime(iso)}</time>
      <span className="syn-visually-hidden">({recencyLabel[r]})</span>
    </span>
  );
}

/** Current Location: the Fleet Database "See location" button; the address opens in a small panel. */
export function LocationCell({ record }: { record: EquipmentRecord }) {
  const btn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  if (!record.location) return <span className="seq-empty">{EMPTY}</span>;
  return (
    <>
      <button ref={btn} type="button" className="seq-location" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name="pin" size={14} />
        See location
      </button>
      {open && btn.current && (
        <FilterPopover anchor={btn.current} label={`Current location · ${record.inventoryNumber}`} onClose={() => setOpen(false)} width={300}>
          <DropdownPanel className="seq-location__panel">
            <p className="seq-location__address">{record.location}</p>
            {record.lastSignal && <p className="seq-location__hint">From the last signal, {formatDateTime(record.lastSignal)}</p>}
            <a
              className="seq-location__map" target="_blank" rel="noreferrer"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.location)}`}
            >
              Open in Google Maps
            </a>
          </DropdownPanel>
        </FilterPopover>
      )}
    </>
  );
}
