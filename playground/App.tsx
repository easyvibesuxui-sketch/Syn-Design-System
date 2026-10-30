import { useState, type ReactNode } from 'react';
import {
  Accordion, Button, Checkbox, Dialog, Grid, GridItem, Icon, IconButton, NewTab, Notification, Radio, RadioGroup, Select,
  Slider, StatusBadge, StatusChip, Switch, Tabs, TextArea, TextField, Tooltip, Tag, QuantityField, Skeleton, FileItem, ProgressBar, iconData, iconNames, tokens,
} from '../src';
import { RecordDrawer } from './RecordDrawer';

const sections = [
  ['colors', 'Colour'], ['typography', 'Typography'], ['spacing', 'Spacing & shape'], ['grid', 'Grid'], ['icons', 'Icons'],
  ['buttons', 'Buttons'], ['inputs', 'Text fields'], ['quantity', 'Quantity & skeleton'], ['select', 'Select'], ['choices', 'Checkbox & radio'],
  ['switch', 'Switch'], ['tabs', 'Tabs'], ['tags', 'Tags & files'], ['status', 'Status'], ['notifications', 'Notifications'],
  ['tooltip', 'Tooltip'], ['accordion', 'Accordion'], ['slider', 'Slider'], ['dialog', 'Dialog'], ['drawer', 'Drawer'],
] as const;

function Section({ id, title, lead, children }: { id: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <section id={id} className="pg-section">
      <h2 className="syn-text-titles-display-2">{title}</h2>
      {lead && <p className="pg-lead">{lead}</p>}
      {children}
    </section>
  );
}

function Row({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="pg-row">
      {label && <span className="pg-row__label">{label}</span>}
      <div className="pg-row__items">{children}</div>
    </div>
  );
}

const palette = Object.entries(tokens.primitive.color);
const semanticGroups = Object.entries(tokens.semantic.color) as Array<[string, Record<string, string>]>;
const typeScale = Object.entries(tokens.semantic.typography) as Array<[string, { fontFamily: string; fontWeight: number; fontSize: string; lineHeight: string }]>;

