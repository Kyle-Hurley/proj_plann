import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useStore } from '@/store/store';
import { TaskFilters } from './TaskFilters';

/**
 * Collapsible wrapper for TaskFilters component
 * Starts collapsed by default and shows active filter count
 */
export function FilterPanel() {
  const [isExpanded, setIsExpanded] = useLocalStorage('proj_plann:filters-expanded', false);
  const filters = useStore((state) => state.filters);

  // Count active filters
  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof typeof filters] !== undefined
  ).length;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
      {/* Header - Always visible, clickable to toggle */}
      <button
        onClick={toggleExpanded}
        className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        aria-expanded={isExpanded}
        aria-controls="filter-content"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {activeFilterCount}
            </span>
          )}
        </div>

        {/* Chevron icon - rotates based on expanded state */}
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Content - Collapsible */}
      <div
        id="filter-content"
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ overflow: isExpanded ? 'visible' : 'hidden' }}
      >
        <div className="px-5 pb-5">
          <TaskFilters />
        </div>
      </div>
    </div>
  );
}
