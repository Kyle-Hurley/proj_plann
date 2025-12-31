import { StateCreator } from 'zustand';
import { db } from '@/services/storage/db';
import type { Project, CreateProjectInput, UpdateProjectInput } from '@/types/models';

// ============================================================================
// PROJECTS SLICE STATE & ACTIONS
// ============================================================================

export interface ProjectsSlice {
  // State
  projects: Record<string, Project>;
  selectedProjectId?: string;
  isLoadingProjects: boolean;
  projectError: string | null;

  // Actions
  loadProjects: () => Promise<void>;
  addProject: (project: CreateProjectInput) => Promise<string>;
  editProject: (id: string, updates: UpdateProjectInput) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  setSelectedProject: (id?: string) => void;
  clearProjectError: () => void;
}

// ============================================================================
// SLICE CREATOR
// ============================================================================

export const createProjectsSlice: StateCreator<ProjectsSlice> = (set, get) => ({
  // Initial state
  projects: {},
  selectedProjectId: undefined,
  isLoadingProjects: false,
  projectError: null,

  // Load all projects from IndexedDB
  loadProjects: async () => {
    set({ isLoadingProjects: true, projectError: null });
    try {
      const allProjects = await db.projects.toArray();
      const projectsById = Object.fromEntries(
        allProjects.map(project => [project.id, project])
      );
      set({ projects: projectsById, isLoadingProjects: false });
      console.log('Projects loaded:', allProjects.length);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load projects';
      set({ projectError: errorMessage, isLoadingProjects: false });
      console.error('Error loading projects:', error);
    }
  },

  // Add a new project
  addProject: async (projectData: CreateProjectInput) => {
    set({ isLoadingProjects: true, projectError: null });
    try {
      // Generate project with auto-fields
      const project: Project = {
        ...projectData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to IndexedDB
      await db.projects.add(project);

      // Update state
      set(state => ({
        projects: { ...state.projects, [project.id]: project },
        isLoadingProjects: false,
      }));

      console.log('Project added:', project.id);
      return project.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add project';
      set({ projectError: errorMessage, isLoadingProjects: false });
      console.error('Error adding project:', error);
      throw error;
    }
  },

  // Edit an existing project
  editProject: async (id: string, updates: UpdateProjectInput) => {
    set({ isLoadingProjects: true, projectError: null });
    try {
      const currentProject = get().projects[id];
      if (!currentProject) {
        throw new Error(`Project ${id} not found`);
      }

      // Prepare updates with timestamp
      const updatePayload = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Update in IndexedDB
      await db.projects.update(id, updatePayload);

      // Merge for state update
      const updatedProject: Project = {
        ...currentProject,
        ...updatePayload,
      };

      // Update state
      set(state => ({
        projects: { ...state.projects, [id]: updatedProject },
        isLoadingProjects: false,
      }));

      console.log('Project updated:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project';
      set({ projectError: errorMessage, isLoadingProjects: false });
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Remove a project (with dependency check)
  removeProject: async (id: string) => {
    set({ isLoadingProjects: true, projectError: null });
    try {
      // Check for orphaned tasks
      const tasksInProject = await db.tasks.where('projectId').equals(id).count();
      if (tasksInProject > 0) {
        throw new Error(`Cannot delete project: ${tasksInProject} task(s) depend on it. Delete tasks first.`);
      }

      // Check for orphaned phases
      const phasesInProject = await db.phases.where('projectId').equals(id).count();
      if (phasesInProject > 0) {
        throw new Error(`Cannot delete project: ${phasesInProject} phase(s) depend on it. Delete phases first.`);
      }

      // Delete from IndexedDB
      await db.projects.delete(id);

      // Update state
      set(state => {
        const { [id]: _, ...remainingProjects } = state.projects;
        return {
          projects: remainingProjects,
          isLoadingProjects: false,
          // Clear selection if deleting selected project
          selectedProjectId: state.selectedProjectId === id ? undefined : state.selectedProjectId
        };
      });

      console.log('Project removed:', id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove project';
      set({ projectError: errorMessage, isLoadingProjects: false });
      console.error('Error removing project:', error);
      throw error;
    }
  },

  // Set selected project
  setSelectedProject: (id?: string) => {
    set({ selectedProjectId: id });
    console.log('Selected project:', id || 'none');
  },

  // Clear error state
  clearProjectError: () => set({ projectError: null }),
});
