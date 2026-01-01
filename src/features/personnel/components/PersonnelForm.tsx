import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/store';
import type { Personnel } from '@/types/models';

interface PersonnelFormProps {
  personnel?: Personnel;  // If provided, we're editing; otherwise creating
  onClose: () => void;
}

export function PersonnelForm({ personnel, onClose }: PersonnelFormProps) {
  const { addPersonnel, editPersonnel } = useStore();
  const isEditing = !!personnel;

  // Form state
  const [name, setName] = useState(personnel?.name || '');
  const [email, setEmail] = useState(personnel?.email || '');
  const [role, setRole] = useState(personnel?.role || '');
  const [hourlyRate, setHourlyRate] = useState(personnel?.hourlyRate?.toString() || '');
  const [availability, setAvailability] = useState(personnel?.availability?.toString() || '');
  const [isActive, setIsActive] = useState(personnel?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when personnel prop changes
  useEffect(() => {
    if (personnel) {
      setName(personnel.name);
      setEmail(personnel.email || '');
      setRole(personnel.role || '');
      setHourlyRate(personnel.hourlyRate?.toString() || '');
      setAvailability(personnel.availability?.toString() || '');
      setIsActive(personnel.isActive);
    }
  }, [personnel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Personnel name is required');
      return;
    }

    // Validate hourly rate
    const hourlyRateNum = hourlyRate ? parseFloat(hourlyRate) : undefined;
    if (hourlyRate && (isNaN(hourlyRateNum!) || hourlyRateNum! <= 0)) {
      alert('Hourly rate must be a positive number');
      return;
    }

    // Validate availability
    const availabilityNum = availability ? parseFloat(availability) : undefined;
    if (availability && (isNaN(availabilityNum!) || availabilityNum! <= 0)) {
      alert('Availability must be a positive number');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && personnel) {
        // Update existing personnel
        await editPersonnel(personnel.id, {
          name: name.trim(),
          email: email.trim() || undefined,
          role: role.trim() || undefined,
          hourlyRate: hourlyRateNum,
          availability: availabilityNum,
          isActive,
        });
      } else {
        // Create new personnel
        await addPersonnel({
          name: name.trim(),
          email: email.trim() || undefined,
          role: role.trim() || undefined,
          hourlyRate: hourlyRateNum,
          availability: availabilityNum,
          isActive,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving personnel:', error);
      alert(error instanceof Error ? error.message : 'Failed to save personnel');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-300 rounded-lg p-5 mb-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {isEditing ? 'Edit Personnel' : 'Add New Personnel'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name - Required */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
            placeholder="John Doe"
            required
          />
        </div>

        {/* Email - Optional */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
            placeholder="john@example.com"
          />
        </div>

        {/* Role - Optional */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <input
            id="role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
            placeholder="Software Engineer, Project Manager, etc."
          />
        </div>

        {/* Hourly Rate - Optional */}
        <div>
          <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-1">
            Hourly Rate ($)
          </label>
          <input
            id="hourlyRate"
            type="number"
            step="0.01"
            min="0"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
            placeholder="75.00"
          />
        </div>

        {/* Availability - Optional */}
        <div>
          <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
            Availability (hours/week)
          </label>
          <input
            id="availability"
            type="number"
            step="0.5"
            min="0"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
            placeholder="40"
          />
        </div>

        {/* Active Status - Checkbox */}
        <div className="flex items-center">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Active (can be assigned to tasks)
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
