# @syn/shared-equipment

SHARED equipment listings for SAM and RAM, built on Syn. First listing: the **Add Equipment** selection table
(IoT Alerts Manager), from the V15 prototype (Equipment Views Explorer › Target Design › Add Equipment) with Syn
visuals. It uses no entity that only one product has (no Tags, Crew or equipment status), so SAM and RAM render it
the same way.

```tsx
import { EquipmentSelectTable } from '@syn/shared-equipment';

<EquipmentSelectTable
  records={records}            // EquipmentRecord[] from the SAM or RAM API
  categoryTree={categories}    // TreeNode[] (Fleet Database category tree)
  branchTree={branches}        // TreeNode[] (organisational structure)
  trackers={trackerTypes}      // string[]; "No tracker added" is added
  selected={ids} onSelectedChange={setIds}
/>
```

Apps import the source through an alias (see `apps/sam/vite.config.ts` and `tsconfig.json`).

## Columns

| Group | Column | Sort | Filter |
| --- | --- | --- | --- |
| Equipment | Image | – | – |
| Equipment | Inventory Number | A–Z / Z–A | Text |
| Equipment | Title | – | Text |
| Equipment | Category | A–Z / Z–A | Category tree, multi-select, search |
| Relations | Branch | A–Z / Z–A | Organisational structure, multi-select, search |
| Check-in Information | Current Project / Warehouse / Rental | A–Z / Z–A | Text |
| Telematic Information | Tracker | – | Tracker types, multi-select, search, "No tracker added" |
| Telematic Information | Tracker IMEI | – | Text |
| Telematic Information | Last Signal | Oldest / Newest | – |
| Telematic Information | Current Location | – | Text |

- **Text filters:** Contains, Equals, Starts with, Ends with; not case-sensitive.
- **Tree filters:** a parent selects its whole subtree, and a parent with only some children chosen shows as mixed.
- **Sorting:** a header's sort button cycles ascending → descending → off. Empty values always sort last.
- **Above the table:** the keyword search (every field), quick Branch and Category filters (the same state as their
  column filters), and Clear filters.
- **Selection:**
  - A row's checkbox, or a click anywhere on the row outside its controls, selects it.
  - The header checkbox selects or clears every shown row, and shows mixed when only some are selected.
  - Selection survives filtering.
- **Columns:** drag a header's right edge to resize; Arrow Left/Right does the same on the focused handle, and a
  double-click restores the width. The table scrolls sideways with Select, Image and Inventory Number kept in view.
  Headers stay at the top.
- **Cells:**
  - Current Project / Warehouse / Rental shows its kind's icon, the name and the detail.
  - Tracker IMEI shows a QR code (generated) next to the number; the QR opens enlarged.
  - Last Signal shows a recency dot.
  - Location is a button that opens the address with a Google Maps link.
  - Empty values show "—", "No tracker added" or "No signal".

## Decisions taken without a design (to confirm)

- **Visuals:** Syn tokens throughout. V15's layout and behaviour, not its Inter / teal look.
- **Signal recency:** Mantis up to 12 h, Honey up to 24 h, Vermilion older.
- **Sticky columns:** Select, Image and Inventory Number stay left while scrolling.
- **Location:** a small panel with the address, the time of the last signal and Open in Google Maps (no embedded
  map).
- **Availability:** no rule. Every row can be selected and there is no Available / Not Available legend (V15 has
  neither).
- **Image:** the photo when the record has one, otherwise Syn's equipment placeholder.
- **Empty result:** "No equipment matches the search and filters" with Clear filters.
- **Sample category tree:** groups V15's categories under Earthmoving, Transport and Scaffolding. The real tree comes
  from the Fleet Database.
- **Destination icons:** Syn's project-contract, nav-warehouse and file icons.
