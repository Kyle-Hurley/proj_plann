import { StateCreator } from 'zustand';
import { db } from '@/services/storage/db';
import type { Phase, CreatePhaseInput, UpdatePhaseInput } from '@/types/models';

// ============================================================================
// PHASES SLICE STATE & ACTIONS
// ============================================================================

export interface PhasesSlice {
  // State
  phases: Record<string, Phase>;
  isLoadingPhases: boolean;
  phaseError: string | null;

  // Actions
  loadPhases: () => Promise<void>;
  addPhase: (phase: CreatePhaseInput) => Promise<string>;
  editPhase: (id: string, updates: UpdatePhaseInput) => Promise<void>;
  removePhase: (id: string) => Promise<void>;
  clearPhaseError: () => void;
}

// ============================================================================
// SLICE CREATOR
// ============================================================================

export const createPhasesSlice: StateCreator<PhasesSlice> = (set, get) => ({
  // Initial state
  phases: {},
  isLoadingPhases: false,
  phaseError: null,

  // Load all phases from IndexedDB
  loadPhases: async () => {
    set({ isLoadingPhases: true, phaseError: null });
    try {
      const allPhases = await db.phases.toArray();
      const phasesById = Object.fromEntries(
        allPhases.map(phase => [phase.id, phase])
      );
      set({ phases: phasesById, isLoadingPhases: false });
      console.log('Phases loaded:', allPhases.length);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load phases';
      set({ phaseError: errorMessage, isLoadingPhases: false });
      console.error('Error loading phases:', error);
    }
  },

  // Add a new phase (with 2-level hierarchy validation)
  addPhase: async (phaseData: CreatePhaseInput) => {
    set({ isLoadingPhases: true, phaseError: null });
    try {
      // CRITICAL: Enforce 2-level hierarchy
      if (phaseData.parentPhaseId) {
        // Verify parent exists
        const parentPhase = await db.phases.get(phaseData.parentPhaseId);
        if (!parentPhase) {
          throw new Error('Parent phase not found');
        }

        // Reject if parent itself has a parent (would create 3-level hierarchy)
        if (parentPhase.parentPhaseId) {
          throw new Error('Cannot create phase: Maximum 2 levels of hierarchy allowed. Parent phase is already a child phase.');
        }
      }

      // Generate phase with auto-fields
      const phase: Phase = {
        ...phaseData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to IndexedDB
      await db.phases.add(phase);

      // Update state
      set(state => ({
        phases: { ...state.phases, [phase.id]: phase },
        isLoadingPhases: false,
      }));

      console.log('Phase added:', phase.id);
      return phase.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add phase';
      set({ phaseError: errorMessage, isLoadingPhases: false });
      console.error('Error adding phase:', error);
      throw error;
    }
  },

  // Edit an existing phase
  editPhase: async (id: string, updates: UpdatePhaseInput) => {
    set({ isLoadingPhases: true, phaseError: null });
    try {
      const currentPhase = get().phases[id];
      if (!currentPhase) {
        throw new Error(`Phase ${id} not found`);
      }

      // Validate 2-level hierarchy if changing parentPhaseId
      if (updates.parentPhaseId !== undefined && updates.parentPhaseId !== currentPhase.parentPhaseId) {
        if (updates.parentPhaseId) {
          const newParent = await db.phases.get(updates.parentPhaseId);
          if (!newParent) {
            throw new Error('Parent phase not found');
          }
          if (newParent.parentPhaseId) {
            throw new Error('Cannot update phase: Maximum 2 levels of hierarchy allowed. New parent is already a child phase.');
          }
        }

        // Prevent creating cycles or violating hierarchy if this phase has children
        const childCount = await db.phases.where('parentPhaseId').equals(id).count();
        if (childCount > 0 && updates.parentPhaseId) {
          throw new Error('Cannot update phase: This phase has child phases and cannot become a child itself.');
        }
      }

      // Prepare updates with timestamp
      const updatePayload = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Update in IndexedDB
      await db.phases.update(id, updatePayload);

      // Merge for state update
      const updatedPhase: Phase = {
        ...currentPhase,
        ...updatePayload,
      };

      // Update state
      set(state => ({
        phases: { ...state.phases, [id]: updatedPhase },
        isLoadingPhases: false,
      }));

      console.log('Phase updated:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update phase';
      set({ phaseError: errorMessage, isLoadingPhases: false });
      console.error('Error updating phase:', error);
      throw error;
    }
  },

  // Remove a phase (with dependency check)
  removePhase: async (id: string) => {
    set({ isLoadingPhases: true, phaseError: null });
    try {
      // Check for child phases
      const childPhases = await db.phases.where('parentPhaseId').equals(id).count();
      if (childPhases > 0) {
        throw new Error(`Cannot delete phase: ${childPhases} child phase(s) depend on it. Delete child phases first.`);
      }

      // Check for tasks in this phase
      const tasksInPhase = await db.tasks.where('phaseId').equals(id).count();
      if (tasksInPhase > 0) {
        throw new Error(`Cannot delete phase: ${tasksInPhase} task(s) are assigned to it. Reassign or delete tasks first.`);
      }

      // Delete from IndexedDB
      await db.phases.delete(id);

      // Update state
      set(state => {
        const { [id]: _, ...remainingPhases } = state.phases;
        return { phases: remainingPhases, isLoadingPhases: false };
      });

      console.log('Phase removed:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove phase';
      set({ phaseError: errorMessage, isLoadingPhases: false });
      console.error('Error removing phase:', error);
      throw error;
    }
  },

  // Clear error state
  clearPhaseError: () => set({ phaseError: null }),
});
