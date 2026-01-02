# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**proj_plann** is a local-first project planning web application built with React, TypeScript, and Vite. It provides comprehensive project planning with tasks, hierarchical phases, personnel management, budget tracking with cost forecasting, all with local persistence using IndexedDB.

**Current Status**: Milestone 4 - Gantt Chart Visualization

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Architecture

### Tech Stack
- **Build Tool**: Vite
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand (with devtools middleware)
- **Database**: IndexedDB via Dexie.js
- **Styling**: Tailwind CSS
- **Date Utilities**: date-fns (tree-shakeable)
- **Gantt Visualization**: frappe-gantt (MIT-licensed, interactive timeline)

### Architecture Pattern

Layered feature-sliced design:
```
Presentation Layer (React Components)
    ↓
Application Layer (Zustand Store, Hooks)
    ↓
Domain Layer (Business Logic, Data Models)
    ↓
Infrastructure Layer (IndexedDB via Dexie)
```

### Directory Structure

```
src/
├── app/                   # Application setup
│   ├── App.tsx           # Root component with 3-column layout
│   └── main.tsx          # Entry point
│
├── features/             # Feature modules (domain-driven)
│   ├── tasks/
│   │   └── components/   # TaskList, TaskForm, TaskItem, TaskFilters, FilterPanel
│   ├── projects/
│   │   └── components/   # ProjectInfo, ProjectForm, ExportModal
│   ├── phases/
│   │   └── components/   # PhaseList, PhaseItem, PhaseForm
│   ├── personnel/
│   │   └── components/   # PersonnelList, PersonnelItem, PersonnelForm, PersonnelAssignmentModal
│   ├── budget/
│   │   └── components/   # BudgetList, BudgetEntryItem, BudgetEntryForm, BudgetSummary, BudgetForecast
│   └── gantt/
│       ├── components/   # GanttView, GanttToolbar, TaskDependencyEditor
│       ├── utils/        # ganttTransform, dependencyValidation, defaultDates
│       └── types/        # frappe-gantt.d.ts (TypeScript definitions)
│
├── store/                # State management
│   ├── store.ts          # Zustand store with all slices + selectors
│   └── slices/
│       ├── tasksSlice.ts       # Task CRUD actions
│       ├── projectsSlice.ts    # Project CRUD actions
│       ├── phasesSlice.ts      # Phase CRUD with 2-level validation
│       ├── filtersSlice.ts     # Filter state management
│       ├── personnelSlice.ts   # Personnel CRUD with dependency checking
│       ├── budgetSlice.ts      # Budget entry CRUD
│       └── ganttSlice.ts       # Gantt view mode state
│
├── services/             # Infrastructure layer
│   └── storage/
│       ├── db.ts         # Dexie database schema
│       └── export.ts     # Project-scoped JSON export/import
│
├── types/
│   └── models.ts         # TypeScript data models + filter types
│
└── styles/
    ├── index.css         # Tailwind imports
    └── gantt.css         # Gantt chart custom styles
```

### Data Model

Data is stored in a **normalized structure** (entities indexed by ID) in IndexedDB:

**Active Entities (Milestone 3):**
- **Project**: Container for tasks and phases with metadata (name, description, dates, status)
  - Status: `planning`, `active`, `on-hold`, `completed`, `archived`
  - Single project loaded at a time (switch via JSON import/export)
  - Auto-generated fields: `id` (UUID), `createdAt`, `updatedAt`

- **Phase**: 2-level hierarchical grouping of tasks
  - Parent phases (no `parentPhaseId`) act as section headers
  - Child phases (with `parentPhaseId`) contain tasks
  - Enforced 2-level limit (no grandchildren allowed)
  - Optional color coding and date ranges
  - Auto-generated fields: `id` (UUID), `createdAt`, `updatedAt`

- **Task**: Work items with comprehensive metadata
  - Status: `todo`, `in-progress`, `blocked`, `done`, `cancelled`
  - Priority: `low`, `medium`, `high`, `critical`
  - Linked to project via `projectId`, optionally to phase via `phaseId`
  - Optional `startDate` and `dueDate` for scheduling
  - **`assignedTo`**: Array of personnel IDs assigned to this task
  - **`dependsOn`**: Array of task IDs that must complete before this task starts
  - Auto-generated fields: `id` (UUID), `createdAt`, `updatedAt`

