import { useStore } from '@/store/store';
import type { ViewMode } from 'frappe-gantt';

export function GanttToolbar() {
  const viewMode = useStore((state) => state.viewMode);
  const setViewMode = useStore((state) => state.setViewMode);

  const viewModes: ViewMode[] = ['Day', 'Week', 'Month', 'Year'];

  return (
    <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Zoom:</span>
        <div className="flex border border-gray-300 rounded-md overflow-hidden">
          {viewModes.map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } ${mode !== viewModes[0] ? 'border-l border-gray-300' : ''}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <span className="font-medium">Tip:</span> Drag tasks to reschedule • Drag edges to resize • Click for details
      </div>
    </div>
  );
}
