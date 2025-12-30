import { StateCreator } from 'zustand';
import { db } from '@/services/storage/db';
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types/models';

// ============================================================================
// TASKS SLICE STATE & ACTIONS
// ============================================================================

export interface TasksSlice {
  // State
  tasks: Record<string, Task>;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTasks: () => Promise<void>;
  addTask: (task: CreateTaskInput) => Promise<string>;
  editTask: (id: string, updates: UpdateTaskInput) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// SLICE CREATOR
// ============================================================================

export const createTasksSlice: StateCreator<TasksSlice> = (set, get) => ({
  // Initial state
  tasks: {},
  isLoading: false,
  error: null,

  // Load all tasks from IndexedDB
  loadTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const allTasks = await db.tasks.toArray();
      const tasksById = Object.fromEntries(
        allTasks.map(task => [task.id, task])
      );
      set({ tasks: tasksById, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load tasks';
      set({ error: errorMessage, isLoading: false });
      console.error('Error loading tasks:', error);
    }
  },

  // Add a new task
  addTask: async (taskData: CreateTaskInput) => {
    set({ isLoading: true, error: null });
    try {
      // Generate task with auto-fields
      const task: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to IndexedDB
      await db.tasks.add(task);

      // Update state
      set(state => ({
        tasks: { ...state.tasks, [task.id]: task },
        isLoading: false,
      }));

      console.log('Task added:', task.id);
      return task.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add task';
      set({ error: errorMessage, isLoading: false });
      console.error('Error adding task:', error);
      throw error;
    }
  },

  // Edit an existing task
  editTask: async (id: string, updates: UpdateTaskInput) => {
    set({ isLoading: true, error: null });
    try {
      const currentTask = get().tasks[id];
      if (!currentTask) {
        throw new Error(`Task ${id} not found`);
      }

      // Prepare updates with timestamp
      const updatePayload = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Update in IndexedDB
      await db.tasks.update(id, updatePayload);

      // Merge for state update
      const updatedTask: Task = {
        ...currentTask,
        ...updatePayload,
      };

      // Update state
      set(state => ({
        tasks: { ...state.tasks, [id]: updatedTask },
        isLoading: false,
      }));

      console.log('Task updated:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      set({ error: errorMessage, isLoading: false });
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Remove a task
  removeTask: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Delete from IndexedDB
      await db.tasks.delete(id);

      // Update state
      set(state => {
        const { [id]: _, ...remainingTasks } = state.tasks;
        return { tasks: remainingTasks, isLoading: false };
      });

      console.log('Task removed:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove task';
      set({ error: errorMessage, isLoading: false });
      console.error('Error removing task:', error);
      throw error;
    }
  },

  // Clear error state
  clearError: () => set({ error: null }),
});
