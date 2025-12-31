import { StateCreator } from 'zustand';
import type { TaskFilters } from '@/types/models';

// ============================================================================
// FILTERS SLICE STATE & ACTIONS
// ============================================================================

export interface FiltersSlice {
  // State
  filters: TaskFilters;

  // Actions
  setFilter: (filterKey: keyof TaskFilters, value: any) => void;
  clearFilters: () => void;
  setPhaseFilter: (phaseId?: string) => void;
}

// ============================================================================
// SLICE CREATOR
// ============================================================================

export const createFiltersSlice: StateCreator<FiltersSlice> = (set) => ({
  // Initial state (no filters active)
  filters: {},

  // Set a specific filter
  setFilter: (filterKey, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [filterKey]: value === '' || value === undefined ? undefined : value,
      },
    }));
    console.log('Filter updated:', filterKey, value);
  },

  // Clear all filters
  clearFilters: () => {
    set({ filters: {} });
    console.log('All filters cleared');
  },

  // Convenience method for setting phase filter
  setPhaseFilter: (phaseId?: string) => {
    set((state) => ({
      filters: { ...state.filters, phaseId },
    }));
    console.log('Phase filter set:', phaseId || 'none');
  },
});
