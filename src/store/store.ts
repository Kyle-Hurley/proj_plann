import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createTasksSlice, type TasksSlice } from './slices/tasksSlice';
import { initializeDatabase } from '@/services/storage/db';

// ============================================================================
// ROOT STORE TYPE
// ============================================================================

export type RootStore = TasksSlice;
// Future: Add more slices like ProjectsSlice, PhasesSlice, etc.

// ============================================================================
// CREATE STORE
// ============================================================================

export const useStore = create<RootStore>()(
  devtools(
    (...args) => ({
      ...createTasksSlice(...args),
      // Future: Spread additional slices here
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
    // Auto-load tasks on app startup
    useStore.getState().loadTasks();
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
