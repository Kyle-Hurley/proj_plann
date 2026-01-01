import React, { useState, useEffect, useMemo } from 'react';
import { useStore, selectActivePersonnel } from '@/store/store';
import { BUDGET_CATEGORIES, type BudgetEntry, type BudgetCategory } from '@/types/models';

interface BudgetEntryFormProps {
  entry?: BudgetEntry;  // If provided, we're editing; otherwise creating
  onClose: () => void;
}

export function BudgetEntryForm({ entry, onClose }: BudgetEntryFormProps) {
  // Use separate useStore calls to avoid creating new object references
  const addBudgetEntry = useStore((state) => state.addBudgetEntry);
  const editBudgetEntry = useStore((state) => state.editBudgetEntry);
  const selectedProjectId = useStore((state) => state.selectedProjectId);
  const tasks = useStore((state) => state.tasks);
  const personnelObject = useStore((state) => state.personnel);

  const isEditing = !!entry;

  // Form state
  const [category, setCategory] = useState<BudgetCategory>(entry?.category || 'labor');
  const [description, setDescription] = useState(entry?.description || '');
  const [taskId, setTaskId] = useState<string | undefined>(entry?.taskId);
  const [personnelId, setPersonnelId] = useState<string | undefined>(entry?.personnelId);
  const [hours, setHours] = useState(entry?.hours?.toString() || '');
  const [estimatedCost, setEstimatedCost] = useState(entry?.estimatedCost.toString() || '');
  const [actualCost, setActualCost] = useState(entry?.actualCost?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get active personnel using memoization
  const activePersonnel = useMemo(
    () => selectActivePersonnel(useStore.getState()),
    [personnelObject]
  );

  // Get project tasks
  const projectTasks = useMemo(() => {
    if (!selectedProjectId) return [];
    return Object.values(tasks)
      .filter(t => t.projectId === selectedProjectId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks, selectedProjectId]);

  // Update form when entry prop changes
  useEffect(() => {
    if (entry) {
      setCategory(entry.category);
      setDescription(entry.description);
      setTaskId(entry.taskId);
      setPersonnelId(entry.personnelId);
      setHours(entry.hours?.toString() || '');
      setEstimatedCost(entry.estimatedCost.toString());
      setActualCost(entry.actualCost?.toString() || '');
    }
  }, [entry]);

  // Auto-calculate labor cost when personnel or hours change
  useEffect(() => {
    if (category === 'labor' && personnelId && hours) {
      const hoursNum = parseFloat(hours);
      if (!isNaN(hoursNum) && hoursNum > 0) {
        const personnel = personnelObject[personnelId];
        if (personnel?.hourlyRate) {
          const calculated = (personnel.hourlyRate * hoursNum).toFixed(2);
          setEstimatedCost(calculated);
        }
      }
    }
  }, [category, personnelId, hours, personnelObject]);

  // Reset labor-specific fields when category changes
  useEffect(() => {
    if (category !== 'labor') {
      setPersonnelId(undefined);
      setHours('');
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      alert('Description is required');
      return;
    }

    // Validate labor entries
    if (category === 'labor') {
      if (!personnelId) {
        alert('Personnel is required for labor entries');
        return;
      }
      const hoursNum = hours ? parseFloat(hours) : undefined;
      if (!hours || isNaN(hoursNum!) || hoursNum! <= 0) {
        alert('Hours must be a positive number for labor entries');
        return;
      }
    }

    // Validate estimated cost
    const estimatedCostNum = parseFloat(estimatedCost);
    if (isNaN(estimatedCostNum) || estimatedCostNum <= 0) {
      alert('Estimated cost must be a positive number');
      return;
    }

    // Validate actual cost if provided
    const actualCostNum = actualCost ? parseFloat(actualCost) : undefined;
    if (actualCost && (isNaN(actualCostNum!) || actualCostNum! < 0)) {
      alert('Actual cost must be a non-negative number');
      return;
    }

    setIsSubmitting(true);

    try {
      const entryData = {
        category,
        description: description.trim(),
        projectId: selectedProjectId || 'default',
        taskId: taskId || undefined,
        personnelId: category === 'labor' ? personnelId : undefined,
        hours: category === 'labor' && hours ? parseFloat(hours) : undefined,
        estimatedCost: estimatedCostNum,
        actualCost: actualCostNum,
      };

      if (isEditing && entry) {
        // Update existing entry
        await editBudgetEntry(entry.id, entryData);
      } else {
        // Create new entry
        await addBudgetEntry(entryData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving budget entry:', error);
      alert(error instanceof Error ? error.message : 'Failed to save budget entry');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-300 rounded-lg p-5 mb-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {isEditing ? 'Edit Budget Entry' : 'Add Budget Entry'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category - Required */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as BudgetCategory)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
            required
          >
            {BUDGET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Description - Required */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
            placeholder="Describe this budget entry"
            rows={2}
            required
          />
        </div>

        {/* Task - Optional */}
        <div>
          <label htmlFor="taskId" className="block text-sm font-medium text-gray-700 mb-1">
            Linked Task (Optional)
          </label>
          <select
            id="taskId"
            value={taskId || ''}
            onChange={(e) => setTaskId(e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">None</option>
            {projectTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
        </div>

        {/* Labor-specific fields */}
        {category === 'labor' && (
          <>
            {/* Personnel - Required for labor */}
            <div>
              <label htmlFor="personnelId" className="block text-sm font-medium text-gray-700 mb-1">
                Personnel <span className="text-red-500">*</span>
              </label>
              <select
                id="personnelId"
                value={personnelId || ''}
                onChange={(e) => setPersonnelId(e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select personnel</option>
                {activePersonnel.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                    {person.hourlyRate && ` ($${person.hourlyRate.toFixed(2)}/hr)`}
                  </option>
                ))}
              </select>
            </div>

            {/* Hours - Required for labor */}
            <div>
              <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
                Hours <span className="text-red-500">*</span>
              </label>
              <input
                id="hours"
                type="number"
                step="0.5"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                placeholder="40"
                required
              />
            </div>
          </>
        )}

        {/* Estimated Cost - Required */}
        <div>
          <label htmlFor="estimatedCost" className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Cost ($) <span className="text-red-500">*</span>
            {category === 'labor' && personnelId && hours && (
              <span className="text-xs text-blue-600 ml-2">(Auto-calculated)</span>
            )}
          </label>
          <input
            id="estimatedCost"
            type="number"
            step="0.01"
            min="0"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
            placeholder="1000.00"
            required
          />
        </div>

        {/* Actual Cost - Optional */}
        <div>
          <label htmlFor="actualCost" className="block text-sm font-medium text-gray-700 mb-1">
            Actual Cost ($)
          </label>
          <input
            id="actualCost"
            type="number"
            step="0.01"
            min="0"
            value={actualCost}
            onChange={(e) => setActualCost(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
            placeholder="950.00"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
