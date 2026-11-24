import { useState } from 'react';
import {
  Button, Card, Checklist, ChecklistItem, Comment, CommentEditor, CommentReply, Drawer, DrawerRow, EmptyState, FileItem,
  Grid, GridItem, Icon, IconButton, ProgressBar, Property, Section, Segmented, Select, Switch, Table, Tag, TextField,
  Thumbnail, Value,
} from '../src';
import photo1 from './assets/damage-1.jpg';
import photo2 from './assets/damage-2.jpg';
import photo3 from './assets/damage-3.jpg';
import photo4 from './assets/damage-4.jpg';
import cover from './assets/damage-cover.jpg';

const photos = [photo1, photo2, photo3, photo4];
const none = () => {};

const tagColors: Array<[string, string]> = [
  ['Caterpillar 6090', '#459af7'], ['Komatsu PC8000', '#591ea1'], ['Hitachi EX8000', '#f74583'],
  ['P&H 4100XPC', '#41a619'], ['Liebherr R9800', '#d46c2b'],
];
const people: Array<[string, string]> = [
  ['Max Mustermann', '#459af7'], ['Erika Mustermann', '#fe7d00'], ['John Doe', '#f4b642'], ['Jane Smith', '#a200ff'],
  ['Max Mustermann', '#459af7'], ['Erika Mustermann', '#fe7d00'], ['John Doe', '#ff1900'], ['Jane Smith', '#71c562'],
  ['Emily Davis', '#fe7d00'], ['Michael Johnson', '#a200ff'], ['Chris Lee', '#a200ff'], ['Sarah Brown', '#ff1900'],
  ['David Wilson', '#a200ff'], ['Maria Schneider', '#a200ff'], ['Alex Johnson', '#71c562'], ['Erika Mustermann', '#a200ff'],
  ['Tina Müller', '#71c562'], ['Maximilian Schmidt', '#71c562'], ['Laura Becker', '#459af7'], ['Felix Braun', '#71c562'],
  ['Anna Fischer', '#ffb30f'], ['Jonas Richter', '#71c562'], ['Sophie Weber', '#459af7'], ['Lukas Schneider', '#71c562'],
  ['Tina Müller', '#ffb30f'], ['Tina Müller', '#459af7'], ['Leonie Hoffmann', '#ffb30f'],
];
const resources = [
  { date: '01.01.2016', name: 'Pipe', amount: 12, unit: 'Meter', price: 20, file: false },
  { date: '02.01.2016', name: 'Cable', amount: 15, unit: 'Meter', price: 25, file: true },
  { date: '03.01.2016', name: 'Duct', amount: 10, unit: 'Meter', price: 30, file: true },
  { date: '04.01.2016', name: 'Connector', amount: 8, unit: 'Unit', price: 50, file: true },
];
const lorem = 'A thorough damage investigation is essential for accurate claims processing. It generally outlines: Characteristics of the item';

function Photos({ side }: { side: string }) {
  return (
    <span className="rd-photos">
      {photos.map((src, i) => <Thumbnail key={src} src={src} alt={`${side}, photo ${i + 1}`} onClick={none} />)}
    </span>
  );
}

function More({ label }: { label: string }) {
  return <IconButton icon="dotshorizontal" label={label} variant="outline" />;
}

function DueDate({ date }: { date?: string }) {
  return <Tag variant="soft" icon="calendar">Next Month{date && <span className="rd-date">{date}</span>}</Tag>;
}

