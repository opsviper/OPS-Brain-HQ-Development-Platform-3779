import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import DataTable from '../components/common/DataTable';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMonitor, FiPlus, FiEdit3, FiTrash2, FiX, FiSave } = FiIcons;

const SystemForm = ({ system, users, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    purpose: '',
    status: 'Active',
    owner: '',
    location: ''
  });

  useEffect(() => {
    if (system) {
      setFormData({
        name: system.name || '',
        type: system.type || '',
        purpose: system.purpose || '',
        status: system.status || 'Active',
        owner: system.owner || '',
        location: system.location || ''
      });
    }
  }, [system]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {system ? 'Edit System' : 'Add System'}
            </h2>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
              <SafeIcon icon={FiX} className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter system name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Customer Management"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Owner</label>
              <select
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select owner</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Cloud, On-Premise"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe the system's purpose"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <SafeIcon icon={FiSave} className="w-4 h-4" />
              <span>{system ? 'Update' : 'Create'} System</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Systems = () => {
  const [systems, setSystems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSystemForm, setShowSystemForm] = useState(false);
  const [editingSystem, setEditingSystem] = useState(null);

  useEffect(() => {
    fetchSystems();
    fetchUsers();
  }, []);

  const fetchSystems = async () => {
    try {
      const { data, error } = await supabase
        .from('systems_67abc23def')
        .select(`
          *,
          users_67abc23def!systems_67abc23def_owner_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedSystems = data?.map(system => ({
        ...system,
        owner_name: system.users_67abc23def?.name || 'Unassigned'
      })) || [];

      setSystems(transformedSystems);
    } catch (error) {
      console.error('Error fetching systems:', error);
      setSystems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users_67abc23def')
        .select('id, name, email')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const handleEditSystem = (system) => {
    setEditingSystem(system);
    setShowSystemForm(true);
  };

  const handleDeleteSystem = async (system) => {
    if (!confirm(`Are you sure you want to delete "${system.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('systems_67abc23def')
        .delete()
        .eq('id', system.id);

      if (error) throw error;
      
      setSystems(prevSystems => prevSystems.filter(s => s.id !== system.id));
    } catch (error) {
      console.error('Error deleting system:', error);
      alert('Error deleting system. Please try again.');
    }
  };

  const handleSaveSystem = async (systemData) => {
    try {
      if (editingSystem) {
        const { error } = await supabase
          .from('systems_67abc23def')
          .update({ ...systemData, updated_at: new Date().toISOString() })
          .eq('id', editingSystem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('systems_67abc23def')
          .insert([{
            ...systemData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      setShowSystemForm(false);
      setEditingSystem(null);
      fetchSystems();
    } catch (error) {
      console.error('Error saving system:', error);
      alert('Error saving system. Please try again.');
    }
  };

  const tableColumns = [
    { key: 'name', label: 'System Name', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'purpose', label: 'Purpose', sortable: false },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      sortable: true,
      getBadgeClass: (value) => {
        switch (value) {
          case 'Active': return 'bg-green-100 text-green-800';
          case 'Inactive': return 'bg-red-100 text-red-800';
          case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      }
    },
    { key: 'owner_name', label: 'Owner', sortable: true },
    { key: 'location', label: 'Location', sortable: true }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiMonitor} className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Systems Database</h1>
              <p className="text-gray-600">Manage IT systems and infrastructure</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowSystemForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add System</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Systems', value: systems.length, color: 'bg-blue-100 text-blue-800' },
          { label: 'Active', value: systems.filter(s => s.status === 'Active').length, color: 'bg-green-100 text-green-800' },
          { label: 'Maintenance', value: systems.filter(s => s.status === 'Maintenance').length, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Inactive', value: systems.filter(s => s.status === 'Inactive').length, color: 'bg-red-100 text-red-800' }
        ].map((stat, index) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <DataTable
        data={systems}
        columns={tableColumns}
        title="Systems"
        onEdit={handleEditSystem}
        onDelete={handleDeleteSystem}
        searchable={true}
      />

      {systems.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiMonitor} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No systems found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first system.</p>
          <button
            onClick={() => setShowSystemForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add System</span>
          </button>
        </div>
      )}

      {showSystemForm && (
        <SystemForm
          system={editingSystem}
          users={users}
          onSave={handleSaveSystem}
          onCancel={() => {
            setShowSystemForm(false);
            setEditingSystem(null);
          }}
        />
      )}
    </div>
  );
};

export default Systems;