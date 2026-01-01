import { useMemo } from 'react';
import { useStore, selectCostForecast } from '@/store/store';

export function BudgetForecast() {
  const budgetEntriesObject = useStore((state) => state.budgetEntries);
  const tasksObject = useStore((state) => state.tasks);
  const selectedProjectId = useStore((state) => state.selectedProjectId);

  // Calculate forecast using memoization
  const forecast = useMemo(
    () => selectCostForecast(useStore.getState()),
    [budgetEntriesObject, tasksObject, selectedProjectId]
  );

  // Don't show if no project, no tasks, or no budget entries
  if (!forecast || forecast.estimatedTotalCost === 0) {
    return null;
  }

  const hasActualCosts = forecast.actualCostToDate > 0;

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Cost Forecast</h3>
        {hasActualCosts && (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              forecast.trend === 'over-budget'
                ? 'bg-red-100 text-red-800'
                : forecast.trend === 'under-budget'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {forecast.trend === 'over-budget' && '⚠️ Over Budget'}
            {forecast.trend === 'under-budget' && '✓ Under Budget'}
            {forecast.trend === 'on-budget' && '≈ On Budget'}
          </span>
        )}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Task Progress</span>
          <span className="font-medium text-gray-900">
            {forecast.completedTasksCount} / {forecast.totalTasksCount} ({forecast.percentComplete.toFixed(0)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              forecast.trend === 'over-budget'
                ? 'bg-red-600'
                : forecast.trend === 'under-budget'
                ? 'bg-green-600'
                : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(forecast.percentComplete, 100)}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Estimated Total */}
          <div className="bg-gray-50 rounded-md p-3">
            <div className="text-xs text-gray-600 mb-1">Estimated Total</div>
            <div className="text-lg font-semibold text-gray-900">
              ${forecast.estimatedTotalCost.toFixed(0)}
            </div>
          </div>

          {/* Actual to Date */}
          <div className="bg-blue-50 rounded-md p-3">
            <div className="text-xs text-blue-700 mb-1">Actual to Date</div>
            <div className="text-lg font-semibold text-blue-900">
              ${forecast.actualCostToDate.toFixed(0)}
            </div>
          </div>
        </div>

        {hasActualCosts && forecast.percentComplete > 0 && (
          <>
            {/* Forecasted Final & Variance */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`rounded-md p-3 ${
                  forecast.trend === 'over-budget'
                    ? 'bg-red-50'
                    : forecast.trend === 'under-budget'
                    ? 'bg-green-50'
                    : 'bg-yellow-50'
                }`}
              >
                <div
                  className={`text-xs mb-1 ${
                    forecast.trend === 'over-budget'
                      ? 'text-red-700'
                      : forecast.trend === 'under-budget'
                      ? 'text-green-700'
                      : 'text-yellow-700'
                  }`}
                >
                  Forecasted Final
                </div>
                <div
                  className={`text-lg font-semibold ${
                    forecast.trend === 'over-budget'
                      ? 'text-red-900'
                      : forecast.trend === 'under-budget'
                      ? 'text-green-900'
                      : 'text-yellow-900'
                  }`}
                >
                  ${forecast.forecastedFinalCost.toFixed(0)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-md p-3">
                <div className="text-xs text-gray-600 mb-1">
                  {forecast.forecastedOverrun >= 0 ? 'Overrun' : 'Savings'}
                </div>
                <div
                  className={`text-lg font-semibold ${
                    forecast.forecastedOverrun > 0
                      ? 'text-red-700'
                      : forecast.forecastedOverrun < 0
                      ? 'text-green-700'
                      : 'text-gray-700'
                  }`}
                >
                  {forecast.forecastedOverrun >= 0 ? '+' : ''}${forecast.forecastedOverrun.toFixed(0)}
                </div>
              </div>
            </div>

            {/* Warning Banner for Over Budget */}
            {forecast.trend === 'over-budget' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-red-900">
                      Project forecasted to exceed budget
                    </div>
                    <div className="text-xs text-red-700 mt-1">
                      Current burn rate: ${forecast.burnRate.toFixed(0)} per 100% completion
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Burn Rate */}
            <div className="text-xs text-gray-600 text-center pt-2 border-t border-gray-200">
              Burn Rate: ${forecast.burnRate.toFixed(2)} per 100% completion
            </div>
          </>
        )}

        {!hasActualCosts && (
          <div className="text-center py-4 text-sm text-gray-500">
            Add actual costs to budget entries to see forecast
          </div>
        )}
      </div>
    </div>
  );
}
