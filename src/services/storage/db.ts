import Dexie, { type EntityTable } from 'dexie';
import type { Task, Project, Phase, Deliverable, Personnel, BudgetEntry } from '@/types/models';

// ============================================================================
// DATABASE SCHEMA
// ============================================================================

class ProjectDatabase extends Dexie {
  // Tables - using EntityTable for better TypeScript support
  tasks!: EntityTable<Task, 'id'>;
  projects!: EntityTable<Project, 'id'>;
  phases!: EntityTable<Phase, 'id'>;
  deliverables!: EntityTable<Deliverable, 'id'>;
  personnel!: EntityTable<Personnel, 'id'>;
  budgetEntries!: EntityTable<BudgetEntry, 'id'>;

  constructor() {
    super('ProjectPlanningDB');

    // Version 1: Initial schema (Milestone 1 - tasks only)
    this.version(1).stores({
      tasks: 'id, projectId, status, priority, createdAt, dueDate',
      projects: 'id, status, createdAt',
      phases: 'id, projectId, parentPhaseId, order',
      deliverables: 'id, taskId, dueDate, status',
      personnel: 'id, isActive',
      budgetEntries: 'id, projectId, taskId, category',
    });
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const db = new ProjectDatabase();

// ============================================================================
// DATABASE HELPERS
// ============================================================================

/**
 * Initialize database and perform any necessary migrations
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Open the database
    await db.open();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Clear all data from the database (useful for testing/reset)
 */
export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map(table => table.clear()));
  });
  console.log('All data cleared from database');
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  const stats = await Promise.all(
    db.tables.map(async (table) => ({
      name: table.name,
      count: await table.count(),
    }))
  );

  return stats.reduce((acc, { name, count }) => {
    acc[name] = count;
    return acc;
  }, {} as Record<string, number>);
}
