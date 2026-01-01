import { useMemo, useState } from 'react';
import { useStore, selectProjectBudgetEntries } from '@/store/store';
import { BudgetEntryItem } from './BudgetEntryItem';
import { BudgetEntryForm } from './BudgetEntryForm';
import { BUDGET_CATEGORIES, type BudgetEntry, type BudgetCategory } from '@/types/models';

export function BudgetList() {
  const budgetEntriesObject = useStore((state) => state.budgetEntries);
  const selectedProjectId = useStore((state) => state.selectedProjectId);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BudgetEntry | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<BudgetCategory | 'all'>('all');

  // Get project budget entries using memoization
  const projectEntries = useMemo(
    () => selectProjectBudgetEntries(useStore.getState()),
    [budgetEntriesObject, selectedProjectId]
  );

  // Filter by category
  const filteredEntries = useMemo(() => {
    if (categoryFilter === 'all') return projectEntries;
    return projectEntries.filter(e => e.category === categoryFilter);
  }, [projectEntries, categoryFilter]);

  // Don't show if no project selected
  if (!selectedProjectId) {
    return null;
  }

  const handleEdit = (entry: BudgetEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEntry(undefined);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Budget Entries ({filteredEntries.length})
        </h3>
        <button
          onClick={() => {
            setEditingEntry(undefined);
            setShowForm(true);
          }}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          + Add Entry
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <BudgetEntryForm entry={editingEntry} onClose={handleCloseForm} />
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            categoryFilter === 'all'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
          }`}
        >
          All ({projectEntries.length})
        </button>
        {BUDGET_CATEGORIES.map((cat) => {
          const count = projectEntries.filter(e => e.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                categoryFilter === cat
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 mb-2">
            {projectEntries.length === 0
              ? 'No budget entries yet'
              : `No ${categoryFilter} entries`}
          </p>
          <p className="text-xs text-gray-400">
            {projectEntries.length === 0
              ? 'Click "Add Entry" to create your first budget entry'
              : 'Try selecting a different category'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <BudgetEntryItem key={entry.id} entry={entry} onEdit={handleEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
