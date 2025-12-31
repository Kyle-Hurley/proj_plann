import { useState } from 'react';
import { useStore } from '@/store/store';
import type { Phase } from '@/types/models';

interface PhaseItemProps {
  phase: Phase;
  isParent: boolean;
  onEdit: (phase: Phase) => void;
}

export function PhaseItem({ phase, isParent, onEdit }: PhaseItemProps) {
  const selectedPhaseId = useStore((state) => state.filters.phaseId);
  const { setPhaseFilter, removePhase } = useStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const isSelected = selectedPhaseId === phase.id;

  const handleClick = () => {
    // Toggle filter: if already selected, clear filter; otherwise set filter
    if (isSelected) {
      setPhaseFilter(undefined);
    } else {
      setPhaseFilter(phase.id);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering phase filter

    if (!confirm(`Are you sure you want to delete phase "${phase.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await removePhase(phase.id);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering phase filter
    onEdit(phase);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        cursor-pointer px-3 py-2 rounded flex items-center justify-between group
        ${!isParent ? 'ml-6' : ''}
        ${isSelected ? 'bg-blue-100 text-blue-900' : 'text-gray-900 hover:bg-gray-100'}
        ${isParent ? 'font-semibold' : 'text-sm'}
      `}
    >
      <div className="flex items-center gap-2 flex-1">
        <span>{phase.name}</span>
        {phase.color && (
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: phase.color }}
          />
        )}
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleEdit}
          className={`text-xs font-medium transition-colors ${
            isSelected
              ? 'text-gray-700 hover:text-gray-900'
              : 'text-blue-600 hover:text-blue-800'
          }`}
          title="Edit phase"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
          title="Delete phase"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
