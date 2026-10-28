import { useEffect, useState, type ReactNode } from 'react';
import {
  Accordion, Button, Checkbox, Dialog, Icon, IconButton, Notification, Radio, RadioGroup, Select, Slider,
  StatusBadge, StatusChip, Switch, Tabs, TextField, Tooltip, iconNames, tokens,
} from '../src';

const sections = [
  ['colors', 'Colour'], ['typography', 'Typography'], ['spacing', 'Spacing & shape'], ['icons', 'Icons'],
  ['buttons', 'Buttons'], ['inputs', 'Text fields'], ['select', 'Select'], ['choices', 'Checkbox & radio'],
  ['switch', 'Switch'], ['tabs', 'Tabs'], ['status', 'Status'], ['notifications', 'Notifications'],
  ['tooltip', 'Tooltip'], ['accordion', 'Accordion'], ['slider', 'Slider'], ['dialog', 'Dialog'],
] as const;

function Section({ id, title, lead, children }: { id: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <section id={id} className="pg-section">
      <h2 className="syn-text-display-2">{title}</h2>
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [tab, setTab] = useState('overview');
  const [chips, setChips] = useState<string[]>(['open']);
  const [plan, setPlan] = useState('month');
  const [dialog, setDialog] = useState(false);
  const [slider, setSlider] = useState(40);
  const [machine, setMachine] = useState<string>();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="syn-root pg">
      <aside className="pg-nav">
        <div className="pg-brand">
          <span className="pg-brand__mark" aria-hidden />
          <span className="syn-text-title-3">Syn</span>
        </div>
        <nav aria-label="Sections">
          {sections.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
        <Switch label="Dark theme" size="sm" checked={theme === 'dark'} onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')} />
      </aside>

      <main className="pg-main">
        <header className="pg-hero">
          <p className="syn-text-title-5 pg-eyebrow">Design system · v0.1</p>
          <h1 className="syn-text-display-1">Syn</h1>
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
                <span className="syn-text-body-xs">{name}</span>
                <code>{value}</code>
              </div>
            ))}
          </div>
          <div className="pg-semantic">
            {semanticGroups.map(([group, values]) => (
              <div key={group}>
                <h3 className="syn-text-title-4">{group}</h3>
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

        <Section id="spacing" title="Spacing & shape">
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
          <Row label="Shadow">
            {Object.entries(tokens.primitive.shadow).map(([k, v]) => (
              <div key={k} className="pg-shadow" style={{ boxShadow: v }}><code>{k}</code></div>
            ))}
          </Row>
        </Section>

        <Section id="icons" title="Icons" lead={`${iconNames.length} icons exported from the Figma Icons page, drawn on a 20px grid. They inherit currentColor.`}>
          <div className="pg-icons">
            {iconNames.map((name) => (
              <div key={name} className="pg-icon"><Icon name={name} /><code>{name}</code></div>
            ))}
          </div>
        </Section>

        <Section id="buttons" title="Buttons" lead="Three heights (56 / 48 / 36). Filled buttons fade to 74% on hover; focus draws a 1px ring 3px outside.">
          {(['primary', 'secondary', 'accent', 'brand'] as const).map((variant) => (
            <Row key={variant} label={variant}>
              <Button variant={variant} size="lg" iconStart="chevron-left" iconEnd="arrow-right">Action</Button>
              <Button variant={variant} size="md">Action</Button>
              <Button variant={variant} size="sm">Action</Button>
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
            <IconButton icon="close" label="Close" />
            <IconButton icon="edit" label="Edit" />
            <IconButton icon="more-vertical" label="More" />
            <IconButton icon="close" label="Clear" size="sm" />
          </Row>
        </Section>

        <Section id="inputs" title="Text fields" lead="The label sits in the placeholder position and floats up on focus (Candy Apple) or once filled (Silver Chalice).">
          <div className="pg-grid">
            <TextField label="First name" iconStart="person" hint="As it appears on your ID" onClear={() => {}} />
            <TextField label="First name" defaultValue="John Doe" iconStart="person" onClear={() => {}} />
            <TextField label="Weight" prefix="$" suffix="kg" defaultValue="1200" />
            <TextField label="Nickname" maxLength={20} showCount />
            <TextField label="Email" defaultValue="john@" error={['Enter a full email address', 'Use your work domain']} />
            <TextField label="First name" disabled defaultValue="Locked" />
            <TextField label="Search" size="md" iconEnd="search" />
            <TextField label="Max distance" size="sm" suffix="km" />
          </div>
        </Section>

        <Section id="select" title="Select">
          <div className="pg-grid">
            <Select label="Machine" iconStart="settings" value={machine} onChange={setMachine} placeholder="Choose"
              options={[{ value: 'excavator', label: 'Excavator' }, { value: 'loader', label: 'Wheel loader' }, { value: 'crane', label: 'Crane' }, { value: 'truck', label: 'Dump truck', disabled: true }]} />
            <Select label="Size" size="md" defaultValue="m" options={[{ value: 's', label: 'Small' }, { value: 'm', label: 'Medium' }, { value: 'l', label: 'Large' }]} />
            <Select label="Region" error="Pick a region" options={[{ value: 'eu', label: 'Europe' }]} />
            <Select label="Locked" disabled options={[{ value: 'x', label: 'X' }]} />
          </div>
        </Section>

        <Section id="choices" title="Checkbox & radio">
          <Row label="checkbox">
            <Checkbox label="Text" />
            <Checkbox label="Text" defaultChecked />
            <Checkbox label="Text" indeterminate />
            <Checkbox label="Large" size="lg" defaultChecked />
            <Checkbox label="Text" disabled />
            <Checkbox label="Text" disabled defaultChecked />
            <Checkbox label="Accept the terms*" error="Check this to proceed" />
          </Row>
          <RadioGroup label="Billing period" value={plan} onChange={setPlan} inline>
            <Radio value="date" label="Specific date" />
            <Radio value="month" label="By month" />
            <Radio value="year" label="By year" disabled />
          </RadioGroup>
        </Section>

        <Section id="switch" title="Switch" lead="On-state uses Dark Sienna, off uses Gray X.">
          <Row>
            <Switch label="Notifications" size="sm" defaultChecked />
            <Switch label="Notifications" defaultChecked />
            <Switch label="Notifications" size="lg" />
            <Switch label="Mode" hideLabel stateLabels={['On', 'Off']} defaultChecked />
            <Switch label="Disabled" disabled defaultChecked />
            <Switch label="Required" error="Switch this to proceed" />
          </Row>
        </Section>

        <Section id="tabs" title="Tabs">
          <Tabs label="Equipment" value={tab} onChange={setTab} items={[
            { id: 'overview', label: 'Overview', content: <p>Overview panel.</p> },
            { id: 'maintenance', label: 'Maintenance', icon: 'settings', content: <p>Maintenance panel.</p> },
            { id: 'history', label: 'History', icon: 'history', content: <p>History panel.</p> },
            { id: 'archive', label: 'Archive', disabled: true },
          ]} />
        </Section>

        <Section id="status" title="Status">
          <Row label="chip">
            {['open', 'in progress', 'done'].map((s) => (
              <StatusChip key={s} selected={chips.includes(s)} onClick={() => setChips((c) => (c.includes(s) ? c.filter((x) => x !== s) : [...c, s]))}>{s}</StatusChip>
            ))}
            <StatusChip size="sm" icon="check">Approved</StatusChip>
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
            <Notification tone="info" onClose={() => {}}>Your export is being prepared.</Notification>
            <Notification tone="success" onClose={() => {}}>Equipment saved.</Notification>
            <Notification tone="warning" onClose={() => {}}>Service is due in 3 days.</Notification>
            <Notification tone="error" onClose={() => {}}>Connection lost.</Notification>
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

        <Section id="dialog" title="Dialog">
          <Button onClick={() => setDialog(true)}>Open dialog</Button>
          <Dialog open={dialog} onClose={() => setDialog(false)} title="Session time out" size="sm"
            actions={<Button size="sm" fullWidth onClick={() => setDialog(false)}>Refresh page</Button>}>
            <Icon name="info-circle" size={28} />
            <p>You have been inactive for 15 min and there might be updates.</p>
          </Dialog>
        </Section>
      </main>
    </div>
  );
}
