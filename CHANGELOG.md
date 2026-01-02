# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2026-01-01

### Added - Milestone 4: Gantt Chart Visualization

#### Gantt Chart Features
- **Interactive timeline visualization**: Integrated frappe-gantt library for visual project timeline
  - MIT-licensed, lightweight Gantt chart component
  - Replaced originally planned DHTMLX Gantt for smaller bundle size and better TypeScript support
- **Multiple view modes**: Switch between Day, Week, Month, Quarter, and Year views
  - GanttToolbar component for view mode selection
  - Persistent view mode using localStorage
- **Task dependency system**: Complete dependency management with validation
  - Tasks can specify dependencies via `dependsOn` array (task IDs)
  - TaskDependencyEditor modal for adding/removing dependencies
  - Cycle detection prevents circular dependency chains
  - Visual dependency arrows on Gantt chart
- **Drag-and-drop rescheduling**: Interactive task bar manipulation
  - Drag task bars left/right to change start dates
  - Changes auto-save to IndexedDB
  - Date changes persist across page reloads
- **Smart date defaults**: Intelligent date assignment for tasks without dates
  - Tasks with no dependencies: Start today, 7-day duration
  - Tasks with dependencies: Start when all dependencies complete
  - Cascading date calculations through dependency chains
  - Ensures task bars always visible on timeline
- **Visual progress tracking**: Color-coded task bars based on status
  - Custom status colors (todo: gray, in-progress: blue, done: green, etc.)
  - Task completion status reflected visually
  - Click tasks on chart to edit

#### Components Added
- `GanttView` - Main Gantt chart visualization wrapper
  - Integrates frappe-gantt with React lifecycle
  - Handles task updates and date changes
  - Responsive chart rendering
- `GanttToolbar` - View mode selector with radio buttons
  - Day, Week, Month, Quarter, Year options
  - Persists selection to localStorage
- `TaskDependencyEditor` - Modal for dependency management
  - Shows all project tasks as potential dependencies
  - Pre-selects existing dependencies
  - Validates for circular dependencies
  - Save/cancel with loading states

#### Utilities Added
- `ganttTransform.ts` - Transform tasks to frappe-gantt format
  - Converts Task entities to Gantt-compatible format
  - Handles date defaulting and dependency mapping
- `dependencyValidation.ts` - Dependency cycle detection
  - Graph-based cycle detection algorithm
  - Prevents circular dependency chains
  - Returns validation errors with task details
- `defaultDates.ts` - Smart date assignment logic
  - Calculates start dates based on dependency chains
  - Handles tasks with/without dependencies
  - 7-day default duration for tasks

#### Type Definitions Added
- `frappe-gantt.d.ts` - TypeScript definitions for frappe-gantt
  - Gantt class interface
  - Task, ViewMode, and options types
  - Enables full TypeScript support

#### State Management Enhancements
- **New Zustand slice**:
  - `ganttSlice`: Gantt view mode state management
- **Enhanced Task entity**:
  - Added `dependsOn` field: Array of task IDs
  - Exported in JSON for full project state preservation

#### UI/UX Improvements
- **Updated 3-column layout**:
  - GanttView integrated into center panel above TaskList
  - Seamless transition between list and timeline views
- **Gantt-specific styling**:
  - Custom CSS in `src/styles/gantt.css`
  - Task bar colors, dependency arrows, grid styling
  - Responsive timeline container
- **Dependency visualization**:
  - Arrow connectors between dependent tasks
  - Clear visual representation of task relationships

#### Example Data
- **example-groundwater-study.json**: Comprehensive sample project
  - Environmental science project demonstrating full feature set
  - 7 personnel with realistic roles and rates ($65-$185/hour)
  - 4 parent phases, 8 child phases
  - 14 tasks with 8 dependency relationships
  - 20 budget entries across all categories
  - Realistic project structure for testing and demos

## [0.3.0] - 2025-12-31

