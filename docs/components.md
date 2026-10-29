# Components

Every component reads semantic tokens only, ships its own CSS, forwards native props, and is keyboard
operable. Figma names are given so designers and developers can find each other's work.

## Button

Figma: *Buttons → Buttons large* (`State × Size × Stile`).

| Prop | Values | Notes |
| --- | --- | --- |
| `variant` | `primary` · `secondary` · `accent` · `brand` · `text` | Figma Default · Outline · Secondary Filled · (Candy Apple, from the Colors examples) · Text |
| `size` | `lg` 56 · `md` 48 · `sm` 36 · `xs` 24 | Figma Large · Primary · Small · smallest |
| `iconStart`, `iconEnd` | any `IconName` | |
| `loading` | boolean | Spinner, `aria-busy`, disabled |
| `fullWidth` | boolean | Figma "Stretched" |

`IconButton` (Figma *Close button*): round ghost button, `size` `xs` 24 (default) · `sm` 36 · `md` 48 · `lg` 56,
requires `label`. `variant="outline"` is the white square with a Cultured border used for row "more" buttons.

## TextField

Figma: *Inputs → input large / Default size input / Small size input* and the icon and unit variants.
States Default, Hover, Focused, Typing, Filled, Disabled and error are all CSS states of one component.

Two kinds: with the label inside (the default; it floats, or stays above the placeholder when there is an
`iconStart`) and without a label (`hideLabel`: only the placeholder and value show; the label is still read by
screen readers). `size` `lg` 56 · `md` 48 · `sm` 36 · `xs` 24; `xs` is always without a label.

Props: `label` (required), `hideLabel`, `size`, `hint`, `error` (string or string[] for the
"multiple error" variant), `iconStart`, `iconEnd`, `prefix`, `suffix` ("$", "kg"), `onClear` (shows the
clear button), `showCount` with `maxLength` ("0/20").

## Select

Figma: *Dropdown* and *Select list*. A select-only combobox (WAI-ARIA pattern): Up/Down/Home/End move,
Enter/Space choose, Escape closes. Options hover in Misty Rose. Props: `label`, `options`
(`{ value, label, disabled? }`), `value`/`defaultValue`, `onChange`, `placeholder`, `size` (`xs`–`lg`),
`hideLabel` (default `true`: only the value shows, as in Figma; `false` puts the label inside), `iconStart`,
`hint`, `error`, `disabled`, `onClear` (Figma's 24px round clear X left of the chevron, shown on hover,
focus and open while a value is selected). The list opens 2px under the field. The chevron sits in a
24px circle: white at rest, Cultured on hover, Eerie Black with a white glyph when focused or open.

## Checkbox, Radio, RadioGroup

Figma: *Checkbox 20 px / 24 px*, *radio group 20 px / 24 px*. Native inputs under custom boxes. `size`
`20` or `24`. Checkbox `shape` `square` (2px corners, the default) or `round` (a circle with the check centred). 1.5px Eerie Black border (Jet on hover, Gray X disabled), Jet fill with Figma's 2px white
check when selected, label Montserrat Regular 15 with an 8px gap. `error` adds a Vermilion ring at 54% and a
red asterisk; `errorStyle` picks the Figma "error 1" dark bubble (`tooltip`) or the "Error 2" red line
(`inline`), 2px under the control in Montserrat Light 12. `RadioGroup` renders a `fieldset` with `legend`
(`hideLabel` to keep it for screen readers only), takes `value`/`onChange`, `size`, `inline`, `error`.

## Switch

Figma: *Small toggle* (`size={20}`, 32 x 20), *Default size toggle* (`size={24}`, 48 x 24, the default) and
*Big toggle* (`size={32}`, 48 x 32). `indicator` is *Toggle with Text and icon*: "On" (`indicatorText`) in the
track when on, a white check when off (sizes 20 and 24).
`role="switch"` on a native checkbox. Track and thumb sit at the Figma x positions for on and off; pressing
stretches the thumb (24 / 28px). `loading` spins a ring in the thumb. `error` with `errorStyle`
(`tooltip` = "Error off", `inline` = "Error on"). The label is hidden by default; `hideLabel={false}` shows
it to the right.

## Tabs

