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

// ============================================================================
// PROJECT HELPER TYPES
// ============================================================================

export const PROJECT_STATUSES: ProjectStatus[] = ['planning', 'active', 'on-hold', 'completed', 'archived'];

export type CreateProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProjectInput = Partial<Omit<Project, 'id' | 'createdAt'>>;

// ============================================================================
// PHASE HELPER TYPES
// ============================================================================

export type CreatePhaseInput = Omit<Phase, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePhaseInput = Partial<Omit<Phase, 'id' | 'createdAt'>>;

// ============================================================================
// PERSONNEL HELPER TYPES
// ============================================================================

export type CreatePersonnelInput = Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePersonnelInput = Partial<Omit<Personnel, 'id' | 'createdAt'>>;

// ============================================================================
// BUDGET HELPER TYPES
// ============================================================================

export type CreateBudgetEntryInput = Omit<BudgetEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateBudgetEntryInput = Partial<Omit<BudgetEntry, 'id' | 'createdAt'>>;

export const BUDGET_CATEGORIES: BudgetCategory[] = ['labor', 'materials', 'software', 'other'];

// Budget summary types
export interface BudgetCategorySummary {
  category: BudgetCategory;
  estimatedTotal: number;
  actualTotal: number;
  variance: number;
  variancePercent: number;
  entryCount: number;
}

export interface ProjectBudgetSummary {
  totalEstimated: number;
  totalActual: number;
  totalVariance: number;
  totalVariancePercent: number;
  byCategory: Record<BudgetCategory, BudgetCategorySummary>;
  laborCosts: { estimated: number; actual: number };
  nonLaborCosts: { estimated: number; actual: number };
}

// Cost forecast type
export interface CostForecast {
  completedTasksCount: number;
  totalTasksCount: number;
  percentComplete: number;
  actualCostToDate: number;
  estimatedTotalCost: number;
  forecastedFinalCost: number;
  estimatedCostRemaining: number;
  forecastedOverrun: number;
  burnRate: number;
  trend: 'under-budget' | 'on-budget' | 'over-budget';
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface TaskFilters {
  phaseId?: string;        // Filter by phase (undefined = all phases, null = unassigned tasks)
  status?: TaskStatus;     // Filter by status
  priority?: TaskPriority; // Filter by priority
  searchText?: string;     // Text search in name/description
  startDateFrom?: string;  // ISO date
  startDateTo?: string;    // ISO date
  dueDateFrom?: string;    // ISO date
  dueDateTo?: string;      // ISO date
}
