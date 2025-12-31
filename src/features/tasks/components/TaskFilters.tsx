import { useStore } from '@/store/store';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/types/models';

export function TaskFilters() {
  const filters = useStore((state) => state.filters);
  const { setFilter, clearFilters } = useStore();

  const hasActiveFilters = Object.keys(filters).some(
    (key) => filters[key as keyof typeof filters] !== undefined
  );

  return (
    <div className="space-y-4 pt-4">
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Search */}
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
          Search
        </label>
        <input
          type="text"
          id="search"
          value={filters.searchText || ''}
          onChange={(e) => setFilter('searchText', e.target.value || undefined)}
          placeholder="Search tasks..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white text-gray-900"
        />
      </div>

      {/* Status Filter */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          value={filters.status || ''}
          onChange={(e) => setFilter('status', e.target.value || undefined)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white text-gray-900"
        >
          <option value="">All Statuses</option>
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Priority Filter */}
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
          Priority
        </label>
        <select
          id="priority"
          value={filters.priority || ''}
          onChange={(e) => setFilter('priority', e.target.value || undefined)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white text-gray-900"
        >
          <option value="">All Priorities</option>
          {TASK_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range Filters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Start Date Range
        </label>
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="startFrom" className="block text-xs text-gray-600">
                From
              </label>
              {filters.startDateFrom && (
                <button
                  onClick={() => setFilter('startDateFrom', undefined)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              )}
            </div>
            <input
              type="date"
              id="startFrom"
              value={filters.startDateFrom || ''}
              onChange={(e) => setFilter('startDateFrom', e.target.value || undefined)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-1.5 border bg-white text-gray-900"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="startTo" className="block text-xs text-gray-600">
                To
              </label>
              {filters.startDateTo && (
                <button
                  onClick={() => setFilter('startDateTo', undefined)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              )}
            </div>
            <input
              type="date"
              id="startTo"
              value={filters.startDateTo || ''}
              onChange={(e) => setFilter('startDateTo', e.target.value || undefined)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-1.5 border bg-white text-gray-900"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Due Date Range
        </label>
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="dueFrom" className="block text-xs text-gray-600">
                From
              </label>
              {filters.dueDateFrom && (
                <button
                  onClick={() => setFilter('dueDateFrom', undefined)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              )}
            </div>
            <input
              type="date"
              id="dueFrom"
              value={filters.dueDateFrom || ''}
              onChange={(e) => setFilter('dueDateFrom', e.target.value || undefined)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-1.5 border bg-white text-gray-900"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="dueTo" className="block text-xs text-gray-600">
                To
              </label>
              {filters.dueDateTo && (
                <button
                  onClick={() => setFilter('dueDateTo', undefined)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              )}
            </div>
            <input
              type="date"
              id="dueTo"
              value={filters.dueDateTo || ''}
              onChange={(e) => setFilter('dueDateTo', e.target.value || undefined)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-1.5 border bg-white text-gray-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
