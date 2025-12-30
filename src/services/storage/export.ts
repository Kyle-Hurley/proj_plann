import { db } from './db';
import type { AppState } from '@/types/models';

// ============================================================================
// EXPORT FUNCTIONALITY
// ============================================================================

/**
 * Export all data to a JSON file
 */
export async function exportToJSON(): Promise<void> {
  try {
    // Fetch all data from IndexedDB
    const [tasks, projects, phases, deliverables, personnel, budgetEntries] = await Promise.all([
      db.tasks.toArray(),
      db.projects.toArray(),
      db.phases.toArray(),
      db.deliverables.toArray(),
      db.personnel.toArray(),
      db.budgetEntries.toArray(),
    ]);

    // Convert arrays to normalized records (id -> entity)
    const appState: AppState = {
      tasks: Object.fromEntries(tasks.map(t => [t.id, t])),
      projects: Object.fromEntries(projects.map(p => [p.id, p])),
      phases: Object.fromEntries(phases.map(p => [p.id, p])),
      deliverables: Object.fromEntries(deliverables.map(d => [d.id, d])),
      personnel: Object.fromEntries(personnel.map(p => [p.id, p])),
      budgetEntries: Object.fromEntries(budgetEntries.map(b => [b.id, b])),
      version: '1.0.0',
      lastSyncedAt: new Date().toISOString(),
    };

    // Create JSON blob
    const json = JSON.stringify(appState, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-plan-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Data exported successfully');
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
}

// ============================================================================
// IMPORT FUNCTIONALITY
// ============================================================================

/**
 * Import data from a JSON file
 */
export async function importFromJSON(file: File): Promise<void> {
  try {
    // Read file content
    const text = await file.text();
    const appState: AppState = JSON.parse(text);

    // Validate basic structure
    if (!appState.tasks || !appState.version) {
      throw new Error('Invalid backup file format');
    }

    // Clear existing data
    await db.transaction('rw', db.tables, async () => {
      await Promise.all(db.tables.map(table => table.clear()));
    });

    // Import data to IndexedDB
    await db.transaction('rw', db.tables, async () => {
      // Import tasks
      if (appState.tasks && Object.keys(appState.tasks).length > 0) {
        await db.tasks.bulkAdd(Object.values(appState.tasks));
      }

      // Import projects (if any)
      if (appState.projects && Object.keys(appState.projects).length > 0) {
        await db.projects.bulkAdd(Object.values(appState.projects));
      }

      // Import phases (if any)
      if (appState.phases && Object.keys(appState.phases).length > 0) {
        await db.phases.bulkAdd(Object.values(appState.phases));
      }

      // Import deliverables (if any)
      if (appState.deliverables && Object.keys(appState.deliverables).length > 0) {
        await db.deliverables.bulkAdd(Object.values(appState.deliverables));
      }

      // Import personnel (if any)
      if (appState.personnel && Object.keys(appState.personnel).length > 0) {
        await db.personnel.bulkAdd(Object.values(appState.personnel));
      }

      // Import budget entries (if any)
      if (appState.budgetEntries && Object.keys(appState.budgetEntries).length > 0) {
        await db.budgetEntries.bulkAdd(Object.values(appState.budgetEntries));
      }
    });

    console.log('Data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON file');
    }
    throw new Error('Failed to import data');
  }
}

/**
 * Trigger file picker for import
 */
export function triggerImport(onSuccess?: () => void, onError?: (error: Error) => void): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      await importFromJSON(file);
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    }
  };

  input.click();
}
