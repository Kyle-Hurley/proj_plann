import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createTasksSlice, type TasksSlice } from './slices/tasksSlice';
import { createProjectsSlice, type ProjectsSlice } from './slices/projectsSlice';
import { createPhasesSlice, type PhasesSlice } from './slices/phasesSlice';
import { createFiltersSlice, type FiltersSlice } from './slices/filtersSlice';
import { initializeDatabase } from '@/services/storage/db';
import type { Phase, Task } from '@/types/models';

// ============================================================================
// ROOT STORE TYPE
// ============================================================================

export type RootStore = TasksSlice & ProjectsSlice & PhasesSlice & FiltersSlice;

// ============================================================================
// CREATE STORE
// ============================================================================

export const useStore = create<RootStore>()(
  devtools(
    (...args) => ({
      ...createTasksSlice(...args),
      ...createProjectsSlice(...args),
      ...createPhasesSlice(...args),
      ...createFiltersSlice(...args),
    }),
    {
      name: 'ProjectPlannerStore',
    }
  )
);

// ============================================================================
// INITIALIZE DATABASE ON APP LOAD
// ============================================================================

// Initialize database and load initial data
initializeDatabase()
  .then(() => {
    console.log('Database ready');
    // Auto-load all data on app startup
    const state = useStore.getState();
    Promise.all([
      state.loadTasks(),
      state.loadProjects(),
      state.loadPhases(),
    ]).then(() => {
      console.log('All data loaded');
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
  });

// ============================================================================
// STORE SELECTORS (for optimized component re-renders)
// ============================================================================

// WARNING: Selectors that return arrays/objects create new references on each call.
// When using these in components, you MUST provide a custom equality function
// to prevent infinite re-renders. Example:
//
//   const tasks = useStore(
//     selectTasksArray,
//     (a, b) => a.length === b.length && a.every((task, i) => task.id === b[i]?.id)
//   );
//
// Or use inline selectors with custom equality as shown in TaskList.tsx

// Select all tasks as an array (sorted by order)
// ⚠️ Returns new array reference - use with custom equality function!
export const selectTasksArray = (state: RootStore) =>
  Object.values(state.tasks).sort((a, b) => a.order - b.order);

// Select task by ID (safe - returns same object reference)
export const selectTaskById = (id: string) => (state: RootStore) =>
  state.tasks[id];

// Select tasks by status
// ⚠️ Returns new array reference - use with custom equality function!
export const selectTasksByStatus = (status: string) => (state: RootStore) =>
  Object.values(state.tasks).filter(task => task.status === status);

// Select tasks by priority
// ⚠️ Returns new array reference - use with custom equality function!
export const selectTasksByPriority = (priority: string) => (state: RootStore) =>
  Object.values(state.tasks).filter(task => task.priority === priority);

// ============================================================================
// MILESTONE 2 SELECTORS
// ============================================================================

// Select phases organized by hierarchy (parent phases with their children)
// ⚠️ Returns new object with arrays - use with useMemo in components!
export const selectPhasesHierarchy = (state: RootStore): { parents: Phase[], children: Record<string, Phase[]> } => {
  const projectId = state.selectedProjectId;
  if (!projectId) return { parents: [], children: {} };

  const allPhases = Object.values(state.phases).filter(
    (p) => p.projectId === projectId
  );

  const parents = allPhases
    .filter((p) => !p.parentPhaseId)
    .sort((a, b) => a.order - b.order);

  const children = parents.reduce((acc, parent) => {
    acc[parent.id] = allPhases
      .filter((p) => p.parentPhaseId === parent.id)
      .sort((a, b) => a.order - b.order);
    return acc;
  }, {} as Record<string, Phase[]>);

  return { parents, children };
};

// Select filtered tasks based on current filter criteria
// ⚠️ Returns new array reference - use with useMemo in components!
export const selectFilteredTasks = (state: RootStore): Task[] => {
  const { filters, tasks, selectedProjectId } = state;
  let filtered = Object.values(tasks);

  // Filter by selected project (always apply)
  if (selectedProjectId) {
    filtered = filtered.filter((t) => t.projectId === selectedProjectId);
  }

  // Apply phase filter
  if (filters.phaseId !== undefined) {
    filtered = filtered.filter((t) => t.phaseId === filters.phaseId);
  }

  // Apply status filter
  if (filters.status) {
    filtered = filtered.filter((t) => t.status === filters.status);
  }

  // Apply priority filter
  if (filters.priority) {
    filtered = filtered.filter((t) => t.priority === filters.priority);
  }

  // Apply text search (case-insensitive)
  if (filters.searchText) {
    const search = filters.searchText.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        (t.description && t.description.toLowerCase().includes(search))
    );
  }

  // Apply date range filters
  if (filters.startDateFrom) {
    filtered = filtered.filter((t) => t.startDate && t.startDate >= filters.startDateFrom!);
  }
  if (filters.startDateTo) {
    filtered = filtered.filter((t) => t.startDate && t.startDate <= filters.startDateTo!);
  }
  if (filters.dueDateFrom) {
    filtered = filtered.filter((t) => t.dueDate && t.dueDate >= filters.dueDateFrom!);
  }
  if (filters.dueDateTo) {
    filtered = filtered.filter((t) => t.dueDate && t.dueDate <= filters.dueDateTo!);
  }

  // Sort by order
  return filtered.sort((a, b) => a.order - b.order);
};
