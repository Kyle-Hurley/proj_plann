import { StateCreator } from 'zustand';
import { db } from '@/services/storage/db';
import type { BudgetEntry, CreateBudgetEntryInput, UpdateBudgetEntryInput } from '@/types/models';

// ============================================================================
// BUDGET SLICE STATE & ACTIONS
// ============================================================================

export interface BudgetSlice {
  // State
  budgetEntries: Record<string, BudgetEntry>;
  isLoadingBudget: boolean;
  budgetError: string | null;

  // Actions
  loadBudgetEntries: () => Promise<void>;
  addBudgetEntry: (entry: CreateBudgetEntryInput) => Promise<string>;
  editBudgetEntry: (id: string, updates: UpdateBudgetEntryInput) => Promise<void>;
  removeBudgetEntry: (id: string) => Promise<void>;
  clearBudgetError: () => void;
}

// ============================================================================
// SLICE CREATOR
// ============================================================================

export const createBudgetSlice: StateCreator<BudgetSlice> = (set, get) => ({
  // Initial state
  budgetEntries: {},
  isLoadingBudget: false,
  budgetError: null,

  // Load all budget entries from IndexedDB
  loadBudgetEntries: async () => {
    set({ isLoadingBudget: true, budgetError: null });
    try {
      const allEntries = await db.budgetEntries.toArray();
      const entriesById = Object.fromEntries(
        allEntries.map(entry => [entry.id, entry])
      );
      set({ budgetEntries: entriesById, isLoadingBudget: false });
      console.log('Budget entries loaded:', allEntries.length);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load budget entries';
      set({ budgetError: errorMessage, isLoadingBudget: false });
      console.error('Error loading budget entries:', error);
    }
  },

  // Add a new budget entry
  addBudgetEntry: async (entryData: CreateBudgetEntryInput) => {
    set({ isLoadingBudget: true, budgetError: null });
    try {
      // Generate budget entry with auto-fields
      const entry: BudgetEntry = {
        ...entryData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to IndexedDB
      await db.budgetEntries.add(entry);

      // Update state
      set(state => ({
        budgetEntries: { ...state.budgetEntries, [entry.id]: entry },
        isLoadingBudget: false,
      }));

      console.log('Budget entry added:', entry.id);
      return entry.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add budget entry';
      set({ budgetError: errorMessage, isLoadingBudget: false });
      console.error('Error adding budget entry:', error);
      throw error;
    }
  },

  // Edit an existing budget entry
  editBudgetEntry: async (id: string, updates: UpdateBudgetEntryInput) => {
    set({ isLoadingBudget: true, budgetError: null });
    try {
      const currentEntry = get().budgetEntries[id];
      if (!currentEntry) {
        throw new Error(`Budget entry ${id} not found`);
      }

      // Prepare updates with timestamp
      const updatePayload = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Update in IndexedDB
      await db.budgetEntries.update(id, updatePayload);

      // Merge for state update
      const updatedEntry: BudgetEntry = {
        ...currentEntry,
        ...updatePayload,
      };

      // Update state
      set(state => ({
        budgetEntries: { ...state.budgetEntries, [id]: updatedEntry },
        isLoadingBudget: false,
      }));

      console.log('Budget entry updated:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update budget entry';
      set({ budgetError: errorMessage, isLoadingBudget: false });
      console.error('Error updating budget entry:', error);
      throw error;
    }
  },

  // Remove a budget entry
  removeBudgetEntry: async (id: string) => {
    set({ isLoadingBudget: true, budgetError: null });
    try {
      // Delete from IndexedDB
      await db.budgetEntries.delete(id);

      // Update state
      set(state => {
        const { [id]: _, ...remainingEntries } = state.budgetEntries;
        return { budgetEntries: remainingEntries, isLoadingBudget: false };
      });

      console.log('Budget entry removed:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove budget entry';
      set({ budgetError: errorMessage, isLoadingBudget: false });
      console.error('Error removing budget entry:', error);
      throw error;
    }
  },

  // Clear error state
  clearBudgetError: () => set({ budgetError: null }),
});
