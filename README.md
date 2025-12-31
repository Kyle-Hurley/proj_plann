# Project Planner

A local-first project planning web application built with React, TypeScript, and Vite.

## Features (Milestone 2)

### Project Management
- Create and manage project metadata (name, description, dates, status)
- Project-scoped JSON export/import with project name in filename
- Switch between projects by importing different JSON files
- Automatic migration from Milestone 1 data

### Phase Organization
- 2-level hierarchical phase structure (parent phases → child phases)
- Color-coded phases for visual organization
- Click phases to filter tasks
- Delete protection prevents removing phases with tasks

### Task Management
- Create, read, update, and delete tasks
- Task properties: name, description, status, priority, start/due dates
- Assign tasks to child phases
- Five status types: todo, in-progress, blocked, done, cancelled
- Four priority levels: low, medium, high, critical

### Advanced Filtering
- **Phase filter**: Click any phase to show only its tasks
- **Status & Priority**: Dropdown filters for quick sorting
- **Text search**: Find tasks by name or description
- **Date ranges**: Filter by start date or due date ranges
- Individual clear buttons for each filter
- "Clear All" to reset all filters at once

### Data Persistence
- Local persistence with IndexedDB
- Export/import data as JSON for backup and portability
- Responsive 3-column UI with Tailwind CSS

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

### Getting Started

1. **Create Your First Project**
   - Click "Create New Project" in the left sidebar
   - Enter project name, description, dates, and status
   - Click "Create"

2. **Add Phases** (Optional but recommended)
   - Click "+ Add Phase" in the Phase List panel
   - Create parent phases (e.g., "Planning", "Development", "Testing")
   - Leave "Parent Phase" as "None (Top-level phase)"
   - Create child phases under each parent (e.g., "Requirements" under "Planning")
   - Select a parent phase from the dropdown

3. **Create Tasks**
   - Click the "New Task" button in the center panel
   - Fill in task name (required)
   - Optionally select a phase, add dates, description, status, and priority
   - Click "Create"

### Working with Tasks

**Editing Tasks**
1. Click "Edit" on any task card
2. Modify the fields
3. Click "Update"

**Deleting Tasks**
1. Click "Delete" on any task card
2. Confirm the deletion

### Filtering Tasks

- **By Phase**: Click any phase in the left panel to show only its tasks
- **By Status**: Use the Status dropdown in the right panel
- **By Priority**: Use the Priority dropdown in the right panel
- **By Search**: Type in the search box to find tasks by name/description
- **By Dates**: Set date ranges for start dates or due dates
- **Clear Filters**: Click individual "Clear" buttons or "Clear All"

### Managing Projects

**Editing Project Info**
1. Click "Edit" in the Project Info panel
2. Modify project details
3. Click "Update"

**Switching Projects**
- Export current project: Click "Export" in header
- Import different project: Click "Import" and select a JSON file
- Create new project: Start fresh with "Create New Project"

### Export/Import Data

- **Export**: Click "Export" in the header to download project as JSON (filename includes project name)
- **Import**: Click "Import" and select a previously exported JSON file
- **Note**: Importing replaces all current data with the imported project

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

### Milestone 2: Projects & Phases ✅ COMPLETED
- ✅ Single project management with metadata
- ✅ 2-level hierarchical phase organization
- ✅ Comprehensive filtering and search
- ✅ Project-scoped export/import
- ✅ Delete protection for dependencies

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
