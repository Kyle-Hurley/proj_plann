import { useState, useEffect, useRef } from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (filename: string) => void;
  defaultFilename: string;
}

/**
 * Modal dialog for customizing export filename
 * Allows user to specify a custom filename before exporting project data
 */
export function ExportModal({ isOpen, onClose, onExport, defaultFilename }: ExportModalProps) {
  const [filename, setFilename] = useState(defaultFilename);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update filename when defaultFilename changes
  useEffect(() => {
    setFilename(defaultFilename);
  }, [defaultFilename]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      // Select filename without extension
      const nameWithoutExt = defaultFilename.replace('.json', '');
      inputRef.current.setSelectionRange(0, nameWithoutExt.length);
    }
  }, [isOpen, defaultFilename]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleExport();
    }
  };

  const handleExport = () => {
    // Ensure filename ends with .json
    let finalFilename = filename.trim();
    if (!finalFilename) {
      finalFilename = defaultFilename;
    }
    if (!finalFilename.endsWith('.json')) {
      finalFilename += '.json';
    }
    onExport(finalFilename);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Preview of final filename
  const previewFilename = filename.trim()
    ? (filename.endsWith('.json') ? filename : filename + '.json')
    : defaultFilename;

  // Check if File System Access API is supported (Chromium browsers)
  const supportsFileSystemAccess = 'showSaveFilePicker' in window;

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      aria-labelledby="export-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-5">
        {/* Header */}
        <div>
          <h2
            id="export-modal-title"
            className="text-xl font-bold text-gray-900"
          >
            Export Project
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Customize the filename for your export
          </p>
        </div>

        {/* Filename Input */}
        <div>
          <label
            htmlFor="export-filename"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Filename
          </label>
          <input
            ref={inputRef}
            type="text"
            id="export-filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white text-gray-900"
            placeholder="project-plan"
          />

          {/* Preview */}
          <p className="mt-2 text-xs text-gray-500 font-mono">
            Will save as: <span className="font-semibold text-gray-700">{previewFilename}</span>
          </p>

          {/* Browser compatibility note */}
          {!supportsFileSystemAccess && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Your browser doesn't support folder selection.
                The file will be saved to your Downloads folder.
              </p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
