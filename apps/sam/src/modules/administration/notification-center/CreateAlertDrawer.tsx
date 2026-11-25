import { useState, type ReactNode } from 'react';
import { Button, Drawer, Icon, IconButton, Segmented, Select, Tag, TextField } from '@syn/design-system';
import { EquipmentPicker } from './EquipmentPicker';
import { GeofenceMap } from './GeofenceMap';
import { WorkingHoursField, workingHoursError } from './WorkingHoursField';
import siren from './assets/alert-siren.png';
import {
  alertTypes, beaconVendors, emptyWorkingHours, equipmentById, geofenceKinds, placesFor, recipients,
  type Alert, type AlertType, type GeofenceKind, type Place,
} from './data';

const recipientOptions = recipients.map((r) => ({ value: r, label: r }));

/** Figma "Input Fields": a white 12px card with the Title 4 label (and a Candy Apple star when required). */
function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="sam-nc-card sam-nc-field">
      <p className="sam-nc-label" aria-hidden>{label}{required && <span className="sam-nc-required"> *</span>}</p>
      {children}
    </div>
  );
}

/** The chosen warehouse, project or area under its dropdown (Figma 16821:61094). */
function PlaceDetails({ place }: { place: Place }) {
  return (
    <div className="sam-place">
      <p className="sam-place__name">{place.name}{place.code && <span className="sam-nc-muted"> ({place.code})</span>}</p>
      <dl className="sam-place__facts">
        <div><dt>Department</dt><dd>{place.department}</dd></div>
        {place.dates && <div><dt>Dates</dt><dd>{place.dates}</dd></div>}
        <div><dt>Location</dt><dd>{place.location}</dd></div>
        <div><dt>Responsible person</dt><dd>{place.responsible}</dd></div>
      </dl>
    </div>
  );
}

type Errors = Partial<Record<'name' | 'recipients' | 'equipment' | 'place' | 'polygon' | 'hours' | 'vendors', string>>;

/**
 * Create (or edit) an alert. One drawer, three bodies:
 * Geofence Exit (Figma 13564:25033 and its warehouse, project and area variants), Outside Working Hours (13588:25230)
 * and Power Disconnected (13588:25339). Name, Email and Equipments are common to all.
 */
