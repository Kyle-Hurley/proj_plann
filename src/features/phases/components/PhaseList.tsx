import { useMemo, useState } from 'react';
import { useStore, selectPhasesHierarchy } from '@/store/store';
import { PhaseItem } from './PhaseItem';
import { PhaseForm } from './PhaseForm';

export function PhaseList() {
  const phasesData = useStore((state) => state.phases);
  const selectedProjectId = useStore((state) => state.selectedProjectId);
  const [showForm, setShowForm] = useState(false);
  const [editingPhase, setEditingPhase] = useState<any>(undefined);

  // Use selector to get hierarchy (must memoize to prevent infinite re-renders)
  const hierarchy = useMemo(
    () => selectPhasesHierarchy(useStore.getState()),
    [phasesData, selectedProjectId]
  );

  const { parents, children } = hierarchy;

  if (!selectedProjectId) {
    return null; // Don't show phases if no project selected
  }

  const handleEdit = (phase: any) => {
    setEditingPhase(phase);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPhase(undefined);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Phases</h3>
        <button
          onClick={() => {
            setEditingPhase(undefined);
            setShowForm(true);
          }}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          + Add Phase
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <PhaseForm phase={editingPhase} onClose={handleCloseForm} />
        </div>
      )}

      {parents.length === 0 ? (
        <p className="text-sm text-gray-500">No phases defined</p>
      ) : (
        <div className="space-y-1">
          {parents.map((parent) => (
            <div key={parent.id}>
              {/* Parent phase as section header */}
              <PhaseItem phase={parent} isParent onEdit={handleEdit} />

              {/* Child phases indented */}
              {children[parent.id]?.map((child) => (
                <PhaseItem key={child.id} phase={child} isParent={false} onEdit={handleEdit} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
