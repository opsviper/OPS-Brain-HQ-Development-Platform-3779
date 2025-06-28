import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import DataTable from '../components/common/DataTable';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTool, FiPlus, FiX, FiSave } = FiIcons;

const EquipmentForm = ({ equipment, users, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    model: '',
    serial_number: '',
    owner: '',
    purchase_date: '',
    last_maintained: '',
    next_maintenance: '',
    status: 'Active',
    location: '',
    notes: ''
  });

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        category: equipment.category || '',
        model: equipment.model || '',
        serial_number: equipment.serial_number || '',
        owner: equipment.owner || '',
        purchase_date: equipment.purchase_date || '',
        last_maintained: equipment.last_maintained || '',
        next_maintenance: equipment.next_maintenance || '',
        status: equipment.status || 'Active',
        location: equipment.location || '',
        notes: equipment.notes || ''
      });
    }
  }, [equipment]);

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
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {equipment ? 'Edit Equipment' : 'Add Equipment'}
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
                Equipment Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter equipment name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Hardware, Networking"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Equipment model"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Serial number"
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
                <option value="Maintenance">Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Physical location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Maintained</label>
              <input
                type="date"
                name="last_maintained"
                value={formData.last_maintained}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Next Maintenance</label>
              <input
                type="date"
                name="next_maintenance"
                value={formData.next_maintenance}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                placeholder="Additional notes or specifications"
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
              <span>{equipment ? 'Update' : 'Create'} Equipment</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);

  useEffect(() => {
    fetchEquipment();
    fetchUsers();
  }, []);

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment_67abc23def')
        .select(`
          *,
          users_67abc23def!equipment_67abc23def_owner_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedEquipment = data?.map(item => ({
        ...item,
        owner_name: item.users_67abc23def?.name || 'Unassigned'
      })) || [];

      setEquipment(transformedEquipment);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setEquipment([]);
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

  const handleEditEquipment = (equipment) => {
    setEditingEquipment(equipment);
    setShowEquipmentForm(true);
  };

  const handleDeleteEquipment = async (equipment) => {
    if (!confirm(`Are you sure you want to delete "${equipment.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('equipment_67abc23def')
        .delete()
        .eq('id', equipment.id);

      if (error) throw error;
      
      setEquipment(prevEquipment => prevEquipment.filter(e => e.id !== equipment.id));
    } catch (error) {
      console.error('Error deleting equipment:', error);
      alert('Error deleting equipment. Please try again.');
    }
  };

  const handleSaveEquipment = async (equipmentData) => {
    try {
      if (editingEquipment) {
        const { error } = await supabase
          .from('equipment_67abc23def')
          .update({ ...equipmentData, updated_at: new Date().toISOString() })
          .eq('id', editingEquipment.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('equipment_67abc23def')
          .insert([{
            ...equipmentData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      setShowEquipmentForm(false);
      setEditingEquipment(null);
      fetchEquipment();
    } catch (error) {
      console.error('Error saving equipment:', error);
      alert('Error saving equipment. Please try again.');
    }
  };

  const tableColumns = [
    { key: 'name', label: 'Equipment Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'model', label: 'Model', sortable: true },
    { key: 'serial_number', label: 'Serial Number', sortable: true },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      sortable: true,
      getBadgeClass: (value) => {
        switch (value) {
          case 'Active': return 'bg-green-100 text-green-800';
          case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
          case 'Retired': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      }
    },
    { key: 'owner_name', label: 'Owner', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'purchase_date', label: 'Purchase Date', type: 'date', sortable: true }
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
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiTool} className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Equipment Database</h1>
              <p className="text-gray-600">Track and manage physical equipment</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowEquipmentForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add Equipment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Equipment', value: equipment.length, color: 'bg-orange-100 text-orange-800' },
          { label: 'Active', value: equipment.filter(e => e.status === 'Active').length, color: 'bg-green-100 text-green-800' },
          { label: 'Maintenance', value: equipment.filter(e => e.status === 'Maintenance').length, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Retired', value: equipment.filter(e => e.status === 'Retired').length, color: 'bg-red-100 text-red-800' }
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
        data={equipment}
        columns={tableColumns}
        title="Equipment"
        onEdit={handleEditEquipment}
        onDelete={handleDeleteEquipment}
        searchable={true}
      />

      {equipment.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiTool} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first piece of equipment.</p>
          <button
            onClick={() => setShowEquipmentForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Equipment</span>
          </button>
        </div>
      )}

      {showEquipmentForm && (
        <EquipmentForm
          equipment={editingEquipment}
          users={users}
          onSave={handleSaveEquipment}
          onCancel={() => {
            setShowEquipmentForm(false);
            setEditingEquipment(null);
          }}
        />
      )}
    </div>
  );
};

export default Equipment;