### Added - Milestone 3: Personnel & Budget Management with Cost Forecasting

#### Personnel Management
- **Personnel entity**: Full CRUD operations for team members
  - Properties: name, email, role, hourlyRate, availability (hours/week), isActive
  - Active/inactive status tracking for personnel lifecycle management
  - Dependency protection: Cannot delete personnel assigned to tasks or with budget entries
- **Personnel assignment**: Dedicated modal interface for assigning team members to tasks
  - Multi-select checkbox interface with personnel details
  - Shows assigned personnel in task form (read-only display)
  - "Assign People" button in task cards with assignment count badge
  - Updates task's `assignedTo` array with personnel IDs
- **PersonnelList component**: Complete personnel management interface
  - Shows active/total count in header
  - Add, edit, delete operations with confirmation dialogs
  - Displays hourly rate, availability, and status badges
- **PersonnelForm component**: Create/edit personnel with validation
  - Name required, hourly rate and availability must be positive numbers
  - Email validation, optional role field
  - Active status checkbox (default: true)
- **PersonnelAssignmentModal**: Dedicated interface for task assignments
  - Shows active personnel with role and hourly rate
  - Pre-selects already assigned personnel
  - Save/cancel actions with loading states

#### Budget Tracking
- **BudgetEntry entity**: Comprehensive cost tracking across 4 categories
  - Categories: `labor`, `materials`, `software`, `other`
  - Tracks both `estimatedCost` and optional `actualCost`
  - Labor-specific fields: `personnelId` and `hours` for auto-calculation
  - Optional link to specific tasks via `taskId`
- **Auto-calculate labor costs**: Smart cost calculation for labor entries
  - Formula: `hourlyRate × hours` from personnel data
  - Auto-populates estimated cost field (can be manually overridden)
  - Updates in real-time when personnel or hours change
- **BudgetEntryForm component**: Intelligent budget entry form
  - Category selector with conditional field display
  - Labor entries require personnel selection and hours input
  - Non-labor entries use manual estimated cost input
  - Task linking via dropdown of project tasks
  - Actual cost tracking for variance analysis
- **BudgetList component**: Budget entry management with filtering
  - Category filter tabs (All, Labor, Materials, Software, Other)
  - Shows entry count per category
  - Empty states for filtered views
  - Add/edit/delete operations with confirmation
- **BudgetEntryItem component**: Individual budget entry display
  - Color-coded category badges
  - Shows estimated vs actual costs with variance
  - Links to associated task and personnel names
  - Visual variance indicators (green/red/gray)

#### Budget Summaries & Analytics
- **BudgetSummary component**: Comprehensive project budget overview
  - Integrated into ProjectInfo card as collapsible section
  - **Total budget tracking**: Estimated vs actual with variance percentage
  - **Labor vs non-labor breakdown**: Separate cost tracking
  - **Category-wise breakdown**: Individual category performance
  - **Visual status indicators**:
    - Red warning: Over budget by 10%+
    - Yellow caution: Within 5-10% of budget
    - Green checkmark: Under budget
  - Real-time updates as budget entries are added/modified

#### Cost Forecasting
- **BudgetForecast component**: Advanced cost projection system
  - **Task completion progress**: Visual progress bar with percentage
  - **Burn rate analysis**: Calculates actual cost per % completion
  - **Forecasted final cost**: Projects total cost based on current spending rate
  - **Overrun/savings calculation**: Shows projected variance from budget
  - **Trend indicators**:
    - Under budget: Forecasted >5% under estimate (green)
    - On budget: Within ±5% of estimate (yellow)
    - Over budget: Forecasted >5% over estimate (red)
  - **Warning banners**: Prominent alerts when forecasting budget overrun
  - **Conditional display**: Only shows when project has tasks and budget entries
- **Real-time metrics**:
  - Actual cost to date
  - Estimated total cost
  - Forecasted final cost
  - Estimated cost remaining
  - Burn rate (cost per 100% completion)

