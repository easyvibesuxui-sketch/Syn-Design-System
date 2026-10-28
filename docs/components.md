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
`20` or `24`. 1.5px Eerie Black border (Jet on hover, Gray X disabled), Jet fill with Figma's 2px white
check when selected, label Montserrat Regular 15 with an 8px gap. `error` adds a Vermilion ring at 54% and a
red asterisk; `errorStyle` picks the Figma "error 1" dark bubble (`tooltip`) or the "Error 2" red line
(`inline`), 2px under the control in Montserrat Light 12. `RadioGroup` renders a `fieldset` with `legend`
(`hideLabel` to keep it for screen readers only), takes `value`/`onChange`, `size`, `inline`, `error`.

## Switch

Figma: *Small toggle* (`size={20}`, 34 x 20) and *Default size toggle* (`size={24}`, 48 x 24, the default).
`role="switch"` on a native checkbox. Track and thumb sit at the Figma x positions for on and off; pressing
stretches the thumb (22 / 28.6px). `loading` spins a ring in the thumb. `error` with `errorStyle`
(`tooltip` = "Error off", `inline` = "Error on"). The label is hidden by default; `hideLabel={false}` shows
it to the right.

## Tabs

Figma: *Tab*. Five states: Default (white, Silver Chalice text), Hover (Cultured with a 1px Candy Apple
underline), Active (Eerie Black, Snow text), Active hover (Jet) and Disabled (Cultured, Gray X). Each tab has
radius 2 on the left and a 16px Silver Chalice separator on the right. `size` `lg` ("BIG", 48px, Medium 16)
or `md` ("Default size", 36px or 40px with icons, Medium 14). Items take `iconStart`/`iconEnd`
(`'arrow-left'`, `'arrow-right'` or any `IconName`), `disabled` and `content` (renders a `tabpanel`). Arrow
keys, Home and End move selection. `end` holds extra content such as `NewTab`.

## NewTab

Figma: *New Tab*. Default "Add new" with a plus-circle; Hover and Tap (typing a name) on Smoke; Filled and
Selected (Candy Apple underline) with a trash button; Error with a red underline and message. 220 x 48,
ABC Favorit Expanded Medium 12/15. `name`, `selected`, `error`, `onCreate`, `onSelect`, `onRemove`.

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

Figma: *Session Time out* (Banners page). Built on native `<dialog>` (focus trap, Escape). 507px Smoke panel,
1px white border, radius 12; 64px header with the title centred (ABC Favorit Expanded Medium 14/20) and a
28px Silver Chalice X; body padding 32 with a 48px icon and a Medium 14/18 description; footer padding
20/24/20/32 for a 320 x 48 action; 60% Silver Chalice backdrop. `title`, `description`, `icon`, `actions`,
`onClose`.

## Slider

Figma: *Slider 1*, *Slider button*, *Slider button with text*. Native range input: 2px Silver Chalice
track, Candy Apple fill, 30px Snow thumb, pill value bubble. `min`, `max`, `step`, `format`.

## Icon

All 164 icons from *Icons → Main icons*, at their native Figma size (most 20 x 20; file formats 24 x 30).
`<Icon name="search" />`; `size` scales the longer side. Single-ink icons draw in `currentColor`, multicolour
ones keep their colours (`iconData[name].multicolor`). Pass `title` to make an icon meaningful to screen
readers, otherwise it is hidden. `iconNames` lists them all; `iconAliases` maps the earlier names
(`chevron-down` → `down`, `trash` → `trash-bin`, …).
