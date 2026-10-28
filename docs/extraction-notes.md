# Extraction notes

How this system was pulled out of Figma, and the calls made along the way.

## Method

- Colour, type and size values were read from the file's local variables and text styles
  (`Colors`, `Type Primitives`, `Typography tokens`, `Button size/*`).
- Component geometry (heights, paddings, gaps, radii, strokes, fills per state) was read from each
  component set with the Figma Plugin API, variant by variant.
- Icons were exported as SVG from the *Icons* page and normalised to `currentColor`.

## Normalisations

These differ from Figma on purpose. Each one is small and easy to revert in the tokens or component CSS.

| Figma | Syn | Why |
| --- | --- | --- |
| Names such as "Silver Chalince", "Stile", "Dissabled", "Inavilibility" | `silver-chalice`, `variant`, `disabled` | Spelling in code |
| Checkbox and radio labels at Montserrat 15px | `label-m` (Regular 15/18) | Kept as drawn |
| Choice and switch errors in Montserrat Light 12 | `body-xs-light` (Light 12/15) | Kept as drawn |
| Mixed 2px and 8px radii across elements | 8px on every element (fields, selects, buttons, tabs, tooltips, chips), 12px on widgets | Design rule: elements 8, large widgets and pages 12 |
| Icon sizes inside fields of 20 or 24 | 20 | One grid |
| Button focus drawn as an extra 4px frame around the button | `outline: 1px; outline-offset: 2px` | Same look without changing layout; 2px keeps to even sizes |
| Field focus as a 2px stroke outside | 2px box-shadow outside | Same look without a layout shift |
| Error input radius 8 at rest, 2 in other states | 8 in every state | The radius jump reads as a glitch |
| No dark theme in Figma | None | An earlier invented dark theme broke components and was removed |
| Odd or fractional sizes (switch 34 x 20, thumb 24.5, dialog 507, slider thumb 30, tab padding 1/9, gaps 1/3, error bubble 22, new tab 220) | Rounded to the even scale: 32 x 20, 24, 512, 32, 0/8, 2/4, 24, 224 | Design rule: even sizes only, multiples of 8 above 24 |
| Tabs with icons 40px high in the default size | 36px | Element heights are 24 / 36 / 48 / 56 |
| Icon button 30px | 24 / 36 / 48 / 56 (`xs`–`lg`) | Element heights |
| Drawer reference: 24px top-left corner, 60px header, 28px chips, 31px section headers | 48px corner, 64px header, 24px tags, 36px section headers | Design rule: drawer corner 48, even sizes, element heights |

## Accessibility findings to raise with design

Measured against WCAG 2.2 AA (4.5:1 for text under 18.66px bold / 24px):

- **Amber buttons** with Snow text: 2.5:1. The `accent` variant fails for text. Options: darken the
  fill, use Eerie Black text, or keep it for large text only.
- **Candy Apple** with Snow or White text: 3.8–3.9:1. Passes only for large or bold text, so the `brand`
  button and the focused field label are borderline.
- **Silver Chalice** text on White: 2.2:1. Placeholders are exempt, but inactive tab labels and unit
  suffixes are real text and fail.
- **Disabled Gray X** with Snow text is 1.9:1; WCAG exempts disabled controls, but it is hard to read.

The values are kept as designed until design decides; they are single-token changes.

## Not extracted yet

Date picker, time picker and calendar; upload; data sheet; drawer navigation; rating and voting; filter
button; map; notification centre. All 164 icons, the 7 file-format badges and the 5 default images are
exported (`icons/svg`, `assets/`); re-export and run `npm run icons` after updating `icons/syn-icons.json`.
