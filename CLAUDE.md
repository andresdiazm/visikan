# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build (sets base: '/visikan/' for GitHub Pages)
npm run deploy     # Build + publish to gh-pages branch (GitHub Pages)
```

There are no tests or linter configured.

To regenerate `src/data/beds.js` from `camas.xlsx` (only needed if the Excel changes):
```bash
node scripts/generate-beds.cjs
```

## Architecture

**State**: Single Zustand store (`src/store/useVisiStore.js`) persisted to `localStorage` under key `visikan-store`. All mutations go through store actions. Derived data is in `src/store/selectors.js` — use these with `useVisiStore(selector)` to avoid unnecessary re-renders.

**Routing**: `HashRouter` (required for GitHub Pages static hosting). Three routes:
- `/` → Landing (bed/patient assignment)
- `/service/:serviceId` → Service dashboard (task counts per team)
- `/service/:serviceId/team/:teamId` → Team Kanban board

**Data flow**:
1. Static bed data lives in `src/data/beds.js` (pre-processed from `camas.xlsx` — do not edit manually)
2. `src/data/hierarchy.js` defines the hardcoded service/team/task-type constants
3. Beds with `teamId: null` (Medicina, Cirugía) require manual team assignment via the Landing page; UCI/UTI beds are pre-assigned
4. `teamAssignments` in the store maps `"${serviceId}__${teamId}" → bedId[]`
5. When assigning a patient to a bed, `assignPatientToBed` resolves the real `teamId` by looking up `teamAssignments` (not `bed.teamId`, which is null for Medicina/Cirugía)

**Kanban DnD**: `DndContext` wraps all 3 columns in `KanbanBoard`. Each `KanbanColumn` uses `useDroppable(status)` + `SortableContext`. Each `TaskCard` uses `useSortable(id)`. `onDragEnd` checks if `over.id` is a column status string or a task ID to determine the target status.

**Key quirk — patient visibility**: The "Iniciada" column always shows all patients of the team (even with 0 tasks) so users can create the first task. "En Proceso" and "Terminada" columns only show patients who have tasks there (`KanbanColumn.jsx`).

## Design System

Colors: teal `#26A69A` (primary), bay-blue `#1A3A6B` (top bar). Configured in `tailwind.config.js`. Font: Roboto via Google Fonts. Components in `src/components/ui/` are the design system primitives.

## Deployment

`npm run deploy` pushes the `dist/` folder to the `gh-pages` branch. GitHub Pages is configured to serve from that branch. The `base` path `/visikan/` is injected only during `vite build` (not `vite dev`).
