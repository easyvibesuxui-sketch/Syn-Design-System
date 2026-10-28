import { useState, type ReactNode } from 'react';
import {
  Accordion, Button, Checkbox, Dialog, Icon, IconButton, NewTab, Notification, Radio, RadioGroup, Select, Slider,
  StatusBadge, StatusChip, Switch, Tabs, TextField, Tooltip, iconData, iconNames, tokens,
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
  const [tab, setTab] = useState('overview');
  const [extraTabs, setExtraTabs] = useState<string[]>(['General']);
  const [extraSelected, setExtraSelected] = useState<string>();
  const [chips, setChips] = useState<string[]>(['open']);
  const [plan, setPlan] = useState('month');
  const [dialog, setDialog] = useState(false);
  const [slider, setSlider] = useState(40);
  const [machine, setMachine] = useState<string>();

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

        <Section id="inputs" title="Text fields" lead="Figma Inputs page. With an icon the Candy Apple label stays above the placeholder; without one the label is the placeholder until focus. Hover draws a 1px Eerie Black border, focus 2px outside; errors use a Snow fill and a Vermilion border, with the message 2px below.">
          <div className="pg-grid">
            <TextField label="First name" iconStart="person" hint="Hint text" onClear={() => {}} />
            <TextField label="First name" defaultValue="E.G. John Doe" iconStart="person" hint="Hint text" onClear={() => {}} />
            <TextField label="First name" iconStart="person" disabled hint="Hint text" />
            <TextField label="First name" />
            <TextField label="First name" defaultValue="E.G. John Doe" onClear={() => {}} />
            <TextField label="First name" error="Dummy text error message" />
            <TextField label="First name" defaultValue="E.G. John Doe" error="Dummy text error message" />
            <TextField label="First name" disabled error="Dummy text error message" />
            <TextField label="First name" size="md" />
            <TextField label="First name" size="md" defaultValue="E.G. John Doe" />
            <TextField label="First name" size="sm" />
            <TextField label="Email" defaultValue="john@" error={['Enter a full email address', 'Use your work domain']} />
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

        <Section id="choices" title="Checkbox & radio" lead="Figma &quot;Checkbox 20 px&quot; / &quot;24 px&quot; and the radio groups: 1.5px Eerie Black border, Jet when hovered or selected, Gray X when disabled. Errors add a Vermilion ring and asterisk, with either the dark bubble (error 1) or red text (error 2) 2px below.">
          {([20, 24] as const).map((size) => (
            <Row key={size} label={`checkbox ${size}`}>
              <Checkbox size={size} label="Text" />
              <Checkbox size={size} label="Text" defaultChecked />
              <Checkbox size={size} label="Text" disabled />
              <Checkbox size={size} label="Text" disabled defaultChecked />
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

        <Section id="switch" title="Switch" lead="Figma &quot;Small toggle&quot; (size 20, 34 x 20) and &quot;Default size toggle&quot; (size 24, 48 x 24). On is Dark Sienna; off is Silver Chalice with a Gray X border. Press stretches the thumb.">
          {([20, 24] as const).map((size) => (
            <Row key={size} label={`size ${size}`}>
              <Switch size={size} label="On" defaultChecked />
              <Switch size={size} label="Loading" loading defaultChecked />
              <Switch size={size} label="Disabled on" disabled defaultChecked />
              <Switch size={size} label="Off" />
              <Switch size={size} label="Loading off" loading />
              <Switch size={size} label="Disabled off" disabled />
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

        <Section id="dialog" title="Dialog" lead="Figma &quot;Session Time out&quot;: 507px Smoke panel, radius 12, 64px header, 48px Silver Chalice icon, 320 x 48 action, Silver Chalice overlay at 60%.">
          <Button onClick={() => setDialog(true)}>Open dialog</Button>
          <Dialog open={dialog} onClose={() => setDialog(false)} title="Session Time out"
            description="You have been inactive for 15min and there might be updates"
            actions={<Button size="md" onClick={() => setDialog(false)}>Refresh page</Button>} />
        </Section>
      </main>
    </div>
  );
}
