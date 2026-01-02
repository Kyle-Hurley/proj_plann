import { parseISO, addDays, isBefore, startOfDay } from 'date-fns';
import type { Task, Project } from '@/types/models';

// ============================================================================
// DEFAULT DATE LOGIC FOR GANTT
// ============================================================================

export interface TaskDateInfo {
  start: Date;
  end: Date;
  hasDefaultStart: boolean;
  hasDefaultEnd: boolean;
}

/**
 * Gets start and end dates for a task, generating defaults if needed
 *
 * Rules:
 * 1. If no startDate: use project.startDate OR today
 * 2. If no dueDate: calculate from estimatedHours (8hr workdays) OR startDate + 1 day
 * 3. Ensure end >= start
 *
 * @param task - The task to get dates for
 * @param project - The project (for fallback start date)
 * @returns Date information with flags indicating which dates are defaults
 */
export function getTaskDates(task: Task, project?: Project): TaskDateInfo {
  let start: Date;
  let end: Date;
  let hasDefaultStart = false;
  let hasDefaultEnd = false;

  try {
    // RULE 1: Determine start date
    if (task.startDate) {
      start = startOfDay(parseISO(task.startDate));
    } else {
      // Use project start date if available, otherwise today
      if (project?.startDate) {
        start = startOfDay(parseISO(project.startDate));
      } else {
        start = startOfDay(new Date());
      }
      hasDefaultStart = true;
    }

    // RULE 2: Determine end date
    if (task.dueDate) {
      end = startOfDay(parseISO(task.dueDate));
    } else if (task.estimatedHours && task.estimatedHours > 0) {
      // Calculate based on 8-hour workdays
      const workDays = Math.ceil(task.estimatedHours / 8);
      end = addDays(start, workDays);
      hasDefaultEnd = true;
    } else {
      // Default: 1 day duration
      end = addDays(start, 1);
      hasDefaultEnd = true;
    }

    // RULE 3: Ensure end >= start
    if (isBefore(end, start)) {
      end = addDays(start, 1);
      hasDefaultEnd = true;
    }

    return { start, end, hasDefaultStart, hasDefaultEnd };
  } catch (error) {
    console.error('Error parsing dates for task:', task.name, error);
    // Fallback to today and tomorrow
    const fallbackStart = startOfDay(new Date());
    return {
      start: fallbackStart,
      end: addDays(fallbackStart, 1),
      hasDefaultStart: true,
      hasDefaultEnd: true,
    };
  }
}
