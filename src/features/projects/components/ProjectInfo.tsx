import { useState } from 'react';
import { useStore } from '@/store/store';
import { ProjectForm } from './ProjectForm';

export function ProjectInfo() {
  const selectedProjectId = useStore((state) => state.selectedProjectId);
  const project = useStore((state) =>
    selectedProjectId ? state.projects[selectedProjectId] : undefined
  );
  const [isEditing, setIsEditing] = useState(false);

  // Show form when editing or creating new project
  if (isEditing) {
    return <ProjectForm project={project} onClose={() => setIsEditing(false)} />;
  }

  // No project exists - show create prompt
  if (!project) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800 mb-3">
          No project selected. Create a new project or import an existing one.
        </p>
        <button
          onClick={() => setIsEditing(true)}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create New Project
        </button>
      </div>
    );
  }

  // Status badge colors
  const statusColors = {
    planning: 'bg-gray-100 text-gray-800',
    active: 'bg-blue-100 text-blue-800',
    'on-hold': 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">
            {project.name}
          </h2>
          {project.description && (
            <p className="mt-1 text-sm text-gray-600">{project.description}</p>
          )}
          <div className="mt-3 space-y-1">
            <div className="flex gap-4 text-sm text-gray-500">
              <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
              {project.endDate && (
                <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
              )}
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[project.status]}`}>
              {project.status}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