Figma: *Tab*. Five states: Default (white, Silver Chalice text), Hover (Cultured with a 1px Candy Apple
underline), Active (Eerie Black, Snow text), Active hover (Jet) and Disabled (Cultured, Gray X). Each tab has
8px corners and a 16px Silver Chalice separator on the right. `size` `lg` ("BIG", 48px, Medium 16)
or `md` ("Default size", 36px, Medium 14). Items take `iconStart`/`iconEnd`
(`'arrow-left'`, `'arrow-right'` or any `IconName`), `disabled` and `content` (renders a `tabpanel`). Arrow
keys, Home and End move selection. `end` holds extra content such as `NewTab`.

## NewTab

Figma: *New Tab*. Default "Add new" with a plus-circle; Hover and Tap (typing a name) on Smoke; Filled and
Selected (Candy Apple underline) with a trash button; Error with a red underline and message. 220 x 48,
ABC Favorit Expanded Medium 12/15. `name`, `selected`, `error`, `onCreate`, `onSelect`, `onRemove`.

## Tooltip

Figma: *Tooltip black*, *Tooltip grey label*. Opens on hover and focus, closes on Escape, wired with
`aria-describedby`. `placement` top/bottom/left/right, `tone` `dark` (Jet) or `light` (Cultured with a
border). As in Figma: 8px padding, Regular 14 and a 16x8 pointer; corners use the 8px element radius (Figma draws 2px).

## Notification

Figma: *Notification - High Contrast - Inline* and *- Toast*. Card with a status bar on the left (4px),
12px corners and the float shadow. `tone` info/success/warning/error (icons: Info circle, Check in
circle, Warning, the red pause circle), `title`, the message as children, `onClose` (24px round close
with a 12px X). `variant="inline"`: 360 wide, 18px icon, Medium 14 title over a Regular 12 subtitle, Snow.
`variant="toast"`: 288 wide, SemiBold 14 title, Regular 12 message and a Regular 14 `timestamp` on the
left, close on top and a 32px status icon at the bottom on the right; info is white, warning Snow, error and
success Cultured. Error and warning use `role="alert"`, the rest `role="status"`.

## StatusChip and StatusBadge

Figma: *Status Container*. `StatusChip` is a toggle (`aria-pressed`) that fills Mantis when selected;
`size` `xs` 24 (pill), `sm` 36, `md` 48, `lg` 56. It ends in a 20px down chevron (`icon`); disabled is
Cultured with muted text. `StatusBadge` is read-only with a coloured dot; `tone`
progress/success/warning/error/info/neutral.

## Accordion

Figma: *Accordion*, *Accordion with icons*. 40px headers with 8px corners and a round chevron (Eerie Black with a
white glyph when open), Silver Chalice dividers,
optional `meta` value box. `multiple`, `defaultOpen`. Headers are buttons inside `h3` with
`aria-expanded`/`aria-controls`.

## Dialog

Figma: *Session Time out* (Banners page). Built on native `<dialog>` (focus trap, Escape). 512px Smoke panel,
1px white border, radius 12; 64px header with the title centred (ABC Favorit Expanded Medium 14/20) and a
32px close button with the Silver Chalice X; body padding 32 with a 48px icon and a Medium 14/18 description;
footer padding 20/24 for a 320 x 48 action; 60% Silver Chalice backdrop. `title`, `description`, `icon`, `actions`,
`onClose`.

## Drawer and DrawerRow

From the record drawer reference. Native `<dialog>` from the right edge (focus trap, Escape, backdrop click),
up to `width` (default 1280px) wide. Snow panel with a 48px top-left corner; 64px header with `headerStart`
(status, record id) and `headerActions` before the close button; a scrolling body; an 88px white `footer` with
a soft top shadow (a text "Discard" and a primary "Update"). Sections in the body sit 24px apart on the 32px
margin. `DrawerRow` is a full-width row with a Cultured hairline: `label` with an `icon`, the content, and
`end` pinned right. Under 640px rows stack. The complete record screen from the reference is in
`playground/RecordDrawer.tsx`, built only from Syn components.

## Section, Card and Property

`Section` is the large widget ("Details", "Custom fields", "Checklist"): a 36px white header over a Smoke body,
Cultured borders, 12px corners; `collapsible` adds the chevron (`defaultOpen`, or `open`/`onOpenChange`),
`actions` adds header buttons. `Card` is the white inner widget ("Main Loss") with 12px corners and a soft
shadow. `Property` puts a 12px label (optional 12px `icon`) over its value; `variant="tile"` draws it in a Smoke
box with 8px corners.

## Tag