export function CreateAlertDrawer({ type, alert, onClose, onSubmit }: {
  type: AlertType;
  alert?: Alert;
  onClose: () => void;
  onSubmit: (alert: Alert) => void;
}) {
  const [name, setName] = useState(alert?.name ?? '');
  const [emails, setEmails] = useState<string[]>(alert?.recipients ?? []);
  const [items, setItems] = useState<string[]>(alert?.equipment ?? []);
  const [kind, setKind] = useState<GeofenceKind>(alert?.geofenceKind ?? 'geofence');
  const [placeId, setPlaceId] = useState(alert?.placeId ?? '');
  const [polygon, setPolygon] = useState<[number, number][]>(alert?.polygon ?? []);
  const [hours, setHours] = useState(alert?.workingHours ?? emptyWorkingHours());
  const [vendors, setVendors] = useState<string[]>(alert?.beaconVendors ?? []);
  const [picking, setPicking] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const kindInfo = geofenceKinds.find((k) => k.value === kind)!;
  const places = kind === 'geofence' ? [] : placesFor[kind];
  const place = places.find((p) => p.id === placeId);

  const errors: Errors = {};
  if (!name.trim()) errors.name = 'Enter a name.';
  if (!emails.length) errors.recipients = 'Choose at least one email.';
  if (!items.length) errors.equipment = 'Add at least one equipment.';
  if (type === 'geofence-exit') {
    if (kind === 'geofence' && polygon.length < 3) errors.polygon = 'Draw the geofence on the map.';
    if (kind !== 'geofence' && !place) errors.place = `Choose a ${kindInfo.field?.toLowerCase()}.`;
  }
  if (type === 'outside-working-hours') errors.hours = workingHoursError(hours);
  if (type === 'power-disconnected' && !vendors.length) errors.vendors = 'Choose at least one beacon vendor.';
  const show = (key: keyof Errors) => (submitted ? errors[key] : undefined);

  const submit = () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    onSubmit({
      id: alert?.id ?? `al-${Date.now()}`,
      name: name.trim(),
      createdAt: alert?.createdAt ?? new Date().toISOString().slice(0, 16),
      type,
      status: alert?.status ?? 'active',
      recipients: emails,
      equipment: items,
      ...(type === 'geofence-exit' && { geofenceKind: kind, ...(kind === 'geofence' ? { polygon } : { placeId }) }),
      ...(type === 'outside-working-hours' && { workingHours: hours }),
      ...(type === 'power-disconnected' && { beaconVendors: vendors }),
    });
  };

  const title = `${alert ? 'Edit' : 'Create'} ${alertTypes[type].label} Alert`;

  return (
    <Drawer
      open onClose={onClose} label={title} className="sam-nc-drawer"
      headerStart={<h2 className="sam-nc-drawer__title">{title}</h2>}
      footer={(
        <>
          <Button variant="text" onClick={onClose}>Discard</Button>
          <Button onClick={submit}>{alert ? 'Save' : 'Submit'}</Button>
        </>
      )}
    >
      <img src={siren} alt="" className="sam-nc-drawer__art" width={320} height={320} />
      {type === 'geofence-exit' && (
        <div className="sam-nc-drawer__type">
          <p className="sam-nc-label" id="sam-geo-kind">Type</p>
          <Segmented
            label="Geofence type" value={kind}
            options={geofenceKinds.map((k) => ({ value: k.value, label: k.label }))}
            onChange={(v) => { setKind(v as GeofenceKind); setPlaceId(''); }}
          />
        </div>
      )}
      <div className="sam-nc-drawer__columns">
        <div className="sam-nc-drawer__column">
          <Field label="Name" required>
            <TextField label="Name (required)" hideLabel size="md" placeholder="Enter" value={name} error={show('name')}
              onChange={(e) => setName(e.target.value)} onClear={() => setName('')} />
          </Field>
          {type === 'geofence-exit' && kind !== 'geofence' && (
            <Field label={kindInfo.field!} required>
              <Select label={`${kindInfo.field} (required)`} hideLabel size="md" placeholder="Choose"
                options={places.map((p) => ({ value: p.id, label: p.code ? `${p.name} (${p.code})` : p.name }))}
                value={placeId} onChange={setPlaceId} error={show('place')} />
              {place && <PlaceDetails place={place} />}
            </Field>
          )}
          <Field label="Email" required>
            <Select label="Email (required)" hideLabel size="md" placeholder="Choose Several" multiple showTags
              options={recipientOptions} values={emails} onValuesChange={setEmails} error={show('recipients')} />
          </Field>
          <section className={`sam-nc-equipments${show('equipment') ? ' is-invalid' : ''}`} aria-labelledby="sam-nc-equipments">
            <header className="sam-nc-equipments__head">
              <h3 id="sam-nc-equipments" className="sam-nc-label">Equipments<span className="sam-nc-required" aria-hidden> *</span></h3>
              <IconButton icon="plus-in-circle" label="Add equipment" variant="outline" className="sam-nc-add-inline" onClick={() => setPicking(true)} />
            </header>
            <div className="sam-nc-equipments__body">
              <div className="sam-nc-equipments__list">
                {items.map((id) => {
                  const label = equipmentById(id)?.name ?? id;
                  return (
                    <Tag key={id} variant="chip" onRemove={() => setItems(items.filter((x) => x !== id))} removeLabel={`Remove ${label}`}>{label}</Tag>
                  );
                })}
              </div>
            </div>
            {show('equipment') && <p className="sam-nc-error" role="alert">{errors.equipment}</p>}
          </section>
        </div>

        <div className="sam-nc-drawer__column">
          {type === 'geofence-exit' && (
            <div className="sam-nc-geofence">
              {kind === 'geofence' && (
                <p className="sam-nc-geofence__label">
                  <Icon name="info-button" size={16} />
                  Draw geofence<span className="sam-nc-required" aria-hidden> *</span>
                </p>
              )}
              <GeofenceMap
                drawable={kind === 'geofence'} polygon={polygon} onPolygon={setPolygon}
                center={place?.center} invalid={Boolean(show('polygon'))}
              />
              {show('polygon') && <p className="sam-nc-error" role="alert">{errors.polygon}</p>}
            </div>
          )}
          {type === 'outside-working-hours' && <WorkingHoursField value={hours} onChange={setHours} error={show('hours')} />}
          {type === 'power-disconnected' && (
            <div className="sam-nc-card sam-nc-power">
              <p className="sam-nc-label">Power condition</p>
              <div className="sam-nc-power__info">
                <Icon name="info-circle" size={24} />
                <p><strong>Triggers notification</strong>When the beacon external power source becomes unavailable/Disconnected</p>
              </div>
              <Field label="Beacon vendors" required>
                <Select label="Beacon vendors (required)" hideLabel size="md" placeholder="Choose Several" multiple showTags
                  options={beaconVendors} values={vendors} onValuesChange={setVendors} error={show('vendors')} />
              </Field>
            </div>
          )}
        </div>
      </div>

      {picking && (
        <EquipmentPicker
          open selected={items} onClose={() => setPicking(false)}
          onSubmit={(ids) => { setItems(ids); setPicking(false); }}
        />
      )}
    </Drawer>
  );
}
