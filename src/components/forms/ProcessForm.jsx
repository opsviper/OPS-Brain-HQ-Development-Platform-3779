import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiSave, FiUser, FiExternalLink, FiLayers, FiMonitor, FiTool, FiSettings, FiUsers } = FiIcons;

const ProcessForm = ({ process, users, systems, equipment, software, team, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Planned',
    owner: '',
    sop_url: '',
    related_systems: [],
    related_equipment: [],
    related_software: [],
    related_team: []
  });

  useEffect(() => {
    if (process) {
      setFormData({
        name: process.name || '',
        description: process.description || '',
        status: process.status || 'Planned',
        owner: process.owner || '',
        sop_url: process.sop_url || '',
        related_systems: process.related_systems || [],
        related_equipment: process.related_equipment || [],
        related_software: process.related_software || [],
        related_team: process.related_team || []
      });
    }
  }, [process]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const MultiSelectSection = ({ title, icon, field, options, selectedItems }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <SafeIcon icon={icon} className="w-4 h-4 inline mr-1" />
        {title}
      </label>
      <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto">
        {options.map(option => (
          <label key={option.id} className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={selectedItems.includes(option.id)}
              onChange={() => handleMultiSelect(field, option.id)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">{option.name}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <SafeIcon icon={FiLayers} className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {process ? 'Edit Process' : 'Add Process'}
                </h2>
                <p className="text-sm text-gray-500">
                  {process ? 'Update process details and relationships' : 'Create a new process with relationships'}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Process Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter process name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter process description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Planned">Planned</option>
                <option value="Live">Live</option>
                <option value="Deprecated">Deprecated</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiUser} className="w-4 h-4 inline mr-1" />
                Process Owner
              </label>
              <select
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select owner</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiExternalLink} className="w-4 h-4 inline mr-1" />
                SOP URL
              </label>
              <input
                type="url"
                name="sop_url"
                value={formData.sop_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://docs.company.com/process-sop"
              />
            </div>
          </div>

          {/* Relationships */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Process Relationships</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MultiSelectSection
                title="Related Systems"
                icon={FiMonitor}
                field="related_systems"
                options={systems}
                selectedItems={formData.related_systems}
              />

              <MultiSelectSection
                title="Related Equipment"
                icon={FiTool}
                field="related_equipment"
                options={equipment}
                selectedItems={formData.related_equipment}
              />

              <MultiSelectSection
                title="Related Software"
                icon={FiSettings}
                field="related_software"
                options={software}
                selectedItems={formData.related_software}
              />

              <MultiSelectSection
                title="Related Team Members"
                icon={FiUsers}
                field="related_team"
                options={team}
                selectedItems={formData.related_team}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <SafeIcon icon={FiSave} className="w-4 h-4" />
              <span>{process ? 'Update' : 'Create'} Process</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProcessForm;