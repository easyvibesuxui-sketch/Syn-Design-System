# Foundations

All values come from the Figma file's variable collections (`Colors`, `Type Primitives`, `Typography tokens`,
the `Button size/*` floats) or were measured from its component sets. The source of truth is
`tokens/syn.tokens.json`.

## Colour

### Primitives

| Token | Value | Figma variable |
| --- | --- | --- |
| `--syn-color-candy-apple` | `#ff1900` | Primary/Candy Apple |
| `--syn-color-dark-sienna` | `#411817` | Secondary/Dark Sienna |
| `--syn-color-jet` | `#343434` | Secondary/Jet |
| `--syn-color-silver-chalice` | `#a7b0b3` | Secondary/Silver Chalince |
| `--syn-color-amber` | `#fe7d00` | Secondary/Amber |
| `--syn-color-dodger-blue` | `#459af7` | Secondary/Dodger Blue |
| `--syn-color-xanthous` | `#f4b642` | Secondary/Xanthous |
| `--syn-color-eerie-black` | `#151515` | Black/Eerie Black |
| `--syn-color-cultured` | `#f1f1f1` | Grey/Cultured |
| `--syn-color-misty-rose` | `#ffe7e5` | Light/Misty Rose |
| `--syn-color-snow` | `#fffcfc` | Light/Snow |
| `--syn-color-smoke` | `#fbfbfb` | Light/Smoke |
| `--syn-color-vermilion` | `#ec0808` | Error/Vermilion |
| `--syn-color-honey` | `#ffb30f` | Pending/Honey |
| `--syn-color-mantis` | `#71c562` | Success/Mantis |
| `--syn-color-gray-x` | `#b9b9b9` | Disabled/Gray X |
| `--syn-color-white` | `#ffffff` | White/White |
| `--syn-color-ghost` | `#f1f5f8` | unnamed, close-button fill |

### Semantic roles

| Role | Light | Used for |
| --- | --- | --- |
| `text-primary` / `-secondary` | Eerie Black / Jet | Body copy, labels, option text |
| `text-muted` | Silver Chalice | Placeholders, inactive tabs, units |
| `text-disabled` | Gray X | Disabled controls |
| `text-brand` | Candy Apple | Focused field label |
| `text-error`, `border-error`, `status-error` | Vermilion | Validation |
| `surface-default` / `-raised` | White / Snow | Page, cards, dialogs, error fields |
| `surface-subtle` / `-muted` | Smoke / Cultured | Hover rows, disabled fields, outline-button hover |
| `surface-highlight` | Misty Rose | Option hover, selected status row |
| `surface-inverse` | Eerie Black | Selected tab |
| `surface-overlay` | Silver Chalice at 60% | Dialog backdrop |
| `border-default` / `-strong` / `-muted` | Cultured / Eerie Black / Silver Chalice | Resting, hover and focus, dividers |
| `action-primary` | Eerie Black | Primary buttons |
| `action-brand` | Candy Apple | Brand buttons, slider fill |
| `action-accent` | Amber | Accent ("Secondary Filled") buttons |
| `action-toggle` | Dark Sienna | Switch on-state |
| `status-info` / `-success` / `-warning` / `-progress` | Dodger Blue / Mantis / Honey / Amber | Notifications, status dots |

### Themes

The Figma library defines one theme, light, and Syn keeps it that way. There is no `[data-theme]` override.

## Typography

Two families: **ABC Favorit Expanded** (titles, highlighted buttons) and **Montserrat** (everything else).
Every Figma text style is a token and a utility class, e.g. `font: var(--syn-type-title-1)` or
`class="syn-text-title-1"`.

| Token | Family | Size / line | Weight |
| --- | --- | --- | --- |
| `display-1` | Montserrat | 28 / 34 | 600 |
| `display-2` | Favorit | 24 / 32 | 500 |
| `title-1` … `title-6` | Favorit | 20/24, 18/22, 16/20, 14/20, 12/15, 10/15 | 500 |
| `title-7`, `title-8` | Montserrat | 18/20, 14/20 | 600 |
| `body-l` | Montserrat | 18 / 22 | 500 |
| `body-m`, `body-m-regular` | Montserrat | 16 / 1.4 | 500, 400 |
| `body-s`, `body-s-regular` | Montserrat | 14 / 18 | 500, 400 |
| `body-xs`, `body-xs-regular` | Montserrat | 12 / 1.4, 12 / 15 | 500, 400 |
| `caption-1`, `caption-2` | Montserrat | 10 / 1.4, 10 / 15 | 500, 400 |
| `button-highlight-l`, `-m` | Favorit | 18, 16 / 1.4 | 500 |
| `button-l`, `-m`, `-s` | Montserrat | 16 / 1.4, 14 / 18, 12 / 1.4 | 500 |

## Space, size, shape

- **Sizing rule**: every size is an even number: 2, 4, 6, 8, 10, 12, 16, 20 or 24, and above 24 a
  multiple of 8 (32, 40, 48, 56, 64…). Strokes (1px hairlines, the 1.5px Figma control borders) and the type
  scale's line heights are the only exceptions.
- **Space** `--syn-space-{px}`: the token name is its value: `--syn-space-2` is 2px, `--syn-space-24` is
  24px. Steps: 0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80, 96.
- **Element heights** `--syn-size-control-xs/sm/md/lg`: smallest 24, small 36, medium 48, large 56 px.
  Buttons, icon buttons, text fields, selects and status chips take `size` `xs` · `sm` · `md` · `lg`.
- **Grid**: 12 columns (`--syn-grid-columns`), 24px gutter (`--syn-grid-gutter`), 32px page and drawer
  margin (`--syn-grid-margin`). Use `Grid` and `GridItem`.
- **Radius**: `--syn-radius-element` 8px on every element (button, field, dropdown, chip, tooltip, tab);
  `--syn-radius-widget` and `--syn-radius-page` 12px on large widgets and pages (sections, cards, dialogs,
  notifications); `--syn-radius-drawer` 48px on the drawer's top-left corner. Primitives: `xs` 2 (square
  checkbox), `md` 8, `lg` 12, `xl` 48, `full` (round checkbox, radio, switch, pills).
- **Gaps**: `--syn-gap-dropdown` 2px between a field and its open list; `--syn-gap-message` 2px between an
  element and the hint or error under it.
- **Shadow** `float` = `4px 4px 40px rgba(21,21,21,.14)` (toasts, menus); `knob` =
  `3px 3px 6px rgba(65,24,24,.10)` (switch).
- **Opacity** `hover` = 0.74: every filled control fades to 74% on hover.
- **Focus**: a 1px Eerie Black ring 2px outside the control (buttons, choices) or a 2px border (fields).
