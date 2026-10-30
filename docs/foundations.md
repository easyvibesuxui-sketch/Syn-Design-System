# Foundations

All values come from the Figma file's variable collections (`Colors`, `Type Primitives`, `Typography tokens`,
the `Button size/*` floats) or were measured from its component sets. The source of truth is
`tokens/syn.tokens.json`.

## Colour

### Primitives

| Token | Value | Figma variable |
| --- | --- | --- |
| `--syn-color-primary-candy-apple` | `#ff1900` | Primary/Candy Apple |
| `--syn-color-secondary-dark-sienna` | `#411817` | Secondary/Dark Sienna |
| `--syn-color-secondary-jet` | `#343434` | Secondary/Jet |
| `--syn-color-secondary-silver-chalince` | `#a7b0b3` | Secondary/Silver Chalince |
| `--syn-color-secondary-amber` | `#fe7d00` | Secondary/Amber |
| `--syn-color-secondary-dodger-blue` | `#459af7` | Secondary/Dodger Blue |
| `--syn-color-secondary-xanthous` | `#f4b642` | Secondary/Xanthous |
| `--syn-color-black-eerie-black` | `#151515` | Black/Eerie Black |
| `--syn-color-grey-cultured` | `#f1f1f1` | Grey/Cultured |
| `--syn-color-light-misty-rose` | `#ffe7e5` | Light/Misty Rose |
| `--syn-color-light-snow` | `#fffcfc` | Light/Snow |
| `--syn-color-light-smoke` | `#fbfbfb` | Light/Smoke |
| `--syn-color-error-vermilion` | `#ec0808` | Error/Vermilion |
| `--syn-color-pending-honey` | `#ffb30f` | Pending/Honey |
| `--syn-color-success-mantis` | `#71c562` | Success/Mantis |
| `--syn-color-disabled-gray-x` | `#b9b9b9` | Disabled/Gray X |
| `--syn-color-white-white` | `#ffffff` | White/White |
| `--syn-color-unnamed-colors-ghost` | `#f1f5f8` | unnamed, close-button fill |

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
Every Figma text style is a token and a utility class, e.g. `font: var(--syn-type-titles-title-1)` or
`class="syn-text-titles-title-1"`.

| Token (`--syn-type-…`) | Figma text style | Font |
| --- | --- | --- |
| `titles-display-1` | Titles/Display 1 | Montserrat SemiBold 28/34 |
| `titles-display-2` | Titles/Display 2 | ABC Favorit Expanded Medium 24/32 |
| `titles-title-1` | Titles/Title 1 | ABC Favorit Expanded Medium 20/24 |
| `titles-title-2` | Titles/Title 2 | ABC Favorit Expanded Medium 18/22 |
| `titles-title-3` | Titles/Title 3 | ABC Favorit Expanded Medium 16/20 |
| `titles-title-4` | Titles/Title 4 | ABC Favorit Expanded Medium 14/20 |
| `titles-title-5` | Titles/Title 5 | ABC Favorit Expanded Medium 12/15 |
| `titles-title-6` | Titles/Title 6 | ABC Favorit Expanded Medium 10/15 |
| `titles-title-7` | Titles/Title 7 | Montserrat SemiBold 18/20 |
| `titles-title-8` | Titles/Title 8 | Montserrat SemiBold 14/20 |
| `text-body-l` | Text/Body L | Montserrat Medium 18/22 |
| `text-body-m` | Text/Body M | Montserrat Medium 16/140% |
| `text-body-m-2` | Text/Body M 2 | Montserrat Regular 16/140% |
| `text-body-s` | Text/Body S | Montserrat Medium 14/18 |
| `text-body-s-2` | Text/Body S 2 | Montserrat Regular 14/18 |
| `text-body-xs` | Text/Body XS | Montserrat Medium 12/140% |
| `text-body-xs-2` | Text/Body XS 2 | Montserrat Regular 12/15 |
| `text-caption-1` | Text/Caption 1 | Montserrat Medium 10/140% |
| `text-caption-2` | Text/Caption 2 | Montserrat Regular 10/15 |
| `text-body-link-12` | Text/Body link 12 | Montserrat Medium 12/140% |
| `text-body-link-14` | Text/Body link 14 | Montserrat Medium 14/140% |
| `button-text-button-highlighted-large` | Button's text/Button highlighted large | ABC Favorit Expanded Medium 18/140% |
| `button-text-button-highlighted-medium` | Button's text/Button highlighted Medium | ABC Favorit Expanded Medium 16/140% |
| `button-text-button-secondary-large` | Button's text/Button secondary Large | Montserrat Medium 16/140% |
| `button-text-button-secondary-m` | Button's text/Button secondary M | Montserrat Medium 14/18 |
| `button-text-button-secondary-s` | Button's text/Button secondary S | Montserrat Medium 12/140% |
| `button-text-button-secondary-s2` | Button's text/Button secondary S2 | Montserrat Regular 12/140% |

Three more sizes are used by Figma layers that have no text style. They are kept as `components-*` tokens:
`components-choice-label` (Montserrat Regular 15/18, checkbox, radio and switch labels), `components-choice-error`
(Montserrat Light 12/15, their errors) and `components-error-input-placeholder` (Montserrat Regular 18/22, the
"Error input large" placeholder).

Figma itself has text styles with the same values under different names (Body XS = Button secondary S = Body
link 12; Body M = Button secondary Large). They stay separate tokens because they are separate Figma styles.

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
- **Radius** (one token per value): `--syn-radius-element` 8px on every element (button, field, dropdown,
  chip, tooltip, tab); `--syn-radius-widget` 12px on large widgets and pages (sections, cards, dialogs,
  notifications); `--syn-radius-drawer` 48px on the drawer's top-left corner; `--syn-radius-xs` 2px on the
  square checkbox; `--syn-radius-full` on the round checkbox, radios, switches and pills.
- **Attached elements**: a dropdown list opens 2px under its field and hints and errors sit 2px under the
  element, both `--syn-space-2`.
- **Shadow** `float` = `4px 4px 40px rgba(21,21,21,.14)` (toasts, menus); `knob` =
  `3px 3px 6px rgba(65,24,24,.10)` (switch).
- **Opacity** `hover` = 0.74: every filled control fades to 74% on hover.
- **Focus**: a 1px Eerie Black ring 2px outside the control (buttons, choices) or a 2px border (fields).
