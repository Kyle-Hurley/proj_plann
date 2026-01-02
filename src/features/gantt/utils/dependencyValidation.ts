import type { Task } from '@/types/models';

// ============================================================================
// CIRCULAR DEPENDENCY DETECTION
// ============================================================================

/**
 * Detects if adding a new dependency would create a circular reference
 * Uses Depth-First Search (DFS) to detect cycles in the dependency graph
 *
 * @param taskId - The task that would depend on newDependencyId
 * @param newDependencyId - The task that taskId wants to depend on
 * @param allTasks - All tasks in the system
 * @returns true if adding this dependency would create a cycle
 *
 * @example
 * // Task A depends on B, B depends on C
 * // Trying to add C depends on A would create a cycle: A→B→C→A
 * detectCircularDependency('C', 'A', allTasks) // returns true
 */
export function detectCircularDependency(
  taskId: string,
  newDependencyId: string,
  allTasks: Record<string, Task>
): boolean {
  // Self-dependency is always circular
  if (taskId === newDependencyId) {
    return true;
  }

  // Build adjacency graph: for each task, track what tasks depend on it
  // If A depends on B, then graph[B] contains A
  const graph: Record<string, string[]> = {};

  // Add existing dependencies to graph
  Object.values(allTasks).forEach((task) => {
    task.dependsOn?.forEach((depId) => {
      if (!graph[depId]) {
        graph[depId] = [];
      }
      graph[depId].push(task.id);
    });
  });

  // Add the proposed new dependency
  if (!graph[taskId]) {
    graph[taskId] = [];
  }
  graph[taskId].push(newDependencyId);

  // Now check if we can reach taskId from newDependencyId
  // If yes, we have a cycle
  const visited = new Set<string>();

  function dfs(nodeId: string): boolean {
    // If we reached the original task, we have a cycle
    if (nodeId === taskId) {
      return true;
    }

    // Already visited this node in this DFS path
    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);

    // Check all tasks that depend on this node
    const dependents = graph[nodeId] || [];
    for (const dependentId of dependents) {
      if (dfs(dependentId)) {
        return true;
      }
    }

    return false;
  }

  return dfs(newDependencyId);
}

/**
 * Validates all dependencies for a task and returns any errors
 *
 * @param task - The task to validate
 * @param allTasks - All tasks in the system
 * @returns Array of error messages (empty if valid)
 */
export function validateDependencies(
  task: Task,
  allTasks: Record<string, Task>
): string[] {
  const errors: string[] = [];

  if (!task.dependsOn || task.dependsOn.length === 0) {
    return errors;
  }

  // Check each dependency
  for (const depId of task.dependsOn) {
    // Check if dependency exists
    if (!allTasks[depId]) {
      errors.push(`Dependency task "${depId}" not found`);
      continue;
    }

    // Check for self-dependency
    if (depId === task.id) {
      errors.push('Task cannot depend on itself');
      continue;
    }

    // Check for circular dependency
    if (detectCircularDependency(task.id, depId, allTasks)) {
      const depTask = allTasks[depId];
      errors.push(
        `Circular dependency detected with task "${depTask?.name || depId}"`
      );
    }
  }

  return errors;
}

/**
 * Gets all tasks that depend on a given task (downstream dependencies)
 *
 * @param taskId - The task to check
 * @param allTasks - All tasks in the system
 * @returns Array of task IDs that depend on this task
 */
export function getDependentTasks(
  taskId: string,
  allTasks: Record<string, Task>
): string[] {
  const dependents: string[] = [];

  Object.values(allTasks).forEach((task) => {
    if (task.dependsOn?.includes(taskId)) {
      dependents.push(task.id);
    }
  });

  return dependents;
}

/**
 * Removes a task from all dependency arrays when the task is deleted
 *
 * @param taskId - The task being deleted
 * @param allTasks - All tasks in the system
 * @returns Array of task IDs that need their dependsOn updated
 */
export function getTasksToUpdateOnDelete(
  taskId: string,
  allTasks: Record<string, Task>
): string[] {
  return getDependentTasks(taskId, allTasks);
}
