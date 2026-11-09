# Atomic design

Syn is layered by Brad Frost's atomic design method. Every component has one layer, and a layer builds only on
the layers below it. The DS page still groups components by purpose (Forms, Data display, Layout, …), as the Figma
pages do; each card's subtitle names the layer.

The layers live in [`scripts/atomic-layers.json`](../scripts/atomic-layers.json). `npm run check:layers` checks
them, and `npm run build` runs it first, so a build stops when the rules are broken.

## Layers

| Layer | What it is | May use |
| --- | --- | --- |
| **Foundation** | Tokens (colours with their Figma names, type, spacing, radii 8 / 12 / 48 / 2, heights 56 / 48 / 36 / 24, shadows), icons, `utils`, base styles. | nothing from components |
| **Atom** | The smallest working part: one control or one mark. | foundations, atoms |
| **Molecule** | A few atoms with one job: a field with its label, icons and messages; a list; a tab bar. | foundations, atoms, molecules |
| **Organism** | A section of an interface made of molecules and atoms: a drawer, a dialog, a table, a comment thread. | foundations, atoms, molecules, organisms |
| **Template** | Page layout without content: the grid that organisms are placed on. | everything above |
| **Page** | A real screen with real data. Pages are built in the product, not in this library. | everything |

A component may use components of its own layer (`PhoneField` uses `Select` and `TextField`, all molecules). It
never uses a higher one: an atom never imports a molecule.

## Components

### Atoms
- **Actions:** `Button`, `IconButton` (with `CloseGlyph`)
- **Choice:** `Checkbox`, `Radio`, `Switch`, `Segmented`, `Slider`
- **Marks and status:** `Icon`, `Tag`, `StatusChip`, `StatusBadge`, `Avatar`, `Thumbnail`, `ProgressBar`, `Skeleton`, `Tooltip`
- **Text pieces:** `FieldMessages`, `ChoiceMessage`, `ErrorIcon`, `Value` (a table value), `Property` (a label and value pair)
- **Map buttons:** `MapControl`, `MapExpandButton`, `MapStreetViewButton`

### Molecules
- **Fields:** `TextField`, `TextArea`, `PasswordField`, `QuantityField`, `PhoneField`, `Select`
- **Lists:** `OptionList`, `DropdownPanel`, `RadioGroup`
- **Navigation:** `Tabs`, `NewTab`
- **Feedback and content:** `Notification`, `FileItem`, `EmptyState`, `Card`
- **Pieces of organisms:** `ChecklistItem`, `CommentReply`, `CommentEditor`, `DrawerRow`
- **Map:** `MapZoomControls`, `MapLayerSwitch`, `MapControls`

### Organisms
`Accordion`, `Checklist`, `Comment`, `Dialog`, `Drawer`, `Section`, `Table`, `MapView`

### Templates
`Grid`, `GridItem` (12 columns). The full record drawer in the DS page's Drawer card is an example built on it.

## Files and layers

A source file can export components of different layers (`Media` exports the atom `Avatar` and the molecule
`EmptyState`). The file's layer is the highest of its exports, and it decides what the file may import.

## Adding a component

1. Pick the layer by what the component is made of, not by its size: if it puts other components together for one
   job, it is a molecule; if it is a section of a screen, an organism.
2. Add it to `components` in `scripts/atomic-layers.json` (and the file to `files` if it is new).
3. Add the layer to the start of its DS card subtitle, e.g. `subtitle="Molecule · Standard, Search, Multiple"`.
4. Run `npm run check:layers`.
