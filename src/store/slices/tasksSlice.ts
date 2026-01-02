import { StateCreator } from 'zustand';
import { db } from '@/services/storage/db';
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types/models';
import { detectCircularDependency, getTasksToUpdateOnDelete } from '@/features/gantt/utils/dependencyValidation';

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
  addTaskDependency: (taskId: string, dependsOnId: string) => Promise<void>;
  removeTaskDependency: (taskId: string, dependsOnId: string) => Promise<void>;
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
      // Get tasks that depend on this one
      const tasksToUpdate = getTasksToUpdateOnDelete(id, get().tasks);

      // Delete from IndexedDB
      await db.tasks.delete(id);

      // Remove this task from dependsOn arrays of other tasks
      for (const taskId of tasksToUpdate) {
        const task = get().tasks[taskId];
        if (task && task.dependsOn) {
          const newDependsOn = task.dependsOn.filter(depId => depId !== id);
          await db.tasks.update(taskId, {
            dependsOn: newDependsOn.length > 0 ? newDependsOn : undefined,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      // Reload tasks to get updated state
      await get().loadTasks();

      console.log('Task removed:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove task';
      set({ error: errorMessage, isLoading: false });
      console.error('Error removing task:', error);
      throw error;
    }
  },

  // Add a dependency between tasks
  addTaskDependency: async (taskId: string, dependsOnId: string) => {
    set({ isLoading: true, error: null });
    try {
      const task = get().tasks[taskId];
      const dependsOnTask = get().tasks[dependsOnId];

      // Validation
      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }
      if (!dependsOnTask) {
        throw new Error(`Dependency task ${dependsOnId} not found`);
      }
      if (taskId === dependsOnId) {
        throw new Error('Task cannot depend on itself');
      }

      // Check for circular dependency
      if (detectCircularDependency(taskId, dependsOnId, get().tasks)) {
        throw new Error(
          `Adding this dependency would create a circular reference with "${dependsOnTask.name}"`
        );
      }

      // Add dependency to array
      const currentDependencies = task.dependsOn || [];
      if (currentDependencies.includes(dependsOnId)) {
        // Dependency already exists
        set({ isLoading: false });
        return;
      }

      const newDependsOn = [...currentDependencies, dependsOnId];

      // Update task
      await get().editTask(taskId, { dependsOn: newDependsOn });

      console.log(`Dependency added: ${taskId} depends on ${dependsOnId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add dependency';
      set({ error: errorMessage, isLoading: false });
      console.error('Error adding dependency:', error);
      throw error;
    }
  },

  // Remove a dependency between tasks
  removeTaskDependency: async (taskId: string, dependsOnId: string) => {
    set({ isLoading: true, error: null });
    try {
      const task = get().tasks[taskId];
      if (!task || !task.dependsOn) {
        set({ isLoading: false });
        return;
      }

      // Remove dependency from array
      const newDependsOn = task.dependsOn.filter(id => id !== dependsOnId);

      // Update task (set to undefined if no dependencies left)
      await get().editTask(taskId, {
        dependsOn: newDependsOn.length > 0 ? newDependsOn : undefined,
      });

      console.log(`Dependency removed: ${taskId} no longer depends on ${dependsOnId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove dependency';
      set({ error: errorMessage, isLoading: false });
      console.error('Error removing dependency:', error);
      throw error;
    }
  },

  // Clear error state
  clearError: () => set({ error: null }),
});
