import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import DataTable from '../components/common/DataTable';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSettings, FiPlus, FiX, FiSave } = FiIcons;

const SoftwareForm = ({ software, users, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    use_case: '',
    cost: '',
    owner: '',
    license_expires: '',
    status: 'Active',
    vendor: '',
    notes: ''
  });

  useEffect(() => {
    if (software) {
      setFormData({
        name: software.name || '',
        version: software.version || '',
        use_case: software.use_case || '',
        cost: software.cost || '',
        owner: software.owner || '',
        license_expires: software.license_expires || '',
        status: software.status || 'Active',
        vendor: software.vendor || '',
        notes: software.notes || ''
      });
    }
  }, [software]);

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
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {software ? 'Edit Software' : 'Add Software'}
            </h2>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
              <SafeIcon icon={FiX} className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Software Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter software name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Software version"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Software vendor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Cost ($)</label>
              <input
                type="number"
                step="0.01"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Expires</label>
              <input
                type="date"
                name="license_expires"
                value={formData.license_expires}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Use Case</label>
              <input
                type="text"
                name="use_case"
                value={formData.use_case}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="What is this software used for?"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Additional notes or license details"
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
              <span>{software ? 'Update' : 'Create'} Software</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Software = () => {
  const [software, setSoftware] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSoftwareForm, setShowSoftwareForm] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState(null);

  useEffect(() => {
    fetchSoftware();
    fetchUsers();
  }, []);

  const fetchSoftware = async () => {
    try {
      const { data, error } = await supabase
        .from('software_67abc23def')
        .select(`
          *,
          users_67abc23def!software_67abc23def_owner_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedSoftware = data?.map(item => ({
        ...item,
        owner_name: item.users_67abc23def?.name || 'Unassigned'
      })) || [];

      setSoftware(transformedSoftware);
    } catch (error) {
      console.error('Error fetching software:', error);
      setSoftware([]);
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

  const handleEditSoftware = (software) => {
    setEditingSoftware(software);
    setShowSoftwareForm(true);
  };

  const handleDeleteSoftware = async (software) => {
    if (!confirm(`Are you sure you want to delete "${software.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('software_67abc23def')
        .delete()
        .eq('id', software.id);

      if (error) throw error;
      
      setSoftware(prevSoftware => prevSoftware.filter(s => s.id !== software.id));
    } catch (error) {
      console.error('Error deleting software:', error);
      alert('Error deleting software. Please try again.');
    }
  };

  const handleSaveSoftware = async (softwareData) => {
    try {
      if (editingSoftware) {
        const { error } = await supabase
          .from('software_67abc23def')
          .update({ ...softwareData, updated_at: new Date().toISOString() })
          .eq('id', editingSoftware.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('software_67abc23def')
          .insert([{
            ...softwareData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      setShowSoftwareForm(false);
      setEditingSoftware(null);
      fetchSoftware();
    } catch (error) {
      console.error('Error saving software:', error);
      alert('Error saving software. Please try again.');
    }
  };

  const tableColumns = [
    { key: 'name', label: 'Software Name', sortable: true },
    { key: 'version', label: 'Version', sortable: true },
    { key: 'vendor', label: 'Vendor', sortable: true },
    { key: 'use_case', label: 'Use Case', sortable: false },
    {
      key: 'cost',
      label: 'Monthly Cost',
      sortable: true,
      render: (value) => value ? `$${Number(value).toFixed(2)}` : '-'
    },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      sortable: true,
      getBadgeClass: (value) => {
        switch (value) {
          case 'Active': return 'bg-green-100 text-green-800';
          case 'Inactive': return 'bg-gray-100 text-gray-800';
          case 'Expired': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      }
    },
    { key: 'owner_name', label: 'Owner', sortable: true },
    { key: 'license_expires', label: 'License Expires', type: 'date', sortable: true }
  ];

  const totalCost = software.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

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
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiSettings} className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Software Database</h1>
              <p className="text-gray-600">Manage software licenses and subscriptions</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowSoftwareForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add Software</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Software', value: software.length, color: 'bg-purple-100 text-purple-800' },
          { label: 'Active', value: software.filter(s => s.status === 'Active').length, color: 'bg-green-100 text-green-800' },
          { label: 'Expired', value: software.filter(s => s.status === 'Expired').length, color: 'bg-red-100 text-red-800' },
          { label: 'Monthly Cost', value: `$${totalCost.toFixed(2)}`, color: 'bg-blue-100 text-blue-800' }
        ].map((stat, index) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${stat.color}`}>
                {typeof stat.value === 'string' && stat.value.includes('$') ? stat.value : stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <DataTable
        data={software}
        columns={tableColumns}
        title="Software"
        onEdit={handleEditSoftware}
        onDelete={handleDeleteSoftware}
        searchable={true}
      />

      {software.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiSettings} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No software found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first software license.</p>
          <button
            onClick={() => setShowSoftwareForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Software</span>
          </button>
        </div>
      )}

      {showSoftwareForm && (
        <SoftwareForm
          software={editingSoftware}
          users={users}
          onSave={handleSaveSoftware}
          onCancel={() => {
            setShowSoftwareForm(false);
            setEditingSoftware(null);
          }}
        />
      )}
    </div>
  );
};

export default Software;