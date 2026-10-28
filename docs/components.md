# Components

Every component reads semantic tokens only, ships its own CSS, forwards native props, and is keyboard
operable. Figma names are given so designers and developers can find each other's work.

## Button

Figma: *Buttons → Buttons large* (`State × Size × Stile`).

| Prop | Values | Notes |
| --- | --- | --- |
| `variant` | `primary` · `secondary` · `accent` · `brand` · `text` | Figma Default · Outline · Secondary Filled · (Candy Apple, from the Colors examples) · Text |
| `size` | `lg` 56 · `md` 48 · `sm` 36 | Figma Large · Primary · Small |
| `iconStart`, `iconEnd` | any `IconName` | |
| `loading` | boolean | Spinner, `aria-busy`, disabled |
| `fullWidth` | boolean | Figma "Stretched" |

`IconButton` (Figma *Close button*): round ghost button, `size` `sm` 24 or `md` 30, requires `label`.

## TextField

Figma: *Inputs → input large / Default size input / Small size input* and the icon and unit variants.
States Default, Hover, Focused, Typing, Filled, Disabled and error are all CSS states of one component.

Props: `label` (required, floats), `size` `lg`/`md`/`sm`, `hint`, `error` (string or string[] for the
"multiple error" variant), `iconStart`, `iconEnd`, `prefix`, `suffix` ("$", "kg"), `onClear` (shows the
clear button), `showCount` with `maxLength` ("0/20").

## Select

Figma: *Dropdown* and *Select list*. A select-only combobox (WAI-ARIA pattern): Up/Down/Home/End move,
Enter/Space choose, Escape closes. Options hover in Misty Rose. Props: `label`, `options`
(`{ value, label, disabled? }`), `value`/`defaultValue`, `onChange`, `placeholder`, `size`, `iconStart`,
`hint`, `error`, `disabled`.

## Checkbox, Radio, RadioGroup

Figma: *Checkbox 20 px / 24 px*, *radio group 20 px / 24 px*. Native inputs under custom boxes. `size`
`md` 20 or `lg` 24. Checkbox supports `indeterminate` and `error`. `RadioGroup` renders a `fieldset` with
`legend`, takes `value`/`onChange`, `inline`, `error`.

## Switch

Figma: *Small toggle*, *Default size toggle*, *Big toggle*, *Toggle with label*. `role="switch"` on a
native checkbox. `size` `sm`/`md`/`lg`, `stateLabels={['On', 'Off']}`, `hideLabel`, `error`.

## Tabs

Figma: *Tab*, *Tab switcher*. Segmented tabs; the selected tab fills Eerie Black. Arrow keys, Home and End
move selection (automatic activation). Items can carry `icon`, `disabled` and `content` (renders a
`tabpanel`). `size` `lg` 48 or `md` 40.

## Tooltip

Figma: *Tooltip black*, *Tooltip grey label*. Opens on hover and focus, closes on Escape, wired with
`aria-describedby`. `placement` top/bottom/left/right, `tone` `dark` (Jet) or `light` (Cultured with a
border).

## Notification

Figma: *Notification - High Contrast - Inline* and *- Toast*. White card, 3px status bar on the left,
float shadow. `tone` info/success/warning/error, `variant` `inline` or `toast` (title, message,
`timestamp`), `onClose`. Error and warning use `role="alert"`, the rest `role="status"`.

## StatusChip and StatusBadge

Figma: *Status Container*. `StatusChip` is a toggle (`aria-pressed`) that fills Mantis when selected;
`size` `xs` 24 (pill), `sm` 36, `md` 48, `lg` 56. `StatusBadge` is read-only with a coloured dot; `tone`
progress/success/warning/error/info/neutral.

## Accordion

Figma: *Accordion*, *Accordion with icons*. 40px headers with a round chevron, Silver Chalice dividers,
optional `meta` value box. `multiple`, `defaultOpen`. Headers are buttons inside `h3` with
`aria-expanded`/`aria-controls`.

## Dialog

Figma: *Popup*, *Popup-Yes no*, and the session-timeout banner. Built on native `<dialog>` (focus trap,
Escape). Snow panel with a 4px Cultured ring over a 60% Silver Chalice backdrop. `title`, `actions`,
`size` `sm` 400 / `md` 480 / `lg` 600, `onClose`.

## Slider

Figma: *Slider 1*, *Slider button*, *Slider button with text*. Native range input: 2px Silver Chalice
track, Candy Apple fill, 30px Snow thumb, pill value bubble. `min`, `max`, `step`, `format`.

## Icon

52 icons from *Icons → Main icons*, 20px grid, `currentColor`. `<Icon name="search" size={20} />`;
pass `title` to make it meaningful to screen readers, otherwise it is hidden. `iconNames` lists them all.
