// ============================================================================
// CORE DATA MODELS
// ============================================================================

export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;              // UUID
  projectId: string;       // Foreign key (for future use)
  phaseId?: string;        // Optional phase grouping (for future use)
  name: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;

  // Scheduling (future milestones)
  startDate?: string;      // ISO 8601
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;

  // Dependencies (future milestones)
  dependsOn?: string[];    // Array of task IDs
  assignedTo?: string[];   // Array of personnel IDs

  // Metadata
  order: number;           // Display order
  tags?: string[];
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
}

// Future entities - defined for completeness but not used in Milestone 1
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'archived';

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface Phase {
  id: string;
  projectId: string;
  parentPhaseId?: string;  // For nested phases
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  order: number;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export type DeliverableStatus = 'pending' | 'in-review' | 'approved' | 'delivered';

export interface Deliverable {
  id: string;
  taskId: string;
  name: string;
  description?: string;
  dueDate?: string;
  status: DeliverableStatus;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Personnel {
  id: string;
  name: string;
  email?: string;
  role?: string;
  hourlyRate?: number;
  availability?: number;   // Hours per week
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BudgetCategory = 'labor' | 'materials' | 'software' | 'other';

export interface BudgetEntry {
  id: string;
  projectId: string;
  taskId?: string;
  category: BudgetCategory;
  description: string;

  estimatedCost: number;
  actualCost?: number;

  // Labor-specific
  personnelId?: string;
  hours?: number;

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// APPLICATION STATE
// ============================================================================

export interface AppState {
  // Core data (normalized by ID)
  tasks: Record<string, Task>;
  projects: Record<string, Project>;
  phases: Record<string, Phase>;
  deliverables: Record<string, Deliverable>;
  personnel: Record<string, Personnel>;
  budgetEntries: Record<string, BudgetEntry>;

  // UI state
  selectedProjectId?: string;
  selectedTaskId?: string;

  // Metadata
  version: string;         // Schema version for migrations
  lastSyncedAt?: string;   // Future: sync tracking
}

// ============================================================================
// HELPER TYPES & VALIDATORS
// ============================================================================

export const TASK_STATUSES: TaskStatus[] = ['todo', 'in-progress', 'blocked', 'done', 'cancelled'];
export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical'];

export function isValidTaskStatus(status: string): status is TaskStatus {
  return TASK_STATUSES.includes(status as TaskStatus);
}

export function isValidTaskPriority(priority: string): priority is TaskPriority {
  return TASK_PRIORITIES.includes(priority as TaskPriority);
}

// Type for creating a new task (omit auto-generated fields)
export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

// Type for updating a task (all fields optional except id)
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt'>>;
