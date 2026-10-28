# Syn Design System

Design tokens, icons and React components extracted from the Figma file
[Design system library (Copy)](https://www.figma.com/design/uNTCaDLpRs00HJFMOWXxP6/Design-system-library--Copy-).

The Figma library stays the visual source. This repo turns it into something code can consume:

| Layer | Where | What |
| --- | --- | --- |
| Tokens | `tokens/syn.tokens.json` | Source of truth in [DTCG](https://design-tokens.github.io/community-group/format/) format: primitives, semantic aliases (one light theme, as in Figma) |
| CSS variables | `src/styles/tokens.css` | Generated `--syn-*` custom properties and `.syn-text-*` type classes |
| JS tokens | `src/tokens.ts` | Generated, resolved values for charts, canvas and tests |
| Icons | `icons/syn-icons.json` → `src/icons/icon-data.ts` | All 164 Figma "Main icons" at native size; single-ink icons use `currentColor` |
| Components | `src/components` | 16 accessible React components built to the Figma specs |
| Assets | `icons/svg`, `assets/file-formats`, `assets/default-images` | Figma SVG exports: 164 icons, 7 file-format badges, 5 default images |
| Playground | `playground/` | Living style guide: every foundation, component and state |

## Getting started

```bash
npm install
npm run dev        # playground at http://localhost:5173
npm run build      # dist/syn.js, dist/syn.css, dist/*.d.ts
npm run typecheck
```

Using it in an app:

```tsx
import { Button, TextField } from '@syn/design-system';
import '@syn/design-system/styles.css';

export function SignIn() {
  return (
    <form className="syn-root">
      <TextField label="Email" iconStart="mail" />
      <Button fullWidth iconEnd="arrow-right">Continue</Button>
    </form>
  );
}
```

Wrap the app (or any subtree) in `.syn-root` for base type and colour.

Fonts: Montserrat is open source; load it yourself (Google Fonts or `@fontsource/montserrat`).
ABC Favorit Expanded, the title face, is commercial: self-host it under that family name and titles pick it
up automatically, otherwise they fall back to Montserrat.

## Editing tokens

1. Change `tokens/syn.tokens.json`.
2. Run `npm run tokens` (or `npm run build`) to regenerate `src/styles/tokens.css` and `src/tokens.ts`.

Naming: primitives keep their Figma colour names (`--syn-color-candy-apple`); semantic tokens describe a
role (`--syn-text-muted`, `--syn-surface-highlight`, `--syn-action-accent`). Components read only semantic
tokens, so a theme is a set of semantic overrides. See [docs/foundations.md](docs/foundations.md).

## Components

`Button` · `IconButton` · `TextField` · `Select` · `Checkbox` · `Radio` / `RadioGroup` · `Switch` · `Tabs` · `NewTab` ·
`Tooltip` · `Notification` · `StatusChip` · `StatusBadge` · `Accordion` · `Dialog` · `Drawer` / `DrawerRow` ·
`Section` / `Card` / `Property` · `Tag` · `Grid` / `GridItem` · `Slider` · `Icon`

Sizes are even numbers (2–24, then multiples of 8); elements have 8px corners and widgets 12px; element heights
are 24 / 36 / 48 / 56 (`xs` · `sm` · `md` · `lg`); layouts use the 12-column grid.

Props, Figma mappings and accessibility notes are in [docs/components.md](docs/components.md).

## What is not covered yet

The Figma file also has date and time pickers, calendar, upload, data sheet, drawer navigation, rating and
voting and map pages. They are not in this first version; the tokens
already cover what they need. Known gaps and the decisions taken while extracting are listed in
[docs/extraction-notes.md](docs/extraction-notes.md).