/** The record drawer reference, built from Syn components only. */
export function RecordDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tags, setTags] = useState(tagColors);
  const [collaborators, setCollaborators] = useState(['M.M', 'N.N', 'O.O', 'P.P', 'Q.Q', 'M.M'].map((name, id) => ({ id, name })));
  const [chassis, setChassis] = useState(false);
  const [view, setView] = useState('comments');
  const [draft, setDraft] = useState('');
  const [reply, setReply] = useState('');
  const [items, setItems] = useState([false, true, false]);
  const done = items.filter(Boolean).length;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      label="Hydraulic pipe problem"
      headerStart={<>
        <Tag color="var(--syn-color-success-mantis)" icon="dublecheck">Completed</Tag>
        <span className="rd-id"><Icon name="settings" size={16} />DR-12457</span>
      </>}
      headerActions={<>
        <IconButton icon="share" label="Share" size="sm" />
        <IconButton icon="dotshorizontal" label="More actions" size="sm" />
      </>}
      footer={<>
        <Button variant="text" onClick={onClose}>Discard</Button>
        <Button size="md" className="rd-update" onClick={onClose}>Update</Button>
      </>}
    >
      {/* Title, description and status */}
      <DrawerRow>
        <div className="rd-title">
          <div>
            <h2 className="rd-title__text">Hydraulic pipe problem</h2>
            <p className="rd-title__lead">{lorem} {lorem}</p>
          </div>
          <Select label="Status" size="xs" defaultValue="done" options={[{ value: 'open', label: 'Open' }, { value: 'progress', label: 'In progress' }, { value: 'done', label: 'Finished' }]} />
        </div>
      </DrawerRow>

      {/* Properties */}
      <DrawerRow end={<Property label="Assignee" icon="person" className="rd-end"><Tag color="var(--syn-color-secondary-dodger-blue)" shape="rounded">Max Mustermann</Tag></Property>}>
        <Grid gap={24}>
          <GridItem span={3} spanSm={6}><Property label="Condition" icon="maintenance"><Tag variant="outline" shape="rounded" icon="cant-work">Can’t work</Tag></Property></GridItem>
          <GridItem span={3} spanSm={6}><Property label="Priority" icon="up"><Tag color="var(--syn-color-primary-candy-apple)" shape="rounded" icon="critical">Blocker</Tag></Property></GridItem>
          <GridItem span={3} spanSm={6}><Property label="Insurance case" icon="insurance"><strong className="rd-strong">Yes</strong></Property></GridItem>
          <GridItem span={3} spanSm={6}><Property label="Due date" icon="calendar"><Tag variant="soft">01.02.2026 14:48</Tag></Property></GridItem>
        </Grid>
      </DrawerRow>

      <DrawerRow label="Collaborators" icon="person" end={<IconButton icon="adduser" label="Add collaborator" size="xs" variant="outline" />}>
        {collaborators.map((c) => (
          <Tag key={c.id} removeIcon="x-in-circle" removeLabel={`Remove ${c.name}`} onRemove={() => setCollaborators(collaborators.filter((x) => x.id !== c.id))}>{c.name}</Tag>
        ))}
      </DrawerRow>

      <DrawerRow label="Tags" icon="tag" end={<Tag variant="dashed" onClick={none}>Add</Tag>}>
        {tags.map(([name, color]) => (
          <Tag key={name} color={color} onRemove={() => setTags(tags.filter(([n]) => n !== name))}>{name}</Tag>
        ))}
      </DrawerRow>

      {/* Details: equipment, protocol with the damage cards, attachments */}
      <Section title="Details">
        <div className="rd-inline">
          <span className="rd-muted-title">Equipment</span>
          <Tag variant="dashed" onClick={none}>Add</Tag>
        </div>
        <EmptyState icon="equipment">Nothing assigned</EmptyState>

        <Section title="Protocol" size="lg" collapsible>
          <div className="rd-protocol-head">
            <h4 className="rd-protocol-title">Pipe Damage</h4>
            <FileItem name="Manuals and Document (DE)" meta="256 MB" href="#" />
          </div>
          <Card title="Main Loss">
            <Grid gap={20}>
              <GridItem span={4}>
                <Property variant="tile" label="What is Damaged">Back Side<p className="rd-tile-text">{lorem} {lorem}</p></Property>
              </GridItem>
              <GridItem span={4}><Property variant="tile" label="Secondary Affected Area">Front Side</Property></GridItem>
              <GridItem span={4}>
                <Property variant="tile" label="Affected Area">Front Side<Photos side="Front side" /><p className="rd-tile-text">A damage report is provided by a repairer to help us understand the background to a claim.</p></Property>
              </GridItem>
            </Grid>
          </Card>
          <Card title="Secondary Loss">
            <Grid gap={20}>
              <GridItem span={4}><Property variant="tile" label="What is Damaged">Back Side</Property></GridItem>
              <GridItem span={4}><Property variant="tile" label="Secondary Affected Area">Front Side</Property></GridItem>
              <GridItem span={4}><Property variant="tile" label="Secondary Affected Area">Front Side</Property></GridItem>
            </Grid>
          </Card>
          <Card title="Overall Damage">
            <Grid gap={20}>
              <GridItem span={4}><Property variant="tile" label="What is Damaged">Left Side</Property></GridItem>
              <GridItem span={4}><Property variant="tile" label="Secondary Affected Area">Right Side</Property></GridItem>
              <GridItem span={4}><Property variant="tile" label="Secondary Affected Area">Left Side</Property></GridItem>
              <GridItem span={4}>
                <Property variant="tile" label="Affected Area" className="rd-tile-row">Right Side<Photos side="Right side" /></Property>
              </GridItem>
            </Grid>
          </Card>
          <Card title="Overall Damage">
            <Grid gap={20}>
              <GridItem span={4}>
                <Property variant="tile" label="Affected Area" className="rd-tile-row">Left Side<Photos side="Left side" />
                  <p className="rd-tile-text">A damage assessment is conducted to evaluate the extent of harm and inform potential repairs. It typically includes: Examination of the item</p>
                </Property>
              </GridItem>
              <GridItem span={4}><Property variant="tile" label="Secondary Affected Area">Bottom Side</Property></GridItem>
            </Grid>
          </Card>
          <Card title="Attachments" className="rd-attachments">
            <FileItem name="Manuals and Document (DE)" meta="256 MB" preview={cover} previewAlt="Damaged car, front left" onRemove={none} />
          </Card>
        </Section>
      </Section>

      {/* Custom fields */}
      <Section title="Custom fields" collapsible>
        <Grid>
          <GridItem span={4} spanSm={12}>
            <Property label="Chassis damaged" className="rd-field">
              <Switch size={24} label="Chassis damaged" offLabel="No" onLabel="Yes" checked={chassis} onChange={(e) => setChassis(e.target.checked)} />
            </Property>
          </GridItem>
          <GridItem span={4} spanSm={12}>
            <Property label="Location of damage" className="rd-field">
              <Select label="Location of damage" size="sm" defaultValue="p2" options={[{ value: 'p1', label: 'Pipe Damage 1' }, { value: 'p2', label: 'Pipe Damage 2' }, { value: 'p3', label: 'Pipe Damage 3' }]} />
            </Property>
          </GridItem>
          <GridItem span={4} spanSm={12}>
            <Property label="Further information" className="rd-field">
              <TextField label="Further information" hideLabel size="sm" placeholder="First name" />
            </Property>
          </GridItem>
        </Grid>
      </Section>

      {/* Checklist */}
      <Section title="Checklist" collapsible>
        <Card title="Roofing material assessment" actions={<More label="Checklist actions" />} className="rd-checklist">
          <ProgressBar label={`${done}/${items.length}`} value={(done / items.length) * 100} title="Checklist progress" />
          <Checklist>
            <ChecklistItem
              editing
              label="New task"
              checked={items[0]}
              onCheckedChange={(v) => setItems([v, items[1], items[2]])}
              assignee={<Tag variant="soft" muted icon="person">Project Manager</Tag>}
              due={<span className="rd-inline"><DueDate date="01.01.2048" /><More label="Task actions" /></span>}
            />
            <ChecklistItem
              checked={items[1]}
              onCheckedChange={(v) => setItems([items[0], v, items[2]])}
              actions={<More label="Task actions" />}
              assignee={<Tag variant="soft" muted icon="person">Project Manager</Tag>}
              due={<DueDate />}
            >
              Conducting a roofing material assessment involves evaluating the condition and suitability of various materials. It is essential for making informed decisions on repairs or replacements, maintaining safety and functionality.
            </ChecklistItem>
            <ChecklistItem
              checked={items[2]}
              onCheckedChange={(v) => setItems([items[0], items[1], v])}
              actions={<More label="Task actions" />}
              assignee={<Tag variant="soft" muted icon="person">Project Manager</Tag>}
              due={<DueDate date="01.01.2048" />}
              extra={people.map(([n, c], i) => <Tag key={`${n}-${i}`} color={c} shape="rounded">{n}</Tag>)}
            >
              Conducting a roofing material assessment involves evaluating the condition and suitability of various materials. It is essential for making informed decisions on repairs or replacements, maintaining safety and functionality.
            </ChecklistItem>
          </Checklist>
          <div><Button variant="secondary" size="sm" shape="pill" className="rd-add-item">Add item</Button></div>
        </Card>
      </Section>

      {/* Resources */}
      <Section title="Resources" collapsible>
        <div className="rd-resources-head">
          <span className="rd-inline"><Property label="Reparation Start Date" icon="calendar" className="rd-inline-prop"><Tag variant="soft">01.02.2026 14:48</Tag></Property></span>
          <span className="rd-inline"><Property label="Reparation End Date" icon="calendar" className="rd-inline-prop"><Tag variant="soft">01.02.2026 14:48</Tag></Property></span>
          <IconButton icon="plus-in-circle" label="Add resource" variant="outline" className="rd-add" />
        </div>
        <Table
          caption="Resources"
          rows={resources}
          rowKey={(r) => r.name}
          columns={[
            { key: 'date', header: 'Date' },
            { key: 'name', header: 'Name' },
            { key: 'amount', header: 'Amount', render: (r) => <Value unit={r.unit}>{r.amount}</Value> },
            { key: 'price', header: 'Unit Price', render: (r) => <Value unit="Eur" muted={r.file}>{r.price}</Value> },
            { key: 'total', header: 'Total', render: (r) => <Value unit="Eur">{r.amount * r.price}</Value> },
            {
              key: 'file', header: 'File',
              render: (r) => (r.file ? <Tag color="var(--syn-color-secondary-amber)" onClick={none}>PDF</Tag> : <IconButton icon="plus-in-circle" label={`Add file to ${r.name}`} className="rd-add-file" />),
            },
          ]}
          rowActions={(r) => <More label={`${r.name} actions`} />}
          footer={<span className="rd-total"><span aria-hidden>€</span> Total cost <strong>{resources.reduce((s, r) => s + r.amount * r.price, 0)}</strong> Eur</span>}
        />
      </Section>

      {/* Comments and activity */}
      <div className="rd-activity">
        <Segmented label="Show" value={view} onChange={setView} options={[{ value: 'comments', label: 'Comments' }, { value: 'activity', label: 'Activity' }]} />

        {view === 'comments' ? (
          <div className="rd-comments">
            <Comment
              author="Max Mustermann" date="11.01.2025" time="12:23"
              actions={<><IconButton icon="attach" label="Attach a file" variant="outline" /><More label="Comment actions" /></>}
              editor={<CommentEditor label="Write a comment" value={draft} onChange={(e) => setDraft(e.target.value)} onDiscard={() => setDraft('')} onSave={() => setDraft('')} />}
            />
            <Comment
              author="Max Mustermann" date="11.01.2025" time="12:23"
              actions={<More label="Comment actions" />}
              footer={<>
                <Tag color="var(--syn-color-secondary-amber)" removeIcon="x-in-circle" onRemove={none} removeLabel="Remove PDF">PDF</Tag>
                <Button size="xs" shape="pill" className="rd-reply">Reply</Button>
              </>}
            >
              “The only way to solve the problem is to code for the hardware directly—just make sure that it's clearly commented”
            </Comment>
            <Comment
              author="Anna Schmidt" date="12.01.2025" time="09:45" active
              actions={<More label="Comment actions" />}
              footer={<Button size="xs" shape="pill" className="rd-reply">Reply</Button>}
              replies={<>
                <CommentReply end={<Tag variant="soft" onClick={none}>12 Replies</Tag>}>The only way to solve the problem is to …</CommentReply>
                <CommentReply>
                  <CommentEditor label="Write a reply" value={reply} onChange={(e) => setReply(e.target.value)} onDiscard={() => setReply('')} onSave={() => setReply('')} autoFocus={false} />
                </CommentReply>
              </>}
            >
              “Iterating through the data structure helps in optimizing the retrieval process—efficiency is key”
            </Comment>
            <Comment
              author="Anna Schmidt" date="12.01.2025" time="09:45"
              actions={<More label="Comment actions" />}
              footer={<Button size="xs" shape="pill" className="rd-reply">Reply</Button>}
              replies={<CommentReply end={<Tag variant="soft" onClick={none}>12 Replies</Tag>}>The only way to solve the problem is to …</CommentReply>}
            >
              “Iterating through the data structure helps in optimizing the retrieval process—efficiency is key”
            </Comment>
            <Comment
              author="Lukas Müller" date="13.01.2025" time="14:15"
              footer={<>
                <Tag color="var(--syn-color-secondary-amber)" removeIcon="x-in-circle" onRemove={none} removeLabel="Remove PDF">PDF</Tag>
                <Button size="xs" shape="pill" className="rd-reply">Reply</Button>
              </>}
            >
              “User feedback is crucial for the next version—listening to the audience shapes our direction”
            </Comment>
            <div><Tag variant="soft" onClick={none}>See more</Tag></div>
          </div>
        ) : (
          <EmptyState icon="history">No activity yet</EmptyState>
        )}
      </div>
    </Drawer>
  );
}
