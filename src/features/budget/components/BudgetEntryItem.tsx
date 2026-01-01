import { useState } from 'react';
import { useStore } from '@/store/store';
import type { BudgetEntry } from '@/types/models';

interface BudgetEntryItemProps {
  entry: BudgetEntry;
  onEdit: (entry: BudgetEntry) => void;
}

export function BudgetEntryItem({ entry, onEdit }: BudgetEntryItemProps) {
  const { removeBudgetEntry, tasks, personnel } = useStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this budget entry?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await removeBudgetEntry(entry.id);
    } catch (error) {
      console.error('Error deleting budget entry:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete budget entry');
      setIsDeleting(false);
    }
  };

  // Category badge colors
  const categoryColors: Record<string, string> = {
    labor: 'bg-blue-100 text-blue-800',
    materials: 'bg-purple-100 text-purple-800',
    software: 'bg-green-100 text-green-800',
    other: 'bg-gray-100 text-gray-800',
  };

  // Calculate variance
  const variance = entry.estimatedCost - (entry.actualCost || 0);
  const hasActualCost = entry.actualCost !== undefined && entry.actualCost !== null;

  // Get task name if linked
  const taskName = entry.taskId ? tasks[entry.taskId]?.name : null;

  // Get personnel name if labor entry
  const personnelName = entry.personnelId ? personnel[entry.personnelId]?.name : null;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        {/* Budget Entry Content */}
        <div className="flex-1 min-w-0">
          {/* Category Badge */}
          <div className="mb-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                categoryColors[entry.category]
              }`}
            >
              {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
            </span>
          </div>

          {/* Description */}
          <h4 className="text-base font-medium text-gray-900">
            {entry.description}
          </h4>

          {/* Task Name */}
          {taskName && (
            <p className="mt-1 text-sm text-gray-600">
              Task: <span className="font-medium">{taskName}</span>
            </p>
          )}

          {/* Personnel & Hours (for labor entries) */}
          {entry.category === 'labor' && personnelName && (
            <p className="mt-0.5 text-sm text-gray-600">
              {personnelName}
              {entry.hours && ` • ${entry.hours}h`}
            </p>
          )}

          {/* Cost Information */}
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            <span className="text-gray-700">
              <span className="font-medium">Est:</span> ${entry.estimatedCost.toFixed(2)}
            </span>
            <span className="text-gray-700">
              <span className="font-medium">Act:</span>{' '}
              {hasActualCost ? `$${entry.actualCost!.toFixed(2)}` : '-'}
            </span>
            {hasActualCost && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  variance > 0
                    ? 'bg-green-100 text-green-800'
                    : variance < 0
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {variance > 0 ? 'Under' : variance < 0 ? 'Over' : 'On'} Budget: ${Math.abs(variance).toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="ml-4 flex-shrink-0 flex space-x-2">
          <button
            onClick={() => onEdit(entry)}
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
    </div>
  );
}
