import { useState } from 'react';
import { useStore } from '@/store/store';
import type { Task } from '@/types/models';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const { removeTask } = useStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${task.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await removeTask(task.id);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
      setIsDeleting(false);
    }
  };

  // Status badge colors
  const statusColors: Record<string, string> = {
    'todo': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'blocked': 'bg-red-100 text-red-800',
    'done': 'bg-green-100 text-green-800',
    'cancelled': 'bg-gray-100 text-gray-500',
  };

  // Priority badge colors
  const priorityColors: Record<string, string> = {
    'low': 'bg-gray-100 text-gray-600',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800',
    'critical': 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {task.name}
          </h3>
          {task.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Badges */}
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
              {task.status}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="ml-4 flex-shrink-0 flex space-x-2">
          <button
            onClick={() => onEdit(task)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            disabled={isDeleting}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Metadata (timestamps) */}
      <div className="mt-3 text-xs text-gray-500">
        Created: {new Date(task.createdAt).toLocaleDateString()} at {new Date(task.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
}
