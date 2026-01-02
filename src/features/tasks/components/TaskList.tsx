import { useState, useMemo } from 'react';
import { useStore, selectFilteredTasks } from '@/store/store';
import { TaskForm } from './TaskForm';
import { TaskItem } from './TaskItem';
import { GanttView } from '@/features/gantt/components/GanttView';
import { GanttToolbar } from '@/features/gantt/components/GanttToolbar';
import type { Task } from '@/types/models';

export function TaskList() {
  // Get state needed for filtering
  const tasksObject = useStore((state) => state.tasks);
  const filters = useStore((state) => state.filters);
  const selectedProjectId = useStore((state) => state.selectedProjectId);
  const isLoading = useStore((state) => state.isLoading);
  const error = useStore((state) => state.error);

  // Use filtered selector with memoization to prevent infinite re-renders
  const tasks = useMemo(
    () => selectFilteredTasks(useStore.getState()),
    [tasksObject, filters, selectedProjectId]
  );

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [activeView, setActiveView] = useState<'list' | 'gantt'>('list');

  const handleNewTask = () => {
    setEditingTask(undefined);
    setShowForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(undefined);
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-sm text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Header with View Toggle and Add Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Tasks
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({tasks.length})
            </span>
          </h2>
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setActiveView('list')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeView === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setActiveView('gantt')}
              className={`px-4 py-2 text-sm font-medium border-l border-gray-300 transition-colors ${
                activeView === 'gantt'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Gantt
            </button>
          </div>
        </div>
        <button
          onClick={handleNewTask}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Task
        </button>
      </div>

      {/* Task Form (shown when creating/editing) */}
      {showForm && (
        <TaskForm task={editingTask} onClose={handleCloseForm} />
      )}

      {/* View Content: List or Gantt */}
      {activeView === 'list' ? (
        /* Task List View */
        tasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new task.
            </p>
            <div className="mt-6">
              <button
                onClick={handleNewTask}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Task
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} onEdit={handleEditTask} />
            ))}
          </div>
        )
      ) : (
        /* Gantt View */
        <>
          <GanttToolbar />
          <GanttView onTaskClick={(taskId) => {
            const task = tasksObject[taskId];
            if (task) handleEditTask(task);
          }} />
        </>
      )}
    </div>
  );
}
