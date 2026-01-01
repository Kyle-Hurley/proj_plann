import { useState, useEffect, useMemo } from 'react';
import { useStore, selectActivePersonnel } from '@/store/store';
import type { Task } from '@/types/models';

interface PersonnelAssignmentModalProps {
  task: Task;
  onClose: () => void;
}

export function PersonnelAssignmentModal({ task, onClose }: PersonnelAssignmentModalProps) {
  const { editTask } = useStore();
  const personnelObject = useStore((state) => state.personnel);

  // Get active personnel using memoization
  const activePersonnel = useMemo(
    () => selectActivePersonnel(useStore.getState()),
    [personnelObject]
  );

  // Track selected personnel IDs
  const [selectedIds, setSelectedIds] = useState<string[]>(task.assignedTo || []);
  const [isSaving, setIsSaving] = useState(false);

  // Update when task changes
  useEffect(() => {
    setSelectedIds(task.assignedTo || []);
  }, [task]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleToggle = (personnelId: string) => {
    setSelectedIds(prev =>
      prev.includes(personnelId)
        ? prev.filter(id => id !== personnelId)
        : [...prev, personnelId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await editTask(task.id, {
        assignedTo: selectedIds.length > 0 ? selectedIds : undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error assigning personnel:', error);
      alert(error instanceof Error ? error.message : 'Failed to assign personnel');
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      aria-labelledby="assignment-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-5 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div>
          <h2
            id="assignment-modal-title"
            className="text-xl font-bold text-gray-900"
          >
            Assign People
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Task: <span className="font-medium">{task.name}</span>
          </p>
        </div>

        {/* Personnel List */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            Select team members to assign to this task:
          </p>

          {activePersonnel.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm text-gray-500">No active personnel available</p>
              <p className="text-xs text-gray-400 mt-1">
                Add personnel first to assign them to tasks
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
              {activePersonnel.map((person) => {
                const isSelected = selectedIds.includes(person.id);
                return (
                  <label
                    key={person.id}
                    className={`flex items-start p-3 rounded-md cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(person.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                    />
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {person.name}
                      </div>
                      {person.role && (
                        <div className="text-xs text-gray-600 mt-0.5">
                          {person.role}
                        </div>
                      )}
                      {person.hourlyRate && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          ${person.hourlyRate.toFixed(2)}/hr
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {/* Selection Summary */}
          <p className="mt-3 text-xs text-gray-600">
            {selectedIds.length === 0
              ? 'No personnel selected'
              : `${selectedIds.length} ${selectedIds.length === 1 ? 'person' : 'people'} selected`}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Assignments'}
          </button>
        </div>
      </div>
    </div>
  );
}
