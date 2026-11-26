# SAM (app)

SAM built on Syn, in the same repository. Syn is the root package; this app imports its source through the
`@syn/design-system` alias (`vite.config.ts`, `tsconfig.json`), so a change in Syn shows here at once, without a build.

```bash
npm install          # once, at the repository root (npm workspaces)
npm run sam:dev      # http://localhost:5173/#/settings/notification-center
npm run sam:build    # typecheck + apps/sam/dist
```

## Structure

| Path | What |
| --- | --- |
| `src/App.tsx` | Hash routes: `#/<module>/<section>` |
| `src/layout/AppShell.tsx` | Figma *Side bar* and *TopNavigation*, taken over from the Equipment Profile app |
| `src/shared/` | App components Syn does not have yet: `LineTabs` (Figma "Second navigation Tab"), `ActionMenu` (the ⋯ menu) |
| `src/modules/administration/` | **Administration** (top bar "Settings"): the secondary navigation and its sections |
| `src/modules/administration/notification-center/` | **Notification Center**: Alerts, Alert History and the create flow |

A new module goes in `src/modules/<name>/` and gets a route in `App.tsx`.

## Notification Center

From the SAM (Design) Figma file:

| Screen | Figma |
| --- | --- |
| Alerts list / empty | [13594:30615](https://www.figma.com/design/Y9mIWBhREjY2aJotdjw3YQ/SAM--Design-?node-id=13594-30615) / [13555:46442](https://www.figma.com/design/Y9mIWBhREjY2aJotdjw3YQ/SAM--Design-?node-id=13555-46442) |
| Alert History / empty | [13594:31643](https://www.figma.com/design/Y9mIWBhREjY2aJotdjw3YQ/SAM--Design-?node-id=13594-31643) / [13594:31122](https://www.figma.com/design/Y9mIWBhREjY2aJotdjw3YQ/SAM--Design-?node-id=13594-31122) |
| Choose alert type | [14085:94424](https://www.figma.com/design/Y9mIWBhREjY2aJotdjw3YQ/SAM--Design-?node-id=14085-94424) |
| Geofence Exit (Geofence, Warehouse, Project/Contract, Area) | [13564:25033](https://www.figma.com/design/Y9mIWBhREjY2aJotdjw3YQ/SAM--Design-?node-id=13564-25033), [14843:40465](https://www.figma.com/design/Y9mIWBhREjY2aJotdjw3YQ/SAM--Design-?node-id=14843-40465), [16821:60659](https://www.figma.com/design/Y9mIWBhREjY2aJotdjw3YQ/SAM--Design-?node-id=16821-60659), [16821:60866](https://www.figma.com/design/Y9mIWBhREjY2aJotdjw3YQ/SAM--Design-?node-id=16821-60866), filled: [14078:92781](https://www.figma.com/design/Y9mIWBhREjY2aJotdjw3YQ/SAM--Design-?node-id=14078-92781), [16821:61094](https://www.figma.com/design/Y9mIWBhREjY2aJotdjw3YQ/SAM--Design-?node-id=16821-61094), [16821:61637](https://www.figma.com/design/Y9mIWBhREjY2aJotdjw3YQ/SAM--Design-?node-id=16821-61637), [16826:79084](https://www.figma.com/design/Y9mIWBhREjY2aJotdjw3YQ/SAM--Design-?node-id=16826-79084) |
| Outside Working Hours | [13588:25230](https://www.figma.com/design/Y9mIWBhREjY2aJotdjw3YQ/SAM--Design-?node-id=13588-25230), filled: [14078:92867](https://www.figma.com/design/Y9mIWBhREjY2aJotdjw3YQ/SAM--Design-?node-id=14078-92867) |
| Power Disconnected | [13588:25339](https://www.figma.com/design/Y9mIWBhREjY2aJotdjw3YQ/SAM--Design-?node-id=13588-25339), filled: [14078:92968](https://www.figma.com/design/Y9mIWBhREjY2aJotdjw3YQ/SAM--Design-?node-id=14078-92968) |
| Add Equipment | V15 prototype, Equipment Views Explorer › Target Design › Add Equipment (replaces Figma 14054:46598) |

What it does:

- **Alerts**: search (name, type, equipment, email), Type and Status filters, the red ⊕ (and "Add Alert" on the empty
  list) opens *Choose alert type*. Each row's ⋯ menu: Edit, Disable / Activate, Delete. A disabled alert is drawn Gray X.
- **Create / Edit drawer** (1280px): Name, Email (several), Equipments (⊕ opens *Add Equipment*: the SHARED table
  from `@syn/shared-equipment`, V15 behaviour with Syn visuals; see its README), and per type:
  - Geofence Exit: the Type switch. *Geofence Exit* draws the fence on the map (Hand, Polygon: a click per corner,
    click the first corner or double-click to close; Eraser: last corner; Bin: clear). Warehouse, Project/Contract and
    Area pick a place, show its details and its fence on the map.
  - Outside Working Hours: a row per day; checked days need From and To (24-hour, typed or from the half-hour list);
    *Standard Work week* fills Monday–Friday 08:00–17:00.
  - Power Disconnected: the condition note and Beacon vendors (several).
  - Submit checks every required field and shows what is missing.
- **Alert History**: search over equipment, IMEI, type, rule and details.
- Data: `data.ts` is mock data from the frames; `useAlerts.ts` keeps the rules in `localStorage`
  (`sam-alerts-v1`) until the API exists. Open `/?empty#/settings/notification-center` for the empty lists.

## Decisions and open points

- The Figma asset service is not reachable from the build machine, so the alert-type icons and the siren were
  exported as PNG renders of their Figma nodes (`notification-center/assets`), and the secondary navigation icons are
  the closest Syn icons (person, inventory, list, settings) instead of Figma's.
- Syn has no time picker, underline tabs or ⋯ menu yet; they are app components here and could move to Syn.
- Email chips use Syn's Select tags (Figma draws them Dodger Blue).
- The map's Search box from Figma is not built (it needs a geocoding service).
- Figma copy kept as is, to confirm: "Recourses"; the Name column in Figma shows a date, the build shows the alert's name.
- Equipments in the filled frames list e-mail addresses (placeholder copy); the build lists equipment names.
