# Project Planner

A local-first project planning web application built with React, TypeScript, and Vite.

## Features (Milestone 3)

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
- **Assign personnel to tasks** with dedicated assignment interface
- Five status types: todo, in-progress, blocked, done, cancelled
- Four priority levels: low, medium, high, critical

### Advanced Filtering
- **Phase filter**: Click any phase to show only its tasks
- **Status & Priority**: Dropdown filters for quick sorting
- **Text search**: Find tasks by name or description
- **Date ranges**: Filter by start date or due date ranges
- Individual clear buttons for each filter
- "Clear All" to reset all filters at once

### Personnel Management
- Add and manage team members with roles, email, hourly rates
- Track availability (hours per week)
- Active/inactive status for personnel
- Assign multiple personnel to tasks
- Delete protection prevents removing personnel assigned to tasks or with budget entries

### Budget Tracking
- **Budget entries** across 4 categories: Labor, Materials, Software, Other
- **Auto-calculate labor costs**: Personnel hourly rate × hours
- Track estimated vs actual costs with variance indicators
- Link budget entries to specific tasks and personnel
- **Budget summary** with category breakdown, labor vs non-labor costs
- Real-time budget status indicators (over/near/on budget)

### Cost Forecasting
- **Project completion forecast** based on task progress
- **Burn rate analysis**: Actual cost per % completion
- Forecasted final cost with overrun/savings calculation
- Trend indicators (under/on/over budget)
- Warning alerts when forecasting budget overruns
- Visual progress tracking with cost metrics

### Data Persistence
- Local persistence with IndexedDB
- Export/import data as JSON for backup and portability (includes personnel & budget)
- Responsive 3-column UI with Tailwind CSS
- Scrollable left sidebar for long content

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
├── features/
│   ├── tasks/            # Task management feature
│   ├── projects/         # Project management
│   ├── phases/           # Phase organization
│   ├── personnel/        # Personnel & assignment
│   └── budget/           # Budget entries & forecasting
├── store/                 # Zustand state management
│   └── slices/           # Feature-based state slices
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

3. **Add Team Members** (Optional but recommended for budget tracking)
   - Click "+ Add Personnel" in the Personnel panel
   - Enter name (required), email, role, hourly rate, and availability
   - Set active status
   - Click "Create"

4. **Create Tasks**
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

**Assigning Personnel to Tasks**
1. Click "Assign People" button on any task card
2. Select personnel from the checkbox list
3. Click "Save Assignments"
4. View assigned personnel in the task edit form

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

### Managing Budget

**Adding Budget Entries**
1. Click "+ Add Entry" in the Budget Entries panel
2. Select category (Labor, Materials, Software, or Other)
3. For Labor entries:
   - Select personnel (required)
   - Enter hours (required)
   - Cost auto-calculates based on hourly rate
4. For other categories:
   - Enter estimated cost manually
5. Optionally link to a task and add actual cost
6. Click "Create"

**Viewing Budget Summary**
- Expand "Budget Overview" in the Project Info panel
- View total estimated vs actual costs
- See labor vs non-labor breakdown
- Review category-wise budget allocation
- Check budget status indicators

**Monitoring Cost Forecast**
- View the "Cost Forecast" card in the right sidebar
- Track task completion progress
- See forecasted final cost based on current burn rate
- Monitor for budget overrun warnings
- Review trend indicators and cost metrics

### Export/Import Data

- **Export**: Click "Export" in the header to download project as JSON (includes personnel & budget)
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

### Milestone 3: Personnel & Budget ✅ COMPLETED
- ✅ Personnel management with roles and hourly rates
- ✅ Task assignment interface with multi-select
- ✅ Budget entries with 4 categories (labor, materials, software, other)
- ✅ Auto-calculate labor costs (personnel rate × hours)
- ✅ Budget summaries with category rollups
- ✅ Cost forecasting with burn rate analysis
- ✅ Real-time variance tracking (estimated vs actual)
- ✅ Budget overrun warnings and trend indicators

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
