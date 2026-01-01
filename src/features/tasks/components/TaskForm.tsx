import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store/store';
import { TASK_STATUSES, TASK_PRIORITIES, type Task, type TaskStatus, type TaskPriority } from '@/types/models';

interface TaskFormProps {
  task?: Task;  // If provided, we're editing; otherwise creating
  onClose: () => void;
}

export function TaskForm({ task, onClose }: TaskFormProps) {
  const { addTask, editTask, selectedProjectId, phases, personnel } = useStore();
  const isEditing = !!task;

  // Form state
  const [name, setName] = useState(task?.name || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'todo');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [phaseId, setPhaseId] = useState<string | undefined>(task?.phaseId);
  const [startDate, setStartDate] = useState(
    task?.startDate ? task.startDate.split('T')[0] : ''
  );
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? task.dueDate.split('T')[0] : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get all phases (both parent and child) organized hierarchically for dropdown
  const phasesHierarchy = useMemo(() => {
    if (!selectedProjectId) return { parents: [], children: {} };

    const allPhases = Object.values(phases).filter((p) => p.projectId === selectedProjectId);
    const parents = allPhases.filter((p) => !p.parentPhaseId).sort((a, b) => a.order - b.order);
    const childrenByParent: Record<string, typeof allPhases> = {};

    allPhases.forEach((p) => {
      if (p.parentPhaseId) {
        if (!childrenByParent[p.parentPhaseId]) {
          childrenByParent[p.parentPhaseId] = [];
        }
        childrenByParent[p.parentPhaseId].push(p);
      }
    });

    // Sort children
    Object.keys(childrenByParent).forEach((parentId) => {
      childrenByParent[parentId].sort((a, b) => a.order - b.order);
    });

    return { parents, children: childrenByParent };
  }, [phases, selectedProjectId]);

  // Update form when task prop changes
  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setPhaseId(task.phaseId);
      setStartDate(task.startDate ? task.startDate.split('T')[0] : '');
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Task name is required');
      return;
    }

    // Validate date range
    if (dueDate && startDate && dueDate < startDate) {
      alert('Due date must be after start date');
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
          phaseId: phaseId || undefined,
          startDate: startDate || undefined,
          dueDate: dueDate || undefined,
        });
      } else {
        // Create new task
        await addTask({
          name: name.trim(),
          description: description.trim() || undefined,
          status,
          priority,
          projectId: selectedProjectId || 'default', // Use selected project or fallback to default
          phaseId: phaseId || undefined,
          startDate: startDate || undefined,
          dueDate: dueDate || undefined,
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white text-gray-900"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white text-gray-900"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white text-gray-900"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white text-gray-900"
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

        {/* Phase */}
        <div>
          <label htmlFor="phaseId" className="block text-sm font-medium text-gray-700">
            Phase (Optional)
          </label>
          <select
            id="phaseId"
            value={phaseId || ''}
            onChange={(e) => setPhaseId(e.target.value || undefined)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white text-gray-900"
            disabled={isSubmitting}
          >
            <option value="">None (Unassigned)</option>
            {phasesHierarchy.parents.map((parent) => (
              <React.Fragment key={parent.id}>
                {/* Parent phase */}
                <option value={parent.id}>
                  {parent.name}
                </option>
                {/* Child phases indented */}
                {phasesHierarchy.children[parent.id]?.map((child) => (
                  <option key={child.id} value={child.id}>
                    {'  '}→ {child.name}
                  </option>
                ))}
              </React.Fragment>
            ))}
          </select>
        </div>

        {/* Assigned Personnel (Read-Only Display) */}
        {isEditing && task && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Personnel
                </label>
                {!task.assignedTo || task.assignedTo.length === 0 ? (
                  <p className="text-sm text-gray-500">No personnel assigned</p>
                ) : (
                  <div className="space-y-1">
                    {task.assignedTo.map((personnelId) => {
                      const person = personnel[personnelId];
                      return person ? (
                        <div key={personnelId} className="text-sm text-gray-700">
                          • {person.name}
                          {person.role && <span className="text-gray-500"> ({person.role})</span>}
                        </div>
                      ) : (
                        <div key={personnelId} className="text-sm text-gray-400 italic">
                          • Unknown personnel (ID: {personnelId})
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-blue-600">
              Use the "Assign People" button in the task card to manage assignments
            </p>
          </div>
        )}

        {/* Dates (side by side) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white text-gray-900"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white text-gray-900"
              disabled={isSubmitting}
            />
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
