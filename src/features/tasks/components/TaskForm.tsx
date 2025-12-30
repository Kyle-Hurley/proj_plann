import { useState, useEffect } from 'react';
import { useStore } from '@/store/store';
import { TASK_STATUSES, TASK_PRIORITIES, type Task, type TaskStatus, type TaskPriority } from '@/types/models';

interface TaskFormProps {
  task?: Task;  // If provided, we're editing; otherwise creating
  onClose: () => void;
}

export function TaskForm({ task, onClose }: TaskFormProps) {
  const { addTask, editTask } = useStore();
  const isEditing = !!task;

  // Form state
  const [name, setName] = useState(task?.name || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'todo');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when task prop changes
  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Task name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && task) {
        // Update existing task
        await editTask(task.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          status,
          priority,
        });
      } else {
        // Create new task
        await addTask({
          name: name.trim(),
          description: description.trim() || undefined,
          status,
          priority,
          projectId: 'default', // TODO: Replace with actual project selection
          order: Date.now(), // Simple ordering by creation time
        });
      }

      // Close form on success
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {isEditing ? 'Edit Task' : 'New Task'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Task Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
            placeholder="Enter task name"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
            placeholder="Enter task description (optional)"
            disabled={isSubmitting}
          />
        </div>

        {/* Status and Priority (side by side) */}
        <div className="grid grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              disabled={isSubmitting}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              disabled={isSubmitting}
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
