# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Milestone 2: Projects & Phases (Planned)
- Multi-project support
- Hierarchical phase organization
- Task filtering and search

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

[Unreleased]: https://github.com/yourusername/proj_plann/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/proj_plann/releases/tag/v0.1.0
