# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Milestone 3: Personnel & Budget (Planned)
- Team member management
- Cost tracking and forecasting
- Budget rollups

### Milestone 4: Gantt Chart (Planned)
- Visual timeline with DHTMLX Gantt
- Drag-to-reschedule functionality
- Dependency visualization

### Milestone 5: Advanced Features (Planned)
- Dependency-aware scheduling
- What-if analysis
- Critical path analysis

[Unreleased]: https://github.com/yourusername/proj_plann/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/yourusername/proj_plann/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/yourusername/proj_plann/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/yourusername/proj_plann/releases/tag/v0.1.0
