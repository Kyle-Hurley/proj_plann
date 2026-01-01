import { useState, useMemo } from 'react';
import { useStore, selectProjectBudgetSummary } from '@/store/store';
import { BUDGET_CATEGORIES } from '@/types/models';

export function BudgetSummary() {
  const budgetEntriesObject = useStore((state) => state.budgetEntries);
  const selectedProjectId = useStore((state) => state.selectedProjectId);
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate summary using memoization
  const summary = useMemo(
    () => selectProjectBudgetSummary(useStore.getState()),
    [budgetEntriesObject, selectedProjectId]
  );

  if (!selectedProjectId) return null;

  // Determine overall budget status
  const isOverBudget = summary.totalVariancePercent < -10;
  const isNearBudget = summary.totalVariancePercent < -5 && !isOverBudget;
  const hasActualCosts = summary.totalActual > 0;

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-gray-900">Budget Overview</h4>
          {hasActualCosts && (
            <>
              {isOverBudget && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  ⚠️ Over Budget
                </span>
              )}
              {isNearBudget && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  ⚠ Near Limit
                </span>
              )}
              {!isOverBudget && !isNearBudget && summary.totalVariance > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  ✓ On Track
                </span>
              )}
            </>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {/* Total Budget */}
          <div className="bg-gray-50 rounded-md p-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">Total Budget</span>
              <span className="font-semibold text-gray-900">
                ${summary.totalEstimated.toFixed(2)}
              </span>
            </div>
            {hasActualCosts && (
              <>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Actual Spent</span>
                  <span className="text-gray-900">${summary.totalActual.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Variance</span>
                  <span
                    className={`font-medium ${
                      summary.totalVariance > 0
                        ? 'text-green-700'
                        : summary.totalVariance < 0
                        ? 'text-red-700'
                        : 'text-gray-700'
                    }`}
                  >
                    {summary.totalVariance > 0 ? '+' : ''}${summary.totalVariance.toFixed(2)}
                    {' '}({summary.totalVariancePercent.toFixed(1)}%)
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Labor vs Non-Labor */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-blue-50 rounded p-2">
              <div className="font-medium text-blue-900 mb-1">Labor</div>
              <div className="text-blue-700">
                Est: ${summary.laborCosts.estimated.toFixed(2)}
              </div>
              {hasActualCosts && (
                <div className="text-blue-700">
                  Act: ${summary.laborCosts.actual.toFixed(2)}
                </div>
              )}
            </div>
            <div className="bg-purple-50 rounded p-2">
              <div className="font-medium text-purple-900 mb-1">Non-Labor</div>
              <div className="text-purple-700">
                Est: ${summary.nonLaborCosts.estimated.toFixed(2)}
              </div>
              {hasActualCosts && (
                <div className="text-purple-700">
                  Act: ${summary.nonLaborCosts.actual.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">By Category</div>
            <div className="space-y-1.5">
              {BUDGET_CATEGORIES.map((category) => {
                const cat = summary.byCategory[category];
                if (cat.entryCount === 0) return null;
                return (
                  <div key={category} className="flex justify-between text-xs">
                    <span className="text-gray-600 capitalize">{category}</span>
                    <div className="flex gap-2">
                      <span className="text-gray-700">${cat.estimatedTotal.toFixed(2)}</span>
                      {hasActualCosts && cat.actualTotal > 0 && (
                        <span
                          className={`font-medium ${
                            cat.variance > 0
                              ? 'text-green-600'
                              : cat.variance < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          ({cat.variance > 0 ? '+' : ''}{cat.variancePercent.toFixed(0)}%)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
