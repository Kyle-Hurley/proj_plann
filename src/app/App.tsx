import { useState } from 'react';
import { TaskList } from '@/features/tasks/components/TaskList';
import { FilterPanel } from '@/features/tasks/components/FilterPanel';
import { ProjectInfo } from '@/features/projects/components/ProjectInfo';
import { PhaseList } from '@/features/phases/components/PhaseList';
import { ExportModal } from '@/features/projects/components/ExportModal';
import { exportToJSON, generateDefaultFilename, triggerImport } from '@/services/storage/export';

function App() {
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [defaultFilename, setDefaultFilename] = useState('project-plan.json');

  const handleExportClick = async () => {
    // Generate default filename and show modal
    const filename = await generateDefaultFilename();
    setDefaultFilename(filename);
    setShowExportModal(true);
  };

  const handleExportConfirm = async (filename: string) => {
    setShowExportModal(false);
    setIsExporting(true);
    try {
      await exportToJSON(filename);
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = (error as Error).message;
      // Don't show error alert if user cancelled the export
      if (errorMessage !== 'Export cancelled') {
        alert('Failed to export data. Please try again.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    triggerImport(
      // onSuccess (data reload handled in triggerImport)
      () => {
        alert('Data imported successfully!');
      },
      // onError
      (error) => {
        alert(`Failed to import data: ${error.message}`);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Project Planner</h1>

            {/* Export/Import Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleImport}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Import
              </button>
              <button
                onClick={handleExportClick}
                disabled={isExporting}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
                {isExporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-[1800px] mx-auto py-6 px-4">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar: Project + Phases */}
            <div className="col-span-3 space-y-6">
              <ProjectInfo />
              <PhaseList />
            </div>

            {/* Center: Tasks */}
            <div className="col-span-6">
              <TaskList />
            </div>

            {/* Right Sidebar: Filters */}
            <div className="col-span-3">
              <FilterPanel />
            </div>
          </div>
        </div>
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportConfirm}
        defaultFilename={defaultFilename}
      />
    </div>
  );
}

export default App;
