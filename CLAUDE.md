# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**proj_plann** is a local-first project planning web application built with React, TypeScript, and Vite. It provides task management with local persistence using IndexedDB, designed to scale incrementally to support phases, Gantt charts, personnel management, and budget tracking.

**Current Status**: Milestone 1 - Basic Task CRUD with local persistence

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
│   ├── App.tsx           # Root component with export/import
│   └── main.tsx          # Entry point
│
├── features/             # Feature modules (domain-driven)
│   └── tasks/
│       └── components/   # TaskList, TaskForm, TaskItem
│
├── store/                # State management
│   ├── store.ts          # Zustand store setup
│   └── slices/
│       └── tasksSlice.ts # Task CRUD actions
│
├── services/             # Infrastructure layer
│   └── storage/
│       ├── db.ts         # Dexie database schema
│       └── export.ts     # JSON export/import utilities
│
├── types/
│   └── models.ts         # TypeScript data models
│
└── styles/
    └── index.css         # Tailwind imports
```

### Data Model

Data is stored in a **normalized structure** (entities indexed by ID) in IndexedDB:

- **Task**: Core entity with name, description, status, priority, timestamps
  - Status: `todo`, `in-progress`, `blocked`, `done`, `cancelled`
  - Priority: `low`, `medium`, `high`, `critical`
  - Auto-generated fields: `id` (UUID), `createdAt`, `updatedAt`

Future entities (schema already defined):
- **Project**: Container for tasks and phases
- **Phase**: Hierarchical grouping of tasks
- **Deliverable**: Outputs linked to tasks
- **Personnel**: Team members with rates/availability
- **BudgetEntry**: Cost tracking for labor and materials

### Key Files

#### Critical for Milestone 1:
1. **`src/types/models.ts`** - TypeScript interfaces for all entities
2. **`src/services/storage/db.ts`** - Dexie database with versioned schema
3. **`src/store/store.ts`** - Zustand store combining all slices
4. **`src/store/slices/tasksSlice.ts`** - Task CRUD actions (addTask, editTask, removeTask, loadTasks)
5. **`src/features/tasks/components/TaskList.tsx`** - Main UI orchestrating form and task items

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

### Milestone 2: Projects & Phases
- Project selector dropdown
- Phase hierarchy with drag-and-drop
- Task filtering by project/phase

### Milestone 3: Personnel & Budget
- Personnel assignment to tasks
- Hourly rate tracking
- Budget rollup calculations

### Milestone 4: Gantt Chart
- Integrate DHTMLX Gantt (MIT version)
- Visual timeline with drag-to-reschedule
- Dependency visualization

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