#### State Management Enhancements
- **New Zustand slices**:
  - `personnelSlice`: Personnel CRUD with task/budget dependency checking
  - `budgetSlice`: Budget entry CRUD operations
- **Advanced selectors**:
  - `selectActivePersonnel`: Returns active personnel sorted by name
  - `selectProjectBudgetEntries`: Filters budget entries by current project
  - `selectProjectBudgetSummary`: Complex budget rollup calculations
  - `selectCostForecast`: Burn rate and forecast calculations
- **Proper memoization**: All selectors use `useMemo` to prevent infinite re-renders
- **Dependency protection**: Cannot delete personnel with task assignments or budget entries

#### UI/UX Improvements
- **Updated 3-column layout**:
  - Left sidebar: Scrollable (ProjectInfo + BudgetSummary, PhaseList, PersonnelList, BudgetList)
  - Center panel: TaskList with "Assign People" buttons
  - Right sidebar: BudgetForecast + FilterPanel
- **Scrollable left sidebar**: Added overflow handling for long content
- **Budget forecast card**: New right sidebar component for cost tracking
- **Visual indicators**: Color-coded badges for budget status and trends
- **Loading states**: Proper loading indicators during async operations
- **Empty states**: Helpful prompts for budget forecast when no data exists

#### Components Added
- `PersonnelList` - Personnel management interface
- `PersonnelItem` - Individual personnel card with edit/delete
- `PersonnelForm` - Create/edit personnel with validation
- `PersonnelAssignmentModal` - Assign personnel to tasks
- `BudgetList` - Budget entry management with category filtering
- `BudgetEntryItem` - Individual budget entry display
- `BudgetEntryForm` - Create/edit budget entries with auto-calculation
- `BudgetSummary` - Project budget overview (in ProjectInfo)
- `BudgetForecast` - Cost forecast with burn rate analysis

### Improved
- **Database schema**: Upgraded to version 2
  - Added `personnelId` index to budgetEntries table
  - Enables efficient querying for personnel dependency checking
- **Export/import**: Now includes personnel and budget data
  - Updated `triggerImport` to reload personnel and budget entries
  - Full project state preservation across export/import cycles
- **TaskItem component**: Enhanced with personnel assignment
  - "Assign People" button with count badge
  - Stacked button layout for better mobile support
- **TaskForm component**: Shows assigned personnel
  - Read-only display of assigned personnel names and roles
  - Link to assignment modal for management

### Fixed
- **Infinite render loop in BudgetEntryForm**: Fixed Zustand selector usage
  - Changed from single object selector to separate useStore calls
  - Prevents "Maximum update depth exceeded" error
  - Pattern: Use multiple `useStore((state) => state.field)` instead of object destructuring
- **Database index error**: Added `personnelId` to budgetEntries indexes
  - Fixes "KeyPath personnelId on object store budgetEntries is not indexed" error
  - Enables WHERE queries on personnelId field

### Technical Details
- Database version: 2 (added personnelId index)
- New selectors with complex aggregation logic:
  - Budget rollups calculate totals, variances, and percentages
  - Forecast uses burn rate formula: `actualCost / (percentComplete / 100)`
- Auto-calculation uses reactive useEffect patterns
- All budget calculations handle edge cases (0%, 100%, no data)
- Type-safe budget summary interfaces with strict TypeScript
- Zustand store now combines 6 slices: tasks, projects, phases, filters, personnel, budget

## [0.2.1] - 2025-12-30

### Added
- **Export Modal**: Interactive modal for customizing export filenames
  - Preview of final filename before export
  - Enter key support for quick export
  - Escape key support for cancel
  - Auto-selects filename (without extension) for easy editing
- **File System Access API**: Enhanced export with native "Save As" dialog
  - Chromium browsers (Chrome, Edge, Opera) now support folder selection
  - Graceful fallback to Downloads folder for Firefox and Safari
  - Better user experience with OS-native save dialogs
