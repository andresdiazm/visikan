# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build
npm run deploy     # Build + push to gh-pages (GitHub Pages — legacy, app now on Vercel)
```

There are no tests or linter configured.

## Deployment

**Production**: Vercel at `https://visikan.vercel.app/`
- Uses `BrowserRouter` (NOT HashRouter — Vercel handles routing)
- `vite.config.js` sets `base: '/'` when `process.env.VERCEL` is set, `/visikan/` otherwise
- Env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured in Vercel project settings

**GitHub repo**: `https://github.com/andresdiazm/visikan.git`, branch `main`

## Backend — Supabase

**Project URL**: `https://wtxobuknkcvkyctgpilv.supabase.co`  
**Client**: `src/lib/supabase.js` — uses `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (anon/publishable key only — NEVER commit the secret key)

### Tables

| Table | Key columns | Notes |
|---|---|---|
| `beds` | `id`, `label`, `service_id` | Label format: `"{sala}-{cama}"` (e.g. `"3-5"`, `"Norte-12"`) |
| `teams` | `id`, `service_id`, `label` | Dynamic — managed via UI |
| `team_assignments` | `bed_id`, `service_id`, `team_id` | Maps beds to teams |
| `patients` | `id`, `name`, `rut`, `bed_id`, `service_id`, `team_id`, `is_home_care` | |
| `tasks` | `id`, `patient_id`, `team_id`, `service_id`, `type`, `description`, `priority`, `labels`, `notes`, `status`, `created_at` | `labels` is a text[] array |
| `labels` | `id`, `name`, `color` | Shared across all services |

All tables have RLS enabled with permissive `for all using (true)` policies (no auth required — shared data, no login).

**Real-time**: `useVisiStore.init()` subscribes to `postgres_changes` on `*` schema; any DB change triggers a full `fetchAll()` reload.

**Schema cache**: If a table is added outside normal flow, run `NOTIFY pgrst, 'reload schema';` and `GRANT ALL ON public.<table> TO anon, authenticated;` in the SQL Editor.

## Architecture

### State — `src/store/useVisiStore.js`

Single Zustand store backed by Supabase (no localStorage persistence). All mutations go through store actions with optimistic updates + DB write. Real-time subscription reloads state on any change.

```
store shape:
  loaded: bool
  beds: [{ id, label, serviceId }]
  teams: { [serviceId]: [{ id, label, serviceId }] }
  teamAssignments: { "${serviceId}__${teamId}": bedId[] }
  patients: { [id]: { id, name, rut, bedId, serviceId, teamId, isHomeCare } }
  tasks: { [id]: { id, patientId, teamId, serviceId, type, description, priority, labels[], notes, status, createdAt } }
  labels: [{ id, name, color }]
```

Derived data in `src/store/selectors.js` — use `useVisiStore(selector)` to avoid unnecessary re-renders.

### Routing — `BrowserRouter`

| Route | Page | Description |
|---|---|---|
| `/` | `Landing` | Dashboard overview; service cards with stats + team chips |
| `/sectores` | `Sectores` | Admin CRUD for teams/sectors and bed assignment per service |
| `/altas` | `Altas` | Consolidated view of Alta, Alta Probable, Solicitud Traslado tasks |
| `/service/:serviceId` | `ServiceDashboard` | Task count stats per team |
| `/service/:serviceId/team/:teamId` | `TeamKanban` | Kanban board for a team |

### Static data — `src/data/hierarchy.js`

- `SERVICES`: 8 services (medicina, cirugia, uci, uti, ucor, trauma, urologia, hosdom)
- `TEAMS`: legacy static teams — **no longer used** (teams come from Supabase `teams` table)
- `TASK_TYPES`: 10 types with id, label, color:
  - examenes, imagenes, interequipo, pabellon, social (id: `trabajo_social`), procedimiento, solicitud_traslado, alta, alta_probable, otro
- `TASK_STATUSES`: `['iniciada', 'en_proceso', 'terminada']`
- `STATUS_META`: label + Tailwind color classes per status
- `LABEL_COLORS`: palette for user-defined labels

### Beds

- **Label format**: `"{sala}-{cama}"` — e.g. `"3-5"`, `"Norte-12"`, `"A-3"`
- Sala can be text or number; cama must be a number
- Creation form (`TeamBedList.jsx → AddBedPanel`) has two separate fields: Sala + Cama
- Sala is extracted in `KanbanColumn` as `label.split('-')[0]` for grouping

## Key Components

### Kanban

**`KanbanBoard.jsx`**
- `DndContext` wraps 3 `KanbanColumn` components
- Patients sorted by bed label (alfanumérico) before passing to columns
- `TypeFilter` bar above columns: multi-select chips to show only tasks of chosen type(s)
- When filter active, "Iniciada" column only shows patients with tasks of the filtered type

**`KanbanColumn.jsx`**
- Groups patients by sala (extracted from bed label)
- Renders `SALA X` divider header before each group
- Sorted groups: alfanumérico (`localeCompare` with `numeric: true`)
- `useDroppable(status)` + `SortableContext` per column

**`PatientSection.jsx`**
- Shows bed label as primary text, patient name as secondary
- `+` button to open `TaskCreateModal`

**`TaskCard.jsx` / `TaskCardContent`**
- Labels shown as colored dots (●) in the top-right area — max 3 dots + "+N"
- Timestamp shown bottom-left: `"Xm"` / `"Xh"` / `"Xd"` with clock icon
- Tasks >24h in `iniciada` or `en_proceso`: orange background + ring highlight
- Move buttons: chevron-only arrows `‹` / `›`

### TeamKanban page (`src/pages/TeamKanban.jsx`)

- "Nueva tarea" dropdown shows bed label (not patient name), with patient name as subtitle
- Search input (autofocus on open) filters by sala/cama text
- List sorted alfanumérico by bed label

### Sectores page (`src/pages/Sectores.jsx`)

- Full CRUD for teams per service: create, rename (inline), delete
- Expanding a team row shows `TeamBedList` with bed management
- `TeamBedList`: create bed (Sala + Cama fields → composed label), move unassigned beds, assign/remove patients

### Altas page (`src/pages/Altas.jsx`)

- Shows tasks of type `alta`, `alta_probable`, `solicitud_traslado` with status ≠ `terminada`
- Grouped by type (in order), then by service
- Each row: cama label, patient name, service, sector, description, timestamp, link to kanban
- Tasks >24h highlighted in orange
- Dense layout — minimal padding for maximum rows visible

## Design System

Colors: teal `#26A69A` (primary), bay-blue `#1A3A6B` (top bar). Tailwind config in `tailwind.config.js`.  
Font: Roboto via Google Fonts. UI primitives in `src/components/ui/`.

TopBar navigation tabs: **Inicio** (`/`) · **Sectores** (`/sectores`) · **Altas** (`/altas`)
