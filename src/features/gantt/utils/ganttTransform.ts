import { format } from 'date-fns';
import type { Task, Project, UpdateTaskInput } from '@/types/models';
import type { FrappeGanttTask } from 'frappe-gantt';
import { getTaskDates } from './defaultDates';

// ============================================================================
// GANTT DATA TRANSFORMERS
// ============================================================================

/**
 * Converts a Task to Frappe Gantt format
 *
 * @param task - The task to convert
 * @param project - Optional project for default date fallback
 * @returns Frappe Gantt task object
 */
export function taskToGanttTask(task: Task, project?: Project): FrappeGanttTask {
  // Get dates with defaults if needed
  const { start, end, hasDefaultStart, hasDefaultEnd } = getTaskDates(task, project);

  // Calculate progress based on status
  let progress = 0;
  switch (task.status) {
    case 'done':
      progress = 100;
      break;
    case 'in-progress':
      progress = 50;
      break;
    case 'cancelled':
      progress = 0;
      break;
    case 'blocked':
      progress = 0;
      break;
    default: // 'todo'
      progress = 0;
  }

  // Note: custom_class removed due to DOMTokenList whitespace error
  // Frappe Gantt's internal implementation doesn't support space-separated classes
  // Custom styling can be re-implemented using post-render class application if needed

  return {
    id: task.id,
    name: task.name,
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
    progress,
    dependencies: task.dependsOn?.join(',') || '',
  };
}

/**
 * Converts Frappe Gantt task data back to Task update format
 * Used when user drags/resizes tasks in Gantt
 *
 * @param ganttTask - The Frappe Gantt task
 * @returns Task update object
 */
export function ganttTaskToUpdate(ganttTask: FrappeGanttTask): UpdateTaskInput {
  return {
    startDate: ganttTask.start,
    dueDate: ganttTask.end,
  };
}

/**
 * Converts an array of tasks to Frappe Gantt format
 *
 * @param tasks - Array of tasks
 * @param project - Optional project for default dates
 * @returns Array of Frappe Gantt tasks
 */
export function tasksToGanttTasks(tasks: Task[], project?: Project): FrappeGanttTask[] {
  return tasks.map(task => taskToGanttTask(task, project));
}