- **Personnel**: Team members with roles and hourly rates
  - Fields: `name`, `email`, `role`, `hourlyRate`, `availability` (hours/week)
  - `isActive`: Boolean to track active vs inactive personnel
  - Used for task assignments and labor budget calculations
  - Auto-generated fields: `id` (UUID), `createdAt`, `updatedAt`

- **BudgetEntry**: Cost tracking for labor and materials
  - Category: `labor`, `materials`, `software`, `other`
  - Tracks `estimatedCost` and optional `actualCost`
  - Labor entries: Link to `personnelId` and `hours` for auto-calculation
  - Optional link to `taskId` for task-level budget tracking
  - Auto-generated fields: `id` (UUID), `createdAt`, `updatedAt`

**Future entities (schema already defined):**
- **Deliverable**: Outputs linked to tasks

### Key Files

#### Critical for Milestone 3:
1. **`src/types/models.ts`** - TypeScript interfaces for all entities + filter types + budget summary types
2. **`src/services/storage/db.ts`** - Dexie database with versioned schema (v2 adds personnelId index)
3. **`src/store/store.ts`** - Zustand store combining all slices + budget/forecast selectors
4. **`src/store/slices/tasksSlice.ts`** - Task CRUD actions
5. **`src/store/slices/projectsSlice.ts`** - Project CRUD with dependency checking
6. **`src/store/slices/phasesSlice.ts`** - Phase CRUD with 2-level hierarchy enforcement
7. **`src/store/slices/filtersSlice.ts`** - Filter state management
8. **`src/store/slices/personnelSlice.ts`** - Personnel CRUD with dependency checking
9. **`src/store/slices/budgetSlice.ts`** - Budget entry CRUD
10. **`src/features/tasks/components/TaskList.tsx`** - Main task list with filtered selector
11. **`src/features/projects/components/ProjectInfo.tsx`** - Project display + BudgetSummary
12. **`src/features/personnel/components/PersonnelAssignmentModal.tsx`** - Assign personnel to tasks
13. **`src/features/budget/components/BudgetEntryForm.tsx`** - Budget entry with auto-calculation
14. **`src/features/budget/components/BudgetForecast.tsx`** - Cost forecast with burn rate
15. **`src/features/phases/components/PhaseList.tsx`** - Phase hierarchy display
16. **`src/app/App.tsx`** - 3-column layout (project/phases, tasks, filters)

#### Critical for Milestone 4:
17. **`src/features/gantt/components/GanttView.tsx`** - Main Gantt chart visualization with frappe-gantt
18. **`src/features/gantt/components/GanttToolbar.tsx`** - View mode selector (Day/Week/Month/Quarter/Year)
19. **`src/features/gantt/components/TaskDependencyEditor.tsx`** - Dependency management modal
20. **`src/features/gantt/utils/ganttTransform.ts`** - Transform tasks to frappe-gantt format
21. **`src/features/gantt/utils/dependencyValidation.ts`** - Cycle detection and validation
22. **`src/features/gantt/utils/defaultDates.ts`** - Smart date assignment based on dependencies
23. **`src/store/slices/ganttSlice.ts`** - Gantt view mode state management

### State Management Pattern

Uses Zustand with:
- **Normalized state**: Tasks stored as `Record<string, Task>` (id → task)
- **Async actions**: All CRUD operations return promises
- **Error handling**: Each action sets `isLoading` and `error` state
- **Persistence**: Data automatically synced to IndexedDB
- **Selectors**: See important notes below about preventing infinite re-renders

#### Critical: Avoiding Infinite Re-renders with Zustand

**Problem**: Selectors that return arrays/objects create new references on every call, causing infinite re-renders.

**Solution**: Use `useMemo` for derived data:

