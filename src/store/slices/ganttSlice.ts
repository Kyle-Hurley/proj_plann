import { StateCreator } from 'zustand';
import type { ViewMode } from 'frappe-gantt';

// ============================================================================
// GANTT SLICE STATE & ACTIONS
// ============================================================================

export interface GanttSlice {
  // State
  viewMode: ViewMode;

  // Actions
  setViewMode: (mode: ViewMode) => void;
}

// ============================================================================
// SLICE CREATOR
// ============================================================================

export const createGanttSlice: StateCreator<GanttSlice> = (set) => ({
  // Initial state
  viewMode: 'Week',

  // Set view mode (Day, Week, Month, Quarter, Year)
  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode });
    console.log('Gantt view mode changed to:', mode);
  },
});
