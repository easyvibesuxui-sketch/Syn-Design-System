import { useMemo, useState } from 'react';
import { EmptyState, Table, TextField, type TableColumn } from '@syn/design-system';
import { AlertTypeLabel, DateTime } from './AlertParts';
import { alertTypes, equipmentById, type AlertEvent } from './data';

/** Alert History tab (Figma 13594:31643, empty 13594:31122): every alert that fired, newest first. */
export function AlertHistoryTab({ events }: { events: AlertEvent[] }) {
  const [query, setQuery] = useState('');
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((ev) => {
      const e = equipmentById(ev.equipmentId);
      return [e?.title, e?.inventoryNumber, e?.tracker, e?.imei, alertTypes[ev.type].label, ev.rule, ev.details]
        .some((v) => v?.toLowerCase().includes(q));
    });
  }, [events, query]);

  const columns: TableColumn<AlertEvent>[] = [
    { key: 'at', header: 'Date/time', width: '20%', render: (ev) => <DateTime iso={ev.at} /> },
    {
      key: 'equipment', header: 'Equipment', width: '20%',
      render: (ev) => {
        const e = equipmentById(ev.equipmentId);
        if (!e) return ev.equipmentId;
        return (
          <span className="sam-nc-equipment">
            <span className="sam-nc-equipment__name">{e.title}</span>
            <span className="sam-nc-equipment__meta">{[e.inventoryNumber, e.tracker ?? 'No tracker', e.imei].filter(Boolean).join(' · ')}</span>
          </span>
        );
      },
    },
    { key: 'type', header: 'Type', width: '20%', render: (ev) => <AlertTypeLabel type={ev.type} /> },
    { key: 'rule', header: 'Rule', width: '20%' },
    { key: 'details', header: 'Trigger details' },
  ];

  return (
    <div className="sam-nc-list">
      <div className="sam-nc-toolbar">
        <div className="sam-nc-toolbar__filters">
          <TextField
            label="Search alert history" hideLabel size="sm" iconStart="search" placeholder="Search" className="sam-nc-search"
            value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery('')}
          />
        </div>
      </div>
      {rows.length ? (
        <Table caption="Alert history" striped className="sam-nc-table" columns={columns} rows={rows} rowKey={(ev) => ev.id} />
      ) : (
        <div className="sam-nc-empty">
          <Table caption="Alert history" className="sam-nc-table sam-nc-table--head" columns={columns} rows={[]} rowKey={(ev) => ev.id} />
          <EmptyState variant="general" className="sam-nc-empty__state">{query ? 'No alerts match the search' : 'List is empty'}</EmptyState>
        </div>
      )}
    </div>
  );
}
