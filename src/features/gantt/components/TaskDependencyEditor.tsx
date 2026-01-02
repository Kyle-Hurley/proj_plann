import { useState } from 'react';
import { useStore } from '@/store/store';
import type { Task } from '@/types/models';

interface TaskDependencyEditorProps {
  task: Task;
}

export function TaskDependencyEditor({ task }: TaskDependencyEditorProps) {
  const tasks = useStore((state) => state.tasks);
  const addTaskDependency = useStore((state) => state.addTaskDependency);
  const removeTaskDependency = useStore((state) => state.removeTaskDependency);

  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Get all tasks in the same project (excluding current task)
  const availableTasks = Object.values(tasks).filter(
    (t) => t.projectId === task.projectId && t.id !== task.id
  );

  // Get current dependencies as Task objects
  const currentDependencies = (task.dependsOn || [])
    .map((depId) => tasks[depId])
    .filter(Boolean); // Remove any null/undefined (deleted tasks)

  // Get tasks that are not already dependencies
  const selectableTasks = availableTasks.filter(
    (t) => !task.dependsOn?.includes(t.id)
  );

  const handleAddDependency = async () => {
    if (!selectedTaskId) return;

    setError(null);
    setIsAdding(true);

    try {
      await addTaskDependency(task.id, selectedTaskId);
      setSelectedTaskId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add dependency');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveDependency = async (dependsOnId: string) => {
    setError(null);
    try {
      await removeTaskDependency(task.id, dependsOnId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove dependency');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Dependencies
          </label>
          <p className="text-xs text-gray-500 mt-1">
            This task depends on (must wait for):
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-2 text-sm">
          {error}
        </div>
      )}

      {/* Current Dependencies List */}
      {currentDependencies.length > 0 && (
        <div className="space-y-2">
          {currentDependencies.map((dep) => (
            <div
              key={dep.id}
              className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{dep.name}</p>
                <p className="text-xs text-gray-500">
                  {dep.status} • {dep.priority} priority
                </p>
              </div>
              <button
                onClick={() => handleRemoveDependency(dep.id)}
                className="ml-2 text-red-600 hover:text-red-800 transition-colors"
                title="Remove dependency"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Dependency */}
      {selectableTasks.length > 0 ? (
        <div className="flex gap-2">
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a task...</option>
            {selectableTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.status})
              </option>
            ))}
          </select>
          <button
            onClick={handleAddDependency}
            disabled={!selectedTaskId || isAdding}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
      ) : currentDependencies.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          No other tasks available to add as dependencies.
        </p>
      ) : null}

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        💡 Dependencies create a relationship where this task cannot start until the
        selected tasks are complete. They will appear as arrows in the Gantt chart.
      </p>
    </div>
  );
}