- **Browser Compatibility Message**: Informational message in export modal
  - Only shown in browsers without File System Access API support
  - Explains folder selection limitations in Firefox/Safari
  - Helps set user expectations about export behavior

### Improved
- **Filter Panel UI**: Complete styling overhaul for consistency
  - All filter fields now have white backgrounds matching form fields
  - Added subtle shadows (`shadow-sm`) for visual depth
  - Improved text contrast with `text-gray-900` for input values
  - Updated label colors from `text-gray-600` to `text-gray-700` for better readability
  - Consistent focus states across all input types
- **Export Workflow**: Filename customization before export
  - `generateDefaultFilename()` helper function for smart filename generation
  - Project name included in default filename (e.g., `my-project-2025-12-30.json`)
  - User cancellation handled gracefully without error messages
- **Code Organization**: New component structure
  - `FilterPanel` component wraps `TaskFilters` for better layout control
  - `ExportModal` component for reusable export dialog

### Fixed
- Filter fields no longer appear with transparent/gray backgrounds
- Consistent styling between filter fields and form fields throughout the app
- Export cancellation no longer shows false error alerts

### Technical Details
- File System Access API detection: `'showSaveFilePicker' in window`
- Export modal uses controlled component pattern with default filename prop
- All Tailwind CSS classes aligned with project-wide form field standards

## [0.2.0] - 2025-12-30

### Added - Milestone 2: Single Project Management with 2-Level Phases and Filtering

#### Project Management
- **Project entity**: Full CRUD operations for projects with metadata
  - Properties: name, description, startDate, endDate, status
  - Status types: `planning`, `active`, `on-hold`, `completed`, `archived`
  - Single active project model (switch via import/export)
  - Project creation from empty state with "Create New Project" button
- **Project-scoped export**: JSON filename includes project name (e.g., `my-project-2025-12-30.json`)
- **Migration support**: Automatically creates "Default Project" when importing Milestone 1 data
- **Delete protection**: Prevents deleting projects that have tasks or phases

#### Phase Organization
- **2-level phase hierarchy**: Parent phases and child phases only
  - Parent phases act as section headers
  - Child phases contain tasks
  - Enforced hierarchy validation prevents grandchild phases
- **Phase CRUD operations**: Create, edit, delete phases with dependency checking
- **Color-coded phases**: Optional color picker for visual organization
- **Phase filtering**: Click any phase to filter tasks to that phase only
- **Delete protection**: Prevents deleting phases with child phases or tasks
- **Grouped list UI**: Simple, intuitive display (parent → children)

#### Task Enhancements
- **Phase assignment**: Tasks can be assigned to child phases via dropdown
- **Date fields**: Added `startDate` and `dueDate` with date picker inputs
- **Date validation**: Ensures due date is after start date
- **Enhanced task form**: Phase selection and date inputs added to task creation/editing

#### Advanced Filtering System
- **Phase filter**: Click phases in sidebar to show only their tasks
- **Status filter**: Dropdown to filter by task status
- **Priority filter**: Dropdown to filter by priority level
- **Text search**: Real-time search across task names and descriptions
- **Date range filters**: Four date inputs for start/due date ranges
  - Start Date From/To
  - Due Date From/To
  - Individual "Clear" buttons for each date field
- **Clear All Filters**: Single button to reset all active filters
- **Visual feedback**: Active filters show "Clear All" button

#### Architecture & State Management
- **New Zustand slices**:
  - `projectsSlice`: Project CRUD with dependency checking
  - `phasesSlice`: Phase CRUD with 2-level hierarchy validation
  - `filtersSlice`: Centralized filter state management
- **Powerful selectors**:
  - `selectPhasesHierarchy`: Organizes phases into parent/child structure
  - `selectFilteredTasks`: Applies all filter criteria to task list
- **Proper memoization**: All selectors use `useMemo` to prevent infinite re-renders
- **Delete protection**: Cascade delete checks prevent orphaned data

