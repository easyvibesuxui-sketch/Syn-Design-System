import { useMemo, useState } from 'react';
import { Button, EmptyState, Select, Table, TextField, type TableColumn } from '@syn/design-system';
import { ActionMenu } from '../../../shared/ActionMenu';
import { AddButton, AlertStatusLabel, AlertTypeLabel, FirstAndMore } from './AlertParts';
import { ChooseAlertTypeDialog } from './ChooseAlertTypeDialog';
import { CreateAlertDrawer } from './CreateAlertDrawer';
import { alertTypeOrder, alertTypes, equipmentById, type Alert, type AlertType } from './data';
import type { AlertStore } from './useAlerts';

const typeOptions = alertTypeOrder.map((t) => ({ value: t, label: alertTypes[t].label }));
const statusOptions = [{ value: 'active', label: 'Active' }, { value: 'disabled', label: 'Disabled' }];

/** Alerts tab (Figma 13594:30615, empty 13555:46442): search, Type and Status filters, the rules table. */
export function AlertsTab({ store }: { store: AlertStore }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [choosing, setChoosing] = useState(false);
  // The drawer: a new alert of a type, or an existing one to edit.
  const [editing, setEditing] = useState<{ type: AlertType; alert?: Alert } | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return store.alerts.filter((a) => (!type || a.type === type) && (!status || a.status === status) && (!q
      || a.name.toLowerCase().includes(q)
      || alertTypes[a.type].label.toLowerCase().includes(q)
      || a.recipients.some((r) => r.toLowerCase().includes(q))
      || a.equipment.some((id) => equipmentById(id)?.name.toLowerCase().includes(q))));
  }, [store.alerts, query, type, status]);

  const columns: TableColumn<Alert>[] = [
    { key: 'name', header: 'Name', width: '20%', render: (a) => <span className="sam-nc-name">{a.name}</span> },
    { key: 'type', header: 'Type', width: '20%', render: (a) => <AlertTypeLabel type={a.type} muted={a.status === 'disabled'} /> },
    {
      key: 'equipment', header: 'Equipment', width: '20%',
      render: (a) => <FirstAndMore label="equipment" items={a.equipment.map((id) => equipmentById(id)?.name ?? id)} />,
    },
    { key: 'recipients', header: 'Recipients', width: '22%', render: (a) => <FirstAndMore label="recipients" items={a.recipients} /> },
    { key: 'status', header: 'Status', render: (a) => <AlertStatusLabel active={a.status === 'active'} /> },
  ];

  const startCreate = () => setChoosing(true);
  const filtered = Boolean(query || type || status);

  return (
    <div className="sam-nc-list">
      <div className="sam-nc-toolbar">
        <div className="sam-nc-toolbar__filters">
          <TextField
            label="Search alerts" hideLabel size="sm" iconStart="search" placeholder="Search" className="sam-nc-search"
            value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery('')}
          />
          <Select label="Type" hideLabel size="sm" placeholder="Type" options={typeOptions} value={type} onChange={setType} onClear={() => setType('')} className="sam-nc-filter" />
          <Select label="Status" hideLabel size="sm" placeholder="Status" options={statusOptions} value={status} onChange={setStatus} onClear={() => setStatus('')} className="sam-nc-filter" />
        </div>
        <AddButton label="Add Alert" onClick={startCreate} />
      </div>

      {rows.length ? (
        <Table
          caption="Alerts" striped className="sam-nc-table" columns={columns} rows={rows} rowKey={(a) => a.id}
          rowActions={(a) => (
            <ActionMenu
              compact label={`Actions for ${a.name}`}
              actions={[
                { id: 'edit', label: 'Edit', icon: 'edit', onSelect: () => setEditing({ type: a.type, alert: a }) },
                a.status === 'active'
                  ? { id: 'disable', label: 'Disable', icon: 'stop-in-circle', onSelect: () => store.toggle(a.id) }
                  : { id: 'enable', label: 'Activate', icon: 'check-in-circle', onSelect: () => store.toggle(a.id) },
                { id: 'delete', label: 'Delete', icon: 'trash-bin', onSelect: () => store.remove(a.id) },
              ]}
            />
          )}
        />
      ) : (
        <div className="sam-nc-empty">
          <Table caption="Alerts" className="sam-nc-table sam-nc-table--head" columns={columns} rows={[]} rowKey={(a) => a.id} rowActions={() => null} />
          <EmptyState
            variant="general" className="sam-nc-empty__state"
            action={filtered ? undefined : <Button variant="secondary" size="sm" iconStart="plus-in-circle" className="sam-nc-empty__add" onClick={startCreate}>Add Alert</Button>}
          >
            {filtered ? 'No alerts match the filters' : 'List is empty'}
          </EmptyState>
        </div>
      )}

      <ChooseAlertTypeDialog
        open={choosing} onClose={() => setChoosing(false)}
        onChoose={(t) => { setChoosing(false); setEditing({ type: t }); }}
      />
      {editing && (
        <CreateAlertDrawer
          key={editing.alert?.id ?? editing.type}
          type={editing.type} alert={editing.alert}
          onClose={() => setEditing(null)}
          onSubmit={(a) => { store.save(a); setEditing(null); }}
        />
      )}
    </div>
  );
}
