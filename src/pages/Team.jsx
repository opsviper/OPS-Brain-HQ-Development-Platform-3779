import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import DataTable from '../components/common/DataTable';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiPlus, FiX, FiSave, FiMail, FiPhone } = FiIcons;

const TeamForm = ({ teamMember, teamMembers, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    department: '',
    phone: '',
    manager: '',
    hire_date: '',
    status: 'Active',
    notes: ''
  });

  useEffect(() => {
    if (teamMember) {
      setFormData({
        name: teamMember.name || '',
        role: teamMember.role || '',
        email: teamMember.email || '',
        department: teamMember.department || '',
        phone: teamMember.phone || '',
        manager: teamMember.manager || '',
        hire_date: teamMember.hire_date || '',
        status: teamMember.status || 'Active',
        notes: teamMember.notes || ''
      });
    }
  }, [teamMember]);

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
              {teamMember ? 'Edit Team Member' : 'Add Team Member'}
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
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Job title or role"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiMail} className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="email@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Engineering, Marketing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiPhone} className="w-4 h-4 inline mr-1" />
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Manager</label>
              <select
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select manager</option>
                {teamMembers.filter(member => member.id !== teamMember?.id).map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date</label>
              <input
                type="date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Additional notes about the team member"
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
              <span>{teamMember ? 'Update' : 'Add'} Team Member</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Team = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('team_67abc23def')
        .select(`
          *,
          manager:team_67abc23def!team_67abc23def_manager_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedTeam = data?.map(member => ({
        ...member,
        manager_name: member.manager?.name || 'None'
      })) || [];

      setTeam(transformedTeam);
    } catch (error) {
      console.error('Error fetching team:', error);
      setTeam([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeamMember = (teamMember) => {
    setEditingTeamMember(teamMember);
    setShowTeamForm(true);
  };

  const handleDeleteTeamMember = async (teamMember) => {
    if (!confirm(`Are you sure you want to delete "${teamMember.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('team_67abc23def')
        .delete()
        .eq('id', teamMember.id);

      if (error) throw error;
      
      setTeam(prevTeam => prevTeam.filter(t => t.id !== teamMember.id));
    } catch (error) {
      console.error('Error deleting team member:', error);
      alert('Error deleting team member. Please try again.');
    }
  };

  const handleSaveTeamMember = async (teamData) => {
    try {
      if (editingTeamMember) {
        const { error } = await supabase
          .from('team_67abc23def')
          .update({ ...teamData, updated_at: new Date().toISOString() })
          .eq('id', editingTeamMember.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('team_67abc23def')
          .insert([{
            ...teamData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      setShowTeamForm(false);
      setEditingTeamMember(null);
      fetchTeam();
    } catch (error) {
      console.error('Error saving team member:', error);
      alert('Error saving team member. Please try again.');
    }
  };

  const tableColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: false },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      sortable: true,
      getBadgeClass: (value) => {
        switch (value) {
          case 'Active': return 'bg-green-100 text-green-800';
          case 'Inactive': return 'bg-red-100 text-red-800';
          case 'On Leave': return 'bg-yellow-100 text-yellow-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      }
    },
    { key: 'manager_name', label: 'Manager', sortable: true },
    { key: 'hire_date', label: 'Hire Date', type: 'date', sortable: true }
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
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiUsers} className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Database</h1>
              <p className="text-gray-600">Manage team members and organizational structure</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowTeamForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: team.length, color: 'bg-green-100 text-green-800' },
          { label: 'Active', value: team.filter(t => t.status === 'Active').length, color: 'bg-green-100 text-green-800' },
          { label: 'On Leave', value: team.filter(t => t.status === 'On Leave').length, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Departments', value: new Set(team.map(t => t.department).filter(Boolean)).size, color: 'bg-blue-100 text-blue-800' }
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
        data={team}
        columns={tableColumns}
        title="Team Members"
        onEdit={handleEditTeamMember}
        onDelete={handleDeleteTeamMember}
        searchable={true}
      />

      {team.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiUsers} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first team member.</p>
          <button
            onClick={() => setShowTeamForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        </div>
      )}

      {showTeamForm && (
        <TeamForm
          teamMember={editingTeamMember}
          teamMembers={team}
          onSave={handleSaveTeamMember}
          onCancel={() => {
            setShowTeamForm(false);
            setEditingTeamMember(null);
          }}
        />
      )}
    </div>
  );
};

export default Team;