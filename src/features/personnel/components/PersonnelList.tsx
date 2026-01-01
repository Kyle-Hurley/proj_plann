import { useMemo, useState } from 'react';
import { useStore } from '@/store/store';
import { PersonnelItem } from './PersonnelItem';
import { PersonnelForm } from './PersonnelForm';
import type { Personnel } from '@/types/models';

export function PersonnelList() {
  const personnelObject = useStore((state) => state.personnel);
  const [showForm, setShowForm] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | undefined>(undefined);

  // Use useMemo to prevent infinite re-renders
  const personnel = useMemo(
    () => Object.values(personnelObject).sort((a, b) => a.name.localeCompare(b.name)),
    [personnelObject]
  );

  // Count active and total personnel
  const activeCount = personnel.filter(p => p.isActive).length;
  const totalCount = personnel.length;

  const handleEdit = (person: Personnel) => {
    setEditingPersonnel(person);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPersonnel(undefined);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Personnel ({activeCount}/{totalCount})
        </h3>
        <button
          onClick={() => {
            setEditingPersonnel(undefined);
            setShowForm(true);
          }}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          + Add Personnel
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <PersonnelForm personnel={editingPersonnel} onClose={handleCloseForm} />
        </div>
      )}

      {personnel.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 mb-2">No personnel added yet</p>
          <p className="text-xs text-gray-400">
            Click "Add Personnel" to add team members
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {personnel.map((person) => (
            <PersonnelItem key={person.id} personnel={person} onEdit={handleEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