24px tag for tags, collaborators, dates and people: `variant` `solid` (fill from `color`, Eerie Black by default),
`outline`, `soft` (Cultured border; dates, assignees; `muted` greys it) or `dashed` (the "Add" button, with `onClick`).
`shape` `pill` or `rounded` (8px). `icon` adds a 12px icon; `onRemove` adds the remove button (`removeIcon` `close` or
`x-in-circle`). `variant="chip"` is Figma *close button-tag*: 36px, white with a Cultured border, Regular 14 and a 24px
round close; Eerie Black border on hover, Cultured fill when pressed, `disabled` and `loading` states.

## Avatar, Thumbnail, FileItem, EmptyState, ProgressBar

- `Avatar`: 24 or 32px Misty Rose circle with the person glyph, or a photo (`src`).
- `Thumbnail`: square photo (24–56px, default 36) with 4px corners; a zoom button when `onClick` is set. `alt` is required.
- `FileItem`: format badge (`icon`, default `file-formats-pdf`), name in ABC Favorit Expanded Medium 12 and a muted
  `meta` line; `variant="attached"` is Figma *File attached* (48px Snow box, Silver Chalice border, Regular 14 name over a
  Light 14 size, trash button; Cultured with an Eerie Black border on hover); `preview` turns it into the 224px attachment card with the photo on top and a trash button (`onRemove`).
- `EmptyState`: muted 32px icon over a Medium 14 message ("Nothing assigned"), optional `action`.
- `ProgressBar`: "1/3" `label`, the percentage and a 4px Dodger Blue bar; `role="progressbar"` with `title` as its name.
  `variant="line"` is Figma *Loader line*: a bare 8px Amber bar with square ends.

## Table and Value

The "Resources" table: `columns` (`key`, `header`, `render`, `align`, `width`), `rows`, `rowKey`, `rowActions`
(a narrow last column) and `footer` (right-aligned, e.g. the total cost); `caption` names it for screen readers.
White 12px box, 24px muted header, 32px rows split by 2px Cultured lines; a hovered row gets a 1px Eerie
Black outline (Figma data sheet "cell"). It scrolls sideways under 560px.
`Value` prints a number with a muted unit (`<Value unit="Meter">12</Value>`), `muted` greys the number too.

## Segmented

Pill switcher between views ("Comments" / "Activity"): 24px pills at least 128px wide, the current one Eerie Black.
`role="tablist"`; Left/Right move. `options`, `value`, `onChange`, `label`.

## TextArea

Multi-line input, 48px minimum, 8px corners. `variant` `default` (1px Cultured) or `strong` (2px Silver Chalice, the
comment editor); both turn 2px Eerie Black on focus. The label is screen-reader only unless `hideLabel={false}`.

## Checklist and ChecklistItem

A checklist row on Smoke with 8px corners: 20px checkbox and Regular 14 text, `assignee` bottom left, `due` bottom
right, `actions` top right, `extra` under it (people tags). `editing` swaps the text for a `TextArea` and frames the
row with a 1px Eerie Black border.

## Comment, CommentReply and CommentEditor

`Comment`: 24px avatar, `author` (ABC Favorit Expanded Medium 12), `date`, muted `time`, header `actions`; the text
in a white 8px bubble (`active` gives it an Eerie Black border), `footer` (attachment tags, a pill "Reply" button),
`editor` in place of the bubble, and `replies`. Replies (`CommentReply`, with `end` for "12 Replies") hang off a 1px
Silver Chalice thread line. `CommentEditor`: a strong `TextArea` with a text "Discard" and a 96 x 36 Amber "Save".

## Grid and GridItem

The 12-column grid: 24px gutter by default (`gap` takes 8–32), `GridItem` `span` 1–12, and `spanSm` under
640px (the full row by default).

## Slider

Figma: *Slider 1*, *Slider button*, *Slider button with text*. Native range input: 2px Silver Chalice
track, Candy Apple fill, a 32px white thumb with Figma's double arrow (darkens on hover), the label
above and Light 12 Silver Chalice labels under the track (the minimum on the left, the value on the
right). `min`, `max`, `step`, `format`.

## Icon

All 164 icons from *Icons → Main icons*, at their native Figma size (most 20 x 20; file formats 24 x 30).
`<Icon name="search" />`; `size` scales the longer side. Single-ink icons draw in `currentColor`, multicolour
ones keep their colours (`iconData[name].multicolor`). Pass `title` to make an icon meaningful to screen
readers, otherwise it is hidden. `iconNames` lists them all; `iconAliases` maps the earlier names
(`chevron-down` → `down`, `trash` → `trash-bin`, …).
