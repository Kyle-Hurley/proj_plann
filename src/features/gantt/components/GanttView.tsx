import { useEffect, useRef, useMemo } from 'react';
import Gantt from 'frappe-gantt';
import { useStore } from '@/store/store';
import { tasksToGanttTasks } from '../utils/ganttTransform';
import { format } from 'date-fns';
import type { Task } from '@/types/models';

interface GanttViewProps {
  onTaskClick?: (taskId: string) => void;
}

export function GanttView({ onTaskClick }: GanttViewProps) {
  const ganttRef = useRef<Gantt | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get state
  const tasksObject = useStore((state) => state.tasks);
  const selectedProjectId = useStore((state) => state.selectedProjectId);
  const projects = useStore((state) => state.projects);
  const viewMode = useStore((state) => state.viewMode);
  const editTask = useStore((state) => state.editTask);

  // Get current project
  const project = selectedProjectId ? projects[selectedProjectId] : undefined;

  // Convert tasks to array and filter by selected project
  const tasks = useMemo(() => {
    const allTasks = Object.values(tasksObject);
    if (!selectedProjectId) return [];
    return allTasks
      .filter((t) => t.projectId === selectedProjectId)
      .sort((a, b) => a.order - b.order);
  }, [tasksObject, selectedProjectId]);

  // Convert tasks to Gantt format
  const ganttTasks = useMemo(() => {
    const converted = tasksToGanttTasks(tasks, project);
    console.log('Tasks converted to Gantt format:', {
      totalTasks: tasks.length,
      convertedTasks: converted.length,
      tasks: converted
    });
    return converted;
  }, [tasks, project]);

  // Initialize Gantt ONCE on mount
  useEffect(() => {
    if (!containerRef.current || ganttTasks.length === 0) return;
    if (ganttRef.current) return; // Already initialized

    try {
      // Create new Gantt instance
      ganttRef.current = new Gantt('#gantt-container', ganttTasks, {
        header_height: 50,
        column_width: 30,
        step: 24,
        view_modes: ['Day', 'Week', 'Month', 'Year'],
        bar_height: 20,
        bar_corner_radius: 3,
        arrow_curve: 5,
        padding: 18,
        view_mode: viewMode,
        date_format: 'YYYY-MM-DD',
        popup_trigger: 'click',
        language: 'en',
        custom_popup_html: (task) => {
          const originalTask = tasks.find((t) => t.id === task.id);
          if (!originalTask) return task.name;

          return `
            <div class="gantt-popup">
              <h3>${task.name}</h3>
              <p><strong>Status:</strong> ${originalTask.status}</p>
              <p><strong>Priority:</strong> ${originalTask.priority}</p>
              <p><strong>Start:</strong> ${task.start}</p>
              <p><strong>End:</strong> ${task.end}</p>
              <p><strong>Progress:</strong> ${task.progress}%</p>
              ${originalTask.description ? `<p>${originalTask.description}</p>` : ''}
            </div>
          `;
        },
        on_click: (task) => {
          if (onTaskClick) {
            onTaskClick(task.id);
          }
        },
        on_date_change: (task, start, end) => {
          // User dragged or resized task
          editTask(task.id, {
            startDate: format(start, 'yyyy-MM-dd'),
            dueDate: format(end, 'yyyy-MM-dd'),
          });
        },
        on_progress_change: (task, progress) => {
          // Update task status based on progress
          let newStatus: Task['status'] = 'todo';
          if (progress === 100) newStatus = 'done';
          else if (progress > 0) newStatus = 'in-progress';

          editTask(task.id, { status: newStatus });
        },
        on_view_change: (mode) => {
          console.log('View changed to:', mode);
        },
      });

      console.log('Gantt chart initialized with', ganttTasks.length, 'tasks');
    } catch (error) {
      console.error('Error initializing Gantt:', error);
    }

    // Cleanup on unmount
    return () => {
      if (ganttRef.current) {
        ganttRef.current.clear();
        ganttRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ganttTasks.length]); // Only re-initialize if task count changes from 0 to >0

  // Update Gantt data when tasks change (but don't re-initialize)
  useEffect(() => {
    if (!ganttRef.current || ganttTasks.length === 0) return;

    try {
      ganttRef.current.refresh(ganttTasks);
      console.log('Gantt chart refreshed with', ganttTasks.length, 'tasks');
    } catch (error) {
      console.error('Error refreshing Gantt:', error);
    }
  }, [ganttTasks]);

  // Update Gantt when view mode changes
  useEffect(() => {
    if (ganttRef.current && viewMode) {
      try {
        ganttRef.current.change_view_mode(viewMode);
        console.log('Gantt view mode changed to:', viewMode);
      } catch (error) {
        console.error('Error changing view mode:', error);
      }
    }
  }, [viewMode]);

  // Empty state
  if (tasks.length === 0) {
    return (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks to display</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add tasks with dates to see them in the Gantt chart.
        </p>
      </div>
    );
  }

  return (
    <div className="gantt-wrapper">
      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 mb-4 text-sm">
        ℹ️ <strong>Note:</strong> Gantt view shows all tasks (filters apply to List view only).
        Drag tasks to reschedule, drag progress bars to update completion.
      </div>
      {/* Debug info */}
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-2 mb-2 text-xs text-gray-700">
        <strong>Debug:</strong> {tasks.length} tasks loaded, {ganttTasks.length} converted for Gantt
        {tasks.length > 0 && ganttTasks.length === 0 && (
          <span className="text-red-600 ml-2">⚠️ Tasks exist but conversion failed!</span>
        )}
      </div>
      <div ref={containerRef} id="gantt-container" className="bg-white border border-gray-200 rounded-lg overflow-auto"></div>
    </div>
  );
}
