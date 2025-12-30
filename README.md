# Project Planner

A local-first project planning web application built with React, TypeScript, and Vite.

## Features (Milestone 1)

- Create, read, update, and delete tasks
- Task properties: name, description, status, priority
- Local persistence with IndexedDB
- Export/import data as JSON for backup and portability
- Responsive UI with Tailwind CSS

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Tech Stack

- **Vite** - Build tool
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **Dexie.js** - IndexedDB wrapper
- **Tailwind CSS** - Styling
- **date-fns** - Date utilities

## Project Structure

```
src/
├── app/                   # Application entry point
├── features/tasks/        # Task management feature
├── store/                 # Zustand state management
├── services/storage/      # IndexedDB and export/import
├── types/                 # TypeScript type definitions
└── styles/                # Global styles
```

## Usage

### Creating Tasks

1. Click the "New Task" button
2. Fill in the task name (required)
3. Optionally add description, status, and priority
4. Click "Create"

### Editing Tasks

1. Click "Edit" on any task card
2. Modify the fields
3. Click "Update"

### Deleting Tasks

1. Click "Delete" on any task card
2. Confirm the deletion

### Export/Import Data

- **Export**: Click "Export" in the header to download all data as JSON
- **Import**: Click "Import" and select a previously exported JSON file

## Data Storage

All data is stored locally in your browser using IndexedDB. No server or cloud connection required.

**Database**: `ProjectPlanningDB`
**Tables**: tasks, projects, phases, deliverables, personnel, budgetEntries

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Path Aliases

The project uses `@/` as an alias for the `src/` directory:

```typescript
import { Task } from '@/types/models';
import { useStore } from '@/store/store';
```

## Roadmap

### Milestone 2: Projects & Phases
- Multi-project support
- Hierarchical phase organization
- Filtering and search

### Milestone 3: Personnel & Budget
- Team member management
- Cost tracking and forecasting
- Budget rollups

### Milestone 4: Gantt Chart
- Visual timeline
- Drag-to-reschedule
- Dependency visualization

### Milestone 5: Advanced Features
- Dependency-aware scheduling
- What-if analysis
- Critical path analysis

## License

MIT