```typescript
// ✅ CORRECT: Use useMemo to cache derived arrays
const tasksObject = useStore((state) => state.tasks);
const tasks = useMemo(
  () => Object.values(tasksObject).sort((a, b) => a.order - b.order),
  [tasksObject]
);

// ❌ WRONG: Creates new array reference on every render
const tasks = useStore((state) =>
  Object.values(state.tasks).sort((a, b) => a.order - b.order)
);

// ❌ WRONG: Using pre-defined selector without equality function
const tasks = useStore(selectTasksArray);
```

See `src/features/tasks/components/TaskList.tsx` for the correct implementation pattern.

### Data Persistence

- **Primary storage**: IndexedDB via Dexie.js
  - Unlimited storage capacity
  - Structured queries with indexes
  - Schema versioning for migrations

- **Backup/restore**: JSON export/import
  - Human-readable format
  - Full state serialization
  - Triggered via header buttons in App.tsx

### Path Aliases

TypeScript and Vite configured with `@/*` alias:
```typescript
import { Task } from '@/types/models';
import { useStore } from '@/store/store';
```

### Tailwind Configuration

Scans all `.tsx` files for class names. Global styles in `src/styles/index.css`.

## Development Workflow

### Adding a New Feature (e.g., Projects)

1. **Define types** in `src/types/models.ts` (already done for future entities)
2. **Create slice** in `src/store/slices/projectsSlice.ts`
3. **Update store** in `src/store/store.ts` to include new slice
4. **Build UI** in `src/features/projects/components/`
5. **Update database** if schema changes needed

### Modifying Data Model

Dexie handles migrations automatically:
```typescript
// In src/services/storage/db.ts
this.version(2).stores({
  tasks: 'id, projectId, status, priority, createdAt, dueDate, phaseId', // Added phaseId index
});
```

### Debugging

- **Zustand DevTools**: Redux DevTools extension works automatically
- **IndexedDB Inspector**: Browser DevTools → Application → IndexedDB → ProjectPlanningDB
- **Console logs**: All CRUD operations log to console

## Future Roadmap

### Milestone 2: Projects & Phases ✅ COMPLETED
- ✅ Single project management (switch via import/export)
- ✅ 2-level hierarchical phases
- ✅ Comprehensive task filtering (phase, status, priority, search, date ranges)
- ✅ Delete protection for projects/phases with dependencies
- ✅ Project-scoped JSON export with project name in filename
- ✅ Migration support for Milestone 1 data

### Milestone 3: Personnel & Budget ✅ COMPLETED
- ✅ Personnel management with roles, email, hourly rates, availability
- ✅ Active/inactive status tracking
- ✅ Personnel assignment to tasks via dedicated modal interface
- ✅ Budget entries with 4 categories (labor, materials, software, other)
- ✅ Auto-calculate labor costs (hourly rate × hours)
- ✅ Budget summary with category rollups (labor vs non-labor)
- ✅ Cost forecasting with burn rate analysis
- ✅ Real-time variance tracking (estimated vs actual)
- ✅ Budget overrun warnings and trend indicators
- ✅ Dependency protection (can't delete personnel with assignments or budget entries)

### Milestone 4: Gantt Chart ✅ COMPLETED
- ✅ Integrated frappe-gantt for interactive timeline visualization
- ✅ Multiple view modes: Day, Week, Month, Quarter, Year
- ✅ Task dependency management with cycle detection
- ✅ Drag-and-drop task rescheduling with auto-save
- ✅ Smart date defaults based on dependency chains
- ✅ Visual progress tracking with color-coded status bars
- ✅ TypeScript type definitions for frappe-gantt library

**Note**: Original plan mentioned DHTMLX Gantt, but frappe-gantt was chosen instead (also MIT-licensed, smaller bundle size, better TypeScript support).

### Milestone 5: Advanced Scheduling
- Dependency-aware scheduling
- What-if forecasting
- Critical path analysis

## Important Notes

- **Local-first**: No backend required, all data stored in browser
- **Incremental architecture**: Each milestone builds on previous without refactoring
- **Type safety**: Strict TypeScript with no `any` types
- **Normalized data**: Easy to extend with relationships (foreign keys via IDs)
- **Path mapping**: Use `@/` prefix for all imports to avoid relative path hell
