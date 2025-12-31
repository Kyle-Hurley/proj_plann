import { useState, useEffect } from 'react';
import { useStore } from '@/store/store';
import { PROJECT_STATUSES, type Project, type ProjectStatus } from '@/types/models';

interface ProjectFormProps {
  project?: Project;  // If provided, we're editing; otherwise creating
  onClose: () => void;
}

export function ProjectForm({ project, onClose }: ProjectFormProps) {
  const { addProject, editProject } = useStore();
  const isEditing = !!project;

  // Form state
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [startDate, setStartDate] = useState(
    project?.startDate ? project.startDate.split('T')[0] : ''
  );
  const [endDate, setEndDate] = useState(
    project?.endDate ? project.endDate.split('T')[0] : ''
  );
  const [status, setStatus] = useState<ProjectStatus>(project?.status || 'planning');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when project prop changes
  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setStartDate(project.startDate ? project.startDate.split('T')[0] : '');
      setEndDate(project.endDate ? project.endDate.split('T')[0] : '');
      setStatus(project.status);
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Project name is required');
      return;
    }

    if (!startDate) {
      alert('Start date is required');
      return;
    }

    // Validate date range
    if (endDate && startDate && endDate < startDate) {
      alert('End date must be after start date');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && project) {
        // Update existing project
        await editProject(project.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          startDate,
          endDate: endDate || undefined,
          status,
        });
      } else {
        // Create new project
        const projectId = await addProject({
          name: name.trim(),
          description: description.trim() || undefined,
          startDate,
          endDate: endDate || undefined,
          status,
        });

        // Set newly created project as selected
        useStore.getState().setSelectedProject(projectId);
      }

      // Close form on success
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {isEditing ? 'Edit Project' : 'New Project'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Project Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white text-gray-900"
            placeholder="Enter project name"
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
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white text-gray-900"
            placeholder="Enter project description (optional)"
            disabled={isSubmitting}
          />
        </div>

        {/* Dates (side by side) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date *
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white text-gray-900"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white text-gray-900"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white text-gray-900"
            disabled={isSubmitting}
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-2">
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