export function App() {
  const [tab, setTab] = useState('overview');
  const [extraTabs, setExtraTabs] = useState<string[]>(['General']);
  const [extraSelected, setExtraSelected] = useState<string>();
  const [chips, setChips] = useState<string[]>(['open']);
  const [plan, setPlan] = useState('month');
  const [dialog, setDialog] = useState(false);
  const [slider, setSlider] = useState(40);
  const [machine, setMachine] = useState<string>();
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="syn-root pg">
      <aside className="pg-nav">
        <div className="pg-brand">
          <span className="pg-brand__mark" aria-hidden />
          <span className="syn-text-titles-title-3">Syn</span>
        </div>
        <nav aria-label="Sections">
          {sections.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
      </aside>

      <main className="pg-main">
        <header className="pg-hero">
          <p className="syn-text-titles-title-5 pg-eyebrow">Design system · v0.1</p>
          <h1 className="syn-text-titles-display-1">Syn</h1>
          <p className="pg-lead">
            Tokens, icons and React components extracted from the “Design system library” Figma file. Black-first controls,
            Candy Apple for brand moments, Amber for secondary emphasis, and a Montserrat / ABC Favorit Expanded type pairing.
          </p>
        </header>

        <Section id="colors" title="Colour" lead="Eighteen primitives from the Figma Colors collection. Components only ever read the semantic layer below them.">
          <div className="pg-swatches">
            {palette.map(([name, value]) => (
              <div key={name} className="pg-swatch">
                <span className="pg-swatch__chip" style={{ background: value }} />
                <span className="syn-text-text-body-xs">{name}</span>
                <code>{value}</code>
              </div>
            ))}
          </div>
          <div className="pg-semantic">
            {semanticGroups.map(([group, values]) => (
              <div key={group}>
                <h3 className="syn-text-titles-title-4">{group}</h3>
                {Object.keys(values).map((name) => (
                  <div key={name} className="pg-semantic__row">
                    <span className="pg-semantic__chip" style={{ background: `var(--syn-${group}-${name})` }} />
                    <code>--syn-{group}-{name}</code>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>

        <Section id="typography" title="Typography" lead="Titles use ABC Favorit Expanded (falls back to Montserrat when the commercial font is not installed). Body, labels and buttons use Montserrat.">
          <div className="pg-type">
            {typeScale.map(([name, t]) => (
              <div key={name} className="pg-type__row">
                <code>.syn-text-{name}</code>
                <span className={`syn-text-${name}`}>The quick brown fox jumps</span>
                <span className="pg-type__meta">{t.fontSize} / {t.lineHeight} · {t.fontWeight} · {t.fontFamily.split(',')[0]}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section id="spacing" title="Spacing & shape" lead="Sizes are even numbers only: 2, 4, 6, 8, 10, 12, 16, 20, 24, then multiples of 8. Elements have 8px corners; large widgets and pages 12px; the drawer's top-left corner 48px.">
          <Row label="Space">
            {Object.entries(tokens.primitive.space).map(([k, v]) => (
              <div key={k} className="pg-space"><span style={{ width: v, height: v }} /><code>{k} · {v}</code></div>
            ))}
          </Row>
          <Row label="Radius">
            {Object.entries(tokens.primitive.radius).map(([k, v]) => (
              <div key={k} className="pg-radius" style={{ borderRadius: v }}><code>{k}<br />{v}</code></div>
            ))}
          </Row>
          <Row label="Height">
            <div className="pg-heights">
              {(['xs', 'sm', 'md', 'lg'] as const).map((k, i) => {
                const v = tokens.primitive.size[`control-${k}`];
                return <div key={k} className="pg-height"><span style={{ height: v }} /><code>{['smallest', 'small', 'medium', 'large'][i]} · {v}</code></div>;
              })}
            </div>
          </Row>
          <Row label="Shadow">
            {Object.entries(tokens.primitive.shadow).map(([k, v]) => (
              <div key={k} className="pg-shadow" style={{ boxShadow: v }}><code>{k}</code></div>
            ))}
          </Row>
        </Section>

        <Section id="grid" title="Grid" lead="A 12-column grid with a 24px gutter and 32px page margins. GridItem spans 1 to 12 columns, and the full row under 640px unless spanSm says otherwise.">
          <div className="pg-cols">
            <Grid>
              {Array.from({ length: 12 }, (_, i) => <GridItem key={i} span={1} spanSm={3}><div className="pg-col">{i + 1}</div></GridItem>)}
              <GridItem span={4}><div className="pg-col">span 4</div></GridItem>
              <GridItem span={4}><div className="pg-col">span 4</div></GridItem>
              <GridItem span={4}><div className="pg-col">span 4</div></GridItem>
              <GridItem span={6}><div className="pg-col">span 6</div></GridItem>
              <GridItem span={6}><div className="pg-col">span 6</div></GridItem>
              <GridItem span={8}><div className="pg-col">span 8</div></GridItem>
              <GridItem span={4}><div className="pg-col">span 4</div></GridItem>
            </Grid>
          </div>
        </Section>

        <Section id="icons" title="Icons" lead={`All ${iconNames.length} components of the Figma Main icons set, at their native size (most are 20 x 20). Single-ink icons inherit currentColor; pins, status and file-format icons keep their Figma colours.`}>
          <div className="pg-icons">
            {iconNames.map((name) => (
              <div key={name} className="pg-icon">
                <Icon name={name} />
                <code>{name}</code>
                {(iconData[name].width !== 20 || iconData[name].height !== 20) && <small>{iconData[name].width} x {iconData[name].height}</small>}
              </div>
            ))}
          </div>
        </Section>

        <Section id="buttons" title="Buttons" lead="Four heights: large 56, medium 48, small 36, smallest 24. Filled buttons fade to 74% on hover; focus draws a 1px ring 2px outside.">
          {(['primary', 'secondary', 'accent', 'brand'] as const).map((variant) => (
            <Row key={variant} label={variant}>
              <Button variant={variant} size="lg" iconStart="chevron-left" iconEnd="arrow-right">Action</Button>
              <Button variant={variant} size="md">Action</Button>
              <Button variant={variant} size="sm">Action</Button>
              <Button variant={variant} size="xs">Action</Button>
              <Button variant={variant} loading>Saving</Button>
              <Button variant={variant} disabled>Disabled</Button>
            </Row>
          ))}
          <Row label="text">
            <Button variant="text" iconStart="chevron-left" iconEnd="arrow-right">Button text</Button>
            <Button variant="text" disabled>Button text</Button>
          </Row>
          <Row label="stretched"><Button fullWidth size="md" iconEnd="arrow-right">Request a demo</Button></Row>
          <Row label="icon">
            <IconButton icon="edit" label="Edit" size="lg" />
            <IconButton icon="edit" label="Edit" size="md" />
            <IconButton icon="more-vertical" label="More" size="sm" />
            <IconButton icon="close" label="Clear" size="xs" />
          </Row>
        </Section>

        <Section id="inputs" title="Text fields" lead="Figma Inputs page. Two kinds: with the label inside (with an icon the Candy Apple label stays above the placeholder; without one it is the placeholder until focus) and without a label (hideLabel). Heights 56 / 48 / 36 / 24; the 24px field never has a label inside. Hover draws a 1px Eerie Black border, focus 2px outside; errors use a Snow fill and a Vermilion border, with the message 2px below.">
          <div className="pg-grid">
            <TextField label="First name" persistentLabel clearVisibility="always" iconStart="person" hint="Hint text" onClear={() => {}} />
            <TextField label="First name" persistentLabel clearVisibility="always" defaultValue="E.G. John Doe" iconStart="person" hint="Hint text" onClear={() => {}} />
            <TextField label="First name" persistentLabel clearVisibility="always" iconStart="person" disabled hint="Hint text" onClear={() => {}} />
            <TextField label="First name" />
            <TextField label="First name" defaultValue="E.G. John Doe" onClear={() => {}} />
            <TextField label="First name" error="Dummy text error message" />
            <TextField label="First name" defaultValue="E.G. John Doe" error="Dummy text error message" />
            <TextField label="First name" disabled error="Dummy text error message" />
            <TextField label="First name" size="md" />
            <TextField label="First name" size="md" defaultValue="E.G. John Doe" />
            <TextField label="First name" size="sm" />
            <TextField label="Search" hideLabel placeholder="Search" />
            <TextField label="Search" hideLabel size="md" iconStart="search" placeholder="Search" />
            <TextField label="Search" hideLabel size="sm" defaultValue="Wheel loader" onClear={() => {}} />
            <TextField label="Filter" size="xs" placeholder="Filter" />
            <TextField label="Email" defaultValue="john@" error={['Enter a full email address', 'Use your work domain']} />
            <TextArea label="Additional information" hideLabel={false} placeholder="Helper text" maxLength={20} showCount onClear={() => {}} />
            <TextArea label="Additional information" hideLabel={false} size="sm" defaultValue="Text area" maxLength={20} showCount />
            <TextArea label="Additional information" hideLabel={false} labelPosition="outside" placeholder="Helper text" maxLength={20} showCount />
            <TextArea label="Additional information" hideLabel={false} disabled maxLength={20} showCount />
          </div>
        </Section>

        <Section id="quantity" title="Quantity & skeleton" lead="Figma &quot;Quantity field type 2&quot; with the − and + inside the field (56 / 48 / 36, 8px corners); errors draw the Vermilion border. At the minimum with onRemove the − becomes a bin. Skeleton: Material-style text, circle and rectangle in Syn colours, plus the Figma field and text box skeletons; pulse or wave.">
          <div className="pg-grid">
            <QuantityField label="Quantity" showLabel />
            <QuantityField label="Quantity" showLabel defaultValue={12} suffix="kg" />
            <QuantityField label="Quantity" showLabel defaultValue={1} min={1} onRemove={() => {}} />
            <QuantityField label="Quantity" showLabel defaultValue={0} error="Enter at least 1" />
            <QuantityField label="Quantity" size="md" defaultValue={3} prefix="Pref" suffix="Suff" />
            <QuantityField label="Quantity" size="sm" defaultValue={2} error="Only 1 left in stock" />
            <QuantityField label="Quantity" showLabel disabled />
          </div>
          <div className="pg-grid" style={{ marginTop: 24 }}>
            <div style={{ display: 'grid', gap: 8 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="80%" />
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Skeleton variant="circular" />
              <div style={{ flex: 1, display: 'grid', gap: 4 }}><Skeleton variant="text" width="50%" /><Skeleton variant="text" width="30%" /></div>
            </div>
            <Skeleton variant="rectangular" animation="wave" />
            <Skeleton variant="field" />
            <Skeleton variant="field" size="md" animation="wave" />
            <Skeleton variant="field" size="sm" />
            <Skeleton variant="textbox" />
          </div>
        </Section>

        <Section id="select" title="Select" lead="The list opens 2px under the field. By default only the value shows (as in Figma); hideLabel={false} puts the label inside, like the text field.">
          <div className="pg-grid">
            <Select label="Machine" iconStart="settings" value={machine} onChange={setMachine} onClear={() => setMachine(undefined)} placeholder="Choose"
              options={[{ value: 'excavator', label: 'Excavator' }, { value: 'loader', label: 'Wheel loader' }, { value: 'crane', label: 'Crane' }, { value: 'truck', label: 'Dump truck', disabled: true }]} />
            <Select label="Size" size="md" defaultValue="m" options={[{ value: 's', label: 'Small' }, { value: 'm', label: 'Medium' }, { value: 'l', label: 'Large' }]} />
            <Select label="Location of damage" hideLabel={false} defaultValue="p2" options={[{ value: 'p1', label: 'Pipe Damage 1' }, { value: 'p2', label: 'Pipe Damage 2' }]} />
            <Select label="Status" size="sm" defaultValue="done" options={[{ value: 'open', label: 'Open' }, { value: 'done', label: 'Finished' }]} />
            <Select label="Rows" size="xs" defaultValue="10" options={[{ value: '10', label: '10 rows' }, { value: '25', label: '25 rows' }]} />
            <Select label="Region" error="Pick a region" options={[{ value: 'eu', label: 'Europe' }]} />
            <Select label="Locked" disabled options={[{ value: 'x', label: 'X' }]} />
          </div>
        </Section>

        <Section id="choices" title="Checkbox & radio" lead="Figma &quot;Checkbox 20 px&quot; / &quot;24 px&quot; in two shapes, square with 2px corners and round, and the radio groups: 1.5px Eerie Black border, Jet when hovered or selected, Gray X when disabled. Errors add a Vermilion ring and asterisk, with either the dark bubble (error 1) or red text (error 2) 2px below.">
          {([20, 24] as const).map((size) => (
            <Row key={size} label={`checkbox ${size}`}>
              <Checkbox size={size} label="Text" />
              <Checkbox size={size} label="Text" defaultChecked />
              <Checkbox size={size} label="Text" disabled />
              <Checkbox size={size} label="Text" disabled defaultChecked />
            </Row>
          ))}
          {([20, 24] as const).map((size) => (
            <Row key={size} label={`round ${size}`}>
              <Checkbox shape="round" size={size} label="Text" />
              <Checkbox shape="round" size={size} label="Text" defaultChecked />
              <Checkbox shape="round" size={size} label="Text" disabled defaultChecked />
            </Row>
          ))}
          <Row label="errors">
            <Checkbox label="Text" error="Dummy text Check this to proceed" errorStyle="tooltip" />
            <Checkbox label="Text" error="Dummy text Check this to proceed" />
          </Row>
          {([20, 24] as const).map((size) => (
            <Row key={size} label={`radio ${size}`}>
              <RadioGroup label="Billing period" hideLabel size={size} value={plan} onChange={setPlan} inline>
                <Radio value="date" label="Specific date" />
                <Radio value="month" label="By month" />
                <Radio value="year" label="By year" disabled />
              </RadioGroup>
            </Row>
          ))}
          <Row label="radio error">
            <RadioGroup label="Plan" hideLabel error="Dummy text Check this to proceed" errorStyle="tooltip" inline>
              <Radio value="a" label="Text" />
              <Radio value="b" label="Text" />
            </RadioGroup>
          </Row>
        </Section>

        <Section id="switch" title="Switch" lead="Figma &quot;Small toggle&quot; (size 20, 32 x 20) and &quot;Default size toggle&quot; (size 24, 48 x 24) and &quot;Big toggle&quot; (size 32, 48 x 32). &quot;Toggle with Text and icon&quot; (indicator) shows On or a check in the track. On is Dark Sienna; off is Silver Chalice with a Gray X border. Press stretches the thumb.">
          {([20, 24, 32] as const).map((size) => (
            <Row key={size} label={`size ${size}`}>
              <Switch size={size} label="On" defaultChecked />
              <Switch size={size} label="Loading" loading defaultChecked />
              <Switch size={size} label="Disabled on" disabled defaultChecked />
              <Switch size={size} label="Off" />
              <Switch size={size} label="Loading off" loading />
              <Switch size={size} label="Disabled off" disabled />
            </Row>
          ))}
          {([20, 24] as const).map((size) => (
            <Row key={`i${size}`} label={`indicator ${size}`}>
              <Switch size={size} indicator label="On" defaultChecked />
              <Switch size={size} indicator label="Off" />
              <Switch size={size} indicator label="Disabled on" disabled defaultChecked />
              <Switch size={size} indicator label="Disabled off" disabled />
            </Row>
          ))}
          <Row label="errors">
            <Switch size={20} label="Required" error="Dummy text Switch this to proceed" errorStyle="tooltip" />
            <Switch size={24} label="Required" defaultChecked error="Dummy text Switch this to proceed" />
          </Row>
          <Row label="with label">
            <Switch size={24} label="Notifications" hideLabel={false} defaultChecked />
          </Row>
        </Section>

        <Section id="tags" title="Tags & files" lead="Figma &quot;close button-tag&quot; (Tag variant=&quot;chip&quot;: 36px, Regular 14, round close), &quot;File attached&quot; (FileItem variant=&quot;attached&quot;) and &quot;Loader line&quot; (ProgressBar variant=&quot;line&quot;).">
          <Row label="chip">
            <Tag variant="chip" onRemove={() => {}}>Tag Text</Tag>
            <Tag variant="chip" onRemove={() => {}} disabled>Tag Text</Tag>
            <Tag variant="chip" loading>Tag Text</Tag>
          </Row>
          <Row label="file attached">
            <div style={{ width: 312 }}><FileItem variant="attached" name="File Name.Pdf" meta="256 MB" onRemove={() => {}} /></div>
          </Row>
          <Row label="loader line">
            <div style={{ display: 'grid', gap: 24, width: 312 }}>
              <ProgressBar variant="line" value={2} title="Upload" />
              <ProgressBar variant="line" value={100} title="Upload" />
            </div>
          </Row>
        </Section>

        <Section id="tabs" title="Tabs" lead="Figma &quot;Tab&quot;: white with Silver Chalice text, hover Cultured with a Candy Apple underline, active Eerie Black (Jet on hover), disabled Cultured. Each tab ends with a 16px separator. &quot;New Tab&quot; adds a named tab.">
          <Tabs label="Equipment" value={tab} onChange={setTab} items={[
            { id: 'overview', label: 'Left section', content: <p>Overview panel.</p> },
            { id: 'maintenance', label: 'Left section', iconStart: 'arrow-left', iconEnd: 'arrow-right', content: <p>Maintenance panel.</p> },
            { id: 'history', label: 'Left section', iconStart: 'arrow-left', content: <p>History panel.</p> },
            { id: 'archive', label: 'Left section', disabled: true },
          ]} end={(
            <>
              {extraTabs.map((name) => (
                <NewTab key={name} name={name} selected={extraSelected === name} onSelect={() => setExtraSelected(name)}
                  onRemove={() => setExtraTabs((t) => t.filter((x) => x !== name))} />
              ))}
              <NewTab onCreate={(name) => setExtraTabs((t) => [...t, name])} />
            </>
          )} />
          <Row label="default size">
            <Tabs label="Default size" size="md" value="a" onChange={() => {}} items={[
              { id: 'a', label: 'Left section' }, { id: 'b', label: 'Left section' },
              { id: 'c', label: 'Left section', iconStart: 'arrow-left', iconEnd: 'arrow-right' }, { id: 'd', label: 'Left section', disabled: true },
            ]} />
          </Row>
          <Row label="new tab error">
            <NewTab error="Dummy text error message" />
          </Row>
        </Section>

        <Section id="status" title="Status">
          <Row label="chip">
            {['open', 'in progress', 'done'].map((s) => (
              <StatusChip key={s} selected={chips.includes(s)} onClick={() => setChips((c) => (c.includes(s) ? c.filter((x) => x !== s) : [...c, s]))}>{s}</StatusChip>
            ))}
            <StatusChip size="sm">Pending</StatusChip>
            <StatusChip disabled>Closed</StatusChip>
          </Row>
          <Row label="badge">
            <StatusBadge tone="progress">Open</StatusBadge>
            <StatusBadge tone="success">Running</StatusBadge>
            <StatusBadge tone="warning">Pending</StatusBadge>
            <StatusBadge tone="error">Critical</StatusBadge>
            <StatusBadge tone="info">Info</StatusBadge>
            <StatusBadge tone="neutral">Offline</StatusBadge>
          </Row>
        </Section>

        <Section id="notifications" title="Notifications">
          <div className="pg-stack">
            <Notification tone="info" title="Export started" onClose={() => {}}>Your export is being prepared.</Notification>
            <Notification tone="success" title="Saved" onClose={() => {}}>Equipment saved.</Notification>
            <Notification tone="warning" title="Service due" onClose={() => {}}>Service is due in 3 days.</Notification>
            <Notification tone="error" title="Connection lost" onClose={() => {}}>Check your network and try again.</Notification>
          </div>
          <Row>
            <Notification variant="toast" tone="info" title="Informational notification" timestamp="Time stamp 12:04:31" onClose={() => {}}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
            </Notification>
            <Notification variant="toast" tone="error" title="Upload failed" timestamp="Time stamp 12:05:10" onClose={() => {}}>
              The file is larger than 20 MB.
            </Notification>
          </Row>
        </Section>

        <Section id="tooltip" title="Tooltip">
          <Row>
            <Tooltip content="Edit equipment"><IconButton icon="edit" label="Edit" /></Tooltip>
            <Tooltip content="Light tooltip" tone="light" placement="bottom"><Button variant="secondary" size="sm">Hover me</Button></Tooltip>
            <Tooltip content="On the right" placement="right"><Button variant="text">Focus me</Button></Tooltip>
          </Row>
        </Section>

        <Section id="accordion" title="Accordion">
          <Accordion defaultOpen={['a']} items={[
            { id: 'a', title: 'Machine details', content: 'Serial number, model year and owner.' },
            { id: 'b', title: 'Running hours', meta: '45,125', content: 'Total engine hours since commissioning.' },
            { id: 'c', title: 'Archived documents', disabled: true, content: '' },
          ]} />
        </Section>

        <Section id="slider" title="Slider">
          <div className="pg-narrow"><Slider label="Fuel threshold" value={slider} onChange={setSlider} /></div>
        </Section>

        <Section id="dialog" title="Dialog" lead="Figma &quot;Session Time out&quot;: 512px Smoke panel, radius 12, 64px header, 48px Silver Chalice icon, 320 x 48 action, Silver Chalice overlay at 60%.">
          <Button onClick={() => setDialog(true)}>Open dialog</Button>
          <Dialog open={dialog} onClose={() => setDialog(false)} title="Session Time out"
            description="You have been inactive for 15min and there might be updates"
            actions={<Button size="md" onClick={() => setDialog(false)}>Refresh page</Button>} />
        </Section>

        <Section id="drawer" title="Drawer" lead="The full record drawer from the reference, built only from Syn components: header with status and actions; title, properties, collaborators and tags rows; Details with the equipment empty state and the Protocol (damage cards, photos, attachments); Custom fields; Checklist with progress; Resources with the cost table; Comments and Activity with threaded replies; and the Discard / Update footer.">
          <Button onClick={() => setDrawer(true)}>Open drawer</Button>
          <RecordDrawer open={drawer} onClose={() => setDrawer(false)} />
        </Section>
      </main>
    </div>
  );
}
