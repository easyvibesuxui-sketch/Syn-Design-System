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
| Mixed 2px and 8px radii across input variants | 8px for fields and selects, 2px for list rows | The 8px variants are the majority and match buttons |
| Icon sizes inside fields of 20 or 24 | 20 | One grid |
| Button focus drawn as an extra 4px frame around the button | `outline: 1px; outline-offset: 3px` | Same look without changing layout |
| Field focus as a 2px stroke outside | 2px box-shadow outside | Same look without a layout shift |
| Error input radius 8 at rest, 2 in other states | 8 in every state | The radius jump reads as a glitch |
| No dark theme in Figma | None | An earlier invented dark theme broke components and was removed |

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
