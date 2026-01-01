import { useState } from 'react';
import { useStore } from '@/store/store';
import type { Personnel } from '@/types/models';

interface PersonnelItemProps {
  personnel: Personnel;
  onEdit: (personnel: Personnel) => void;
}

export function PersonnelItem({ personnel, onEdit }: PersonnelItemProps) {
  const { removePersonnel } = useStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${personnel.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await removePersonnel(personnel.id);
    } catch (error) {
      console.error('Error deleting personnel:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete personnel');
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        {/* Personnel Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-medium text-gray-900 truncate">
            {personnel.name}
          </h4>

          {/* Role */}
          {personnel.role && (
            <p className="mt-1 text-sm text-gray-600">
              {personnel.role}
            </p>
          )}

          {/* Email */}
          {personnel.email && (
            <p className="mt-0.5 text-xs text-gray-500">
              {personnel.email}
            </p>
          )}

          {/* Hourly Rate & Availability */}
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
            {personnel.hourlyRate && (
              <span className="inline-flex items-center">
                <span className="font-medium">Rate:</span>
                <span className="ml-1">${personnel.hourlyRate.toFixed(2)}/hr</span>
              </span>
            )}
            {personnel.availability && (
              <span className="inline-flex items-center">
                <span className="font-medium">Availability:</span>
                <span className="ml-1">{personnel.availability}h/week</span>
              </span>
            )}
          </div>

          {/* Active/Inactive Badge */}
          <div className="mt-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                personnel.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {personnel.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="ml-4 flex-shrink-0 flex space-x-2">
          <button
            onClick={() => onEdit(personnel)}
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
