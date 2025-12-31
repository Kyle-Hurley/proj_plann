import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store/store';
import type { Phase } from '@/types/models';

interface PhaseFormProps {
  phase?: Phase;  // If provided, we're editing; otherwise creating
  onClose: () => void;
}

export function PhaseForm({ phase, onClose }: PhaseFormProps) {
  const { addPhase, editPhase, selectedProjectId, phases } = useStore();
  const isEditing = !!phase;

  // Form state
  const [name, setName] = useState(phase?.name || '');
  const [description, setDescription] = useState(phase?.description || '');
  const [startDate, setStartDate] = useState(
    phase?.startDate ? phase.startDate.split('T')[0] : ''
  );
  const [endDate, setEndDate] = useState(
    phase?.endDate ? phase.endDate.split('T')[0] : ''
  );
  const [parentPhaseId, setParentPhaseId] = useState(phase?.parentPhaseId || '');
  const [color, setColor] = useState(phase?.color || '#3B82F6');
  const [order, setOrder] = useState(phase?.order || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get parent phases (only phases without parents - enforce 2-level hierarchy)
  const parentPhases = useMemo(() => {
    if (!selectedProjectId) return [];
    return Object.values(phases)
      .filter((p) => p.projectId === selectedProjectId && !p.parentPhaseId)
      .filter((p) => !isEditing || p.id !== phase?.id) // Exclude self when editing
      .sort((a, b) => a.order - b.order);
  }, [phases, selectedProjectId, isEditing, phase]);

  // Update form when phase prop changes
  useEffect(() => {
    if (phase) {
      setName(phase.name);
      setDescription(phase.description || '');
      setStartDate(phase.startDate ? phase.startDate.split('T')[0] : '');
      setEndDate(phase.endDate ? phase.endDate.split('T')[0] : '');
      setParentPhaseId(phase.parentPhaseId || '');
      setColor(phase.color || '#3B82F6');
      setOrder(phase.order);
    }
  }, [phase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Phase name is required');
      return;
    }

    if (!selectedProjectId) {
      alert('No project selected');
      return;
    }

    // Validate date range
    if (endDate && startDate && endDate < startDate) {
      alert('End date must be after start date');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && phase) {
        // Update existing phase
        await editPhase(phase.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          startDate,
          endDate: endDate || undefined,
          parentPhaseId: parentPhaseId || undefined,
          color: color || undefined,
          order,
        });
      } else {
        // Create new phase
        await addPhase({
          projectId: selectedProjectId,
          name: name.trim(),
          description: description.trim() || undefined,
          startDate,
          endDate: endDate || undefined,
          parentPhaseId: parentPhaseId || undefined,
          color: color || undefined,
          order: order || Date.now(),
        });
      }

      // Close form on success
      onClose();
    } catch (error) {
      console.error('Error saving phase:', error);
      alert((error as Error).message || 'Failed to save phase. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">
        {isEditing ? 'Edit Phase' : 'New Phase'}
      </h4>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Phase Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-gray-700">
            Phase Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-1.5 border text-sm bg-white text-gray-900"
            placeholder="Enter phase name"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-xs font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-1.5 border text-sm bg-white text-gray-900"
            placeholder="Enter description (optional)"
            disabled={isSubmitting}
          />
        </div>

        {/* Parent Phase Dropdown */}
        <div>
          <label htmlFor="parentPhaseId" className="block text-xs font-medium text-gray-700">
            Parent Phase (Optional)
          </label>
          <select
            id="parentPhaseId"
            value={parentPhaseId}
            onChange={(e) => setParentPhaseId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-1.5 border text-sm bg-white text-gray-900"
            disabled={isSubmitting}
          >
            <option value="">None (Top-level phase)</option>
            {parentPhases.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Only top-level phases shown (2-level hierarchy limit)
          </p>
        </div>

        {/* Dates (side by side) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="startDate" className="block text-xs font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-1.5 border text-sm bg-white text-gray-900"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-xs font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-1.5 border text-sm bg-white text-gray-900"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Color */}
        <div>
          <label htmlFor="color" className="block text-xs font-medium text-gray-700">
            Color
          </label>
          <input
            type="color"
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 block w-full h-8 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