#### UI/UX Improvements
- **3-column responsive layout**:
  - Left sidebar (25%): Project Info + Phase List
  - Center panel (50%): Task List
  - Right sidebar (25%): Filter Controls
- **Empty states**: Helpful prompts when no project/phases/tasks exist
- **Inline editing**: Project info can be edited in-place
- **Form modals**: Tasks and phases use modal forms for detailed editing
- **Visual hierarchy**: Clear visual distinction between parent and child phases
- **Hover states**: Edit/Delete buttons appear on hover for phases

#### Components Added
- `ProjectInfo` - Display and edit project metadata
- `ProjectForm` - Create/edit projects with validation
- `PhaseList` - Display phase hierarchy with add button
- `PhaseItem` - Individual phase with click-to-filter and edit/delete
- `PhaseForm` - Create/edit phases with 2-level validation
- `TaskFilters` - Comprehensive filter panel with all filter types

#### Bug Fixes
- Fixed issue where users couldn't create a new project from empty state
- Fixed issue where phases couldn't be created without importing data first
- Added individual clear buttons for date filters (was only "Clear All")

### Technical Details
- Zustand store now combines 4 slices: tasks, projects, phases, filters
- Database auto-loads all entities on startup (tasks, projects, phases)
- Export includes `selectedProjectId` for state restoration
- Import automatically reloads all data after completion
- All TypeScript types extended with helper types and filter interfaces

## [0.1.0] - 2025-12-29

### Added - Milestone 1: Basic Task CRUD + Persistence

#### Core Features
- Task management with full CRUD operations (Create, Read, Update, Delete)
- Task properties: name, description, status, priority
- Five status types: `todo`, `in-progress`, `blocked`, `done`, `cancelled`
- Four priority levels: `low`, `medium`, `high`, `critical`
- Local persistence using IndexedDB via Dexie.js
- JSON export/import functionality for data backup and portability
- Responsive UI built with Tailwind CSS

#### Architecture
- Vite build system with React 18 and TypeScript
- Zustand state management with devtools middleware
- Feature-sliced architecture with clear layer separation
- Normalized data model (entities indexed by UUID)
- Path aliases (`@/*`) for clean imports

#### Components
- `TaskList` - Main task list view with add button
- `TaskForm` - Create/edit task form with validation
- `TaskItem` - Individual task card with edit/delete actions
- `App` - Root component with export/import controls

#### Data Layer
- Dexie database with versioned schema
- Complete data models for future features (Projects, Phases, Personnel, Budget)
- Automatic database initialization on app load
- Helper functions for database stats and clearing data

#### Documentation
- Comprehensive CLAUDE.md with architecture details and development workflow
- README.md with quick start guide and roadmap
- Initial project setup with all configuration files

### Fixed
- Infinite re-render loop in TaskList component caused by unstable selector
  - Changed from direct selector usage to `useMemo` pattern
  - Added warning comments to array-returning selectors in store
  - Prevents "Maximum update depth exceeded" React error

### Technical Details
- Build tool: Vite 6
- React: 18.3.1
- TypeScript: 5.6.2
- Zustand: 5.0.2
- Dexie: 4.0.10
- Tailwind CSS: 3.4.17
- date-fns: 4.1.0

## Future Milestones

### Milestone 4: Gantt Chart ✅ COMPLETED (Released in v0.4.0)
- ✅ Visual timeline with frappe-gantt
- ✅ Drag-to-reschedule functionality
- ✅ Dependency visualization with cycle detection

### Milestone 5: Advanced Features (Planned)
- Dependency-aware scheduling
- What-if analysis
- Critical path analysis

[Unreleased]: https://github.com/yourusername/proj_plann/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/yourusername/proj_plann/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/yourusername/proj_plann/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/yourusername/proj_plann/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/yourusername/proj_plann/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/yourusername/proj_plann/releases/tag/v0.1.0
