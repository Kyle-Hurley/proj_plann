import { StateCreator } from 'zustand';
import { db } from '@/services/storage/db';
import type { Personnel, CreatePersonnelInput, UpdatePersonnelInput } from '@/types/models';

// ============================================================================
// PERSONNEL SLICE STATE & ACTIONS
// ============================================================================

export interface PersonnelSlice {
  // State
  personnel: Record<string, Personnel>;
  isLoadingPersonnel: boolean;
  personnelError: string | null;

  // Actions
  loadPersonnel: () => Promise<void>;
  addPersonnel: (personnel: CreatePersonnelInput) => Promise<string>;
  editPersonnel: (id: string, updates: UpdatePersonnelInput) => Promise<void>;
  removePersonnel: (id: string) => Promise<void>;
  clearPersonnelError: () => void;
}

// ============================================================================
// SLICE CREATOR
// ============================================================================

export const createPersonnelSlice: StateCreator<PersonnelSlice> = (set, get) => ({
  // Initial state
  personnel: {},
  isLoadingPersonnel: false,
  personnelError: null,

  // Load all personnel from IndexedDB
  loadPersonnel: async () => {
    set({ isLoadingPersonnel: true, personnelError: null });
    try {
      const allPersonnel = await db.personnel.toArray();
      const personnelById = Object.fromEntries(
        allPersonnel.map(person => [person.id, person])
      );
      set({ personnel: personnelById, isLoadingPersonnel: false });
      console.log('Personnel loaded:', allPersonnel.length);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load personnel';
      set({ personnelError: errorMessage, isLoadingPersonnel: false });
      console.error('Error loading personnel:', error);
    }
  },

  // Add a new personnel
  addPersonnel: async (personnelData: CreatePersonnelInput) => {
    set({ isLoadingPersonnel: true, personnelError: null });
    try {
      // Generate personnel with auto-fields
      const personnel: Personnel = {
        ...personnelData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to IndexedDB
      await db.personnel.add(personnel);

      // Update state
      set(state => ({
        personnel: { ...state.personnel, [personnel.id]: personnel },
        isLoadingPersonnel: false,
      }));

      console.log('Personnel added:', personnel.id);
      return personnel.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add personnel';
      set({ personnelError: errorMessage, isLoadingPersonnel: false });
      console.error('Error adding personnel:', error);
      throw error;
    }
  },

  // Edit an existing personnel
  editPersonnel: async (id: string, updates: UpdatePersonnelInput) => {
    set({ isLoadingPersonnel: true, personnelError: null });
    try {
      const currentPersonnel = get().personnel[id];
      if (!currentPersonnel) {
        throw new Error(`Personnel ${id} not found`);
      }

      // Prepare updates with timestamp
      const updatePayload = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Update in IndexedDB
      await db.personnel.update(id, updatePayload);

      // Merge for state update
      const updatedPersonnel: Personnel = {
        ...currentPersonnel,
        ...updatePayload,
      };

      // Update state
      set(state => ({
        personnel: { ...state.personnel, [id]: updatedPersonnel },
        isLoadingPersonnel: false,
      }));

      console.log('Personnel updated:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update personnel';
      set({ personnelError: errorMessage, isLoadingPersonnel: false });
      console.error('Error updating personnel:', error);
      throw error;
    }
  },

  // Remove a personnel (with dependency check)
  removePersonnel: async (id: string) => {
    set({ isLoadingPersonnel: true, personnelError: null });
    try {
      // Check for task assignments
      const tasksWithPersonnel = await db.tasks
        .filter(t => t.assignedTo ? t.assignedTo.includes(id) : false)
        .count();
      if (tasksWithPersonnel > 0) {
        throw new Error(`Cannot delete: Personnel assigned to ${tasksWithPersonnel} task(s). Unassign first.`);
      }

      // Check for budget entries
      const budgetEntries = await db.budgetEntries.where('personnelId').equals(id).count();
      if (budgetEntries > 0) {
        throw new Error(`Cannot delete: Personnel has ${budgetEntries} budget entr${budgetEntries === 1 ? 'y' : 'ies'}. Delete budget entries first.`);
      }

      // Delete from IndexedDB
      await db.personnel.delete(id);

      // Update state
      set(state => {
        const { [id]: _, ...remainingPersonnel } = state.personnel;
        return { personnel: remainingPersonnel, isLoadingPersonnel: false };
      });

      console.log('Personnel removed:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove personnel';
      set({ personnelError: errorMessage, isLoadingPersonnel: false });
      console.error('Error removing personnel:', error);
      throw error;
    }
  },

  // Clear error state
  clearPersonnelError: () => set({ personnelError: null }),
});
