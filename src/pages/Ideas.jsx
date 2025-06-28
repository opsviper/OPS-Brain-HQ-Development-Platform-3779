import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import DataTable from '../components/common/DataTable';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiLightbulb, FiPlus, FiX, FiSave } = FiIcons;

const IdeaForm = ({ idea, users, processes, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    description: '',
    source: '',
    status: 'New',
    priority: 'Medium',
    process_id: '',
    submitted_by: '',
    estimated_effort: '',
    expected_benefit: '',
    implementation_date: ''
  });

  useEffect(() => {
    if (idea) {
      setFormData({
        title: idea.title || '',
        summary: idea.summary || '',
        description: idea.description || '',
        source: idea.source || '',
        status: idea.status || 'New',
        priority: idea.priority || 'Medium',
        process_id: idea.process_id || '',
        submitted_by: idea.submitted_by || '',
        estimated_effort: idea.estimated_effort || '',
        expected_benefit: idea.expected_benefit || '',
        implementation_date: idea.implementation_date || ''
      });
    }
  }, [idea]);

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
              {idea ? 'Edit Idea' : 'Submit New Idea'}
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
                Idea Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter a clear, concise title for your idea"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
              <input
                type="text"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="One-line summary of the idea"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Detailed description of the idea, its benefits, and how it could be implemented"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Where did this idea come from?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
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
                <option value="New">New</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Implemented">Implemented</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Related Process</label>
              <select
                name="process_id"
                value={formData.process_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select related process</option>
                {processes.map(process => (
                  <option key={process.id} value={process.id}>{process.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Submitted By</label>
              <select
                name="submitted_by"
                value={formData.submitted_by}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select submitter</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Effort</label>
              <input
                type="text"
                name="estimated_effort"
                value={formData.estimated_effort}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 2-3 weeks, 1 month"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Benefit</label>
              <input
                type="text"
                name="expected_benefit"
                value={formData.expected_benefit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="What benefits will this provide?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Implementation Date</label>
              <input
                type="date"
                name="implementation_date"
                value={formData.implementation_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              <span>{idea ? 'Update' : 'Submit'} Idea</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Ideas = () => {
  const [ideas, setIdeas] = useState([]);
  const [users, setUsers] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);

  useEffect(() => {
    fetchIdeas();
    fetchUsers();
    fetchProcesses();
  }, []);

  const fetchIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas_67abc23def')
        .select(`
          *,
          users_67abc23def!ideas_67abc23def_submitted_by_fkey(name),
          processes_67abc23def(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedIdeas = data?.map(idea => ({
        ...idea,
        submitted_by_name: idea.users_67abc23def?.name || 'Unknown',
        process_name: idea.processes_67abc23def?.name || 'None'
      })) || [];

      setIdeas(transformedIdeas);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      setIdeas([]);
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

  const fetchProcesses = async () => {
    try {
      const { data, error } = await supabase
        .from('processes_67abc23def')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setProcesses(data || []);
    } catch (error) {
      console.error('Error fetching processes:', error);
      setProcesses([]);
    }
  };

  const handleEditIdea = (idea) => {
    setEditingIdea(idea);
    setShowIdeaForm(true);
  };

  const handleDeleteIdea = async (idea) => {
    if (!confirm(`Are you sure you want to delete "${idea.title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ideas_67abc23def')
        .delete()
        .eq('id', idea.id);

      if (error) throw error;
      
      setIdeas(prevIdeas => prevIdeas.filter(i => i.id !== idea.id));
    } catch (error) {
      console.error('Error deleting idea:', error);
      alert('Error deleting idea. Please try again.');
    }
  };

  const handleSaveIdea = async (ideaData) => {
    try {
      if (editingIdea) {
        const { error } = await supabase
          .from('ideas_67abc23def')
          .update({ ...ideaData, updated_at: new Date().toISOString() })
          .eq('id', editingIdea.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ideas_67abc23def')
          .insert([{
            ...ideaData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      setShowIdeaForm(false);
      setEditingIdea(null);
      fetchIdeas();
    } catch (error) {
      console.error('Error saving idea:', error);
      alert('Error saving idea. Please try again.');
    }
  };

  const tableColumns = [
    { key: 'title', label: 'Idea Title', sortable: true },
    { key: 'summary', label: 'Summary', sortable: false },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      sortable: true,
      getBadgeClass: (value) => {
        switch (value) {
          case 'New': return 'bg-blue-100 text-blue-800';
          case 'Under Review': return 'bg-yellow-100 text-yellow-800';
          case 'Approved': return 'bg-green-100 text-green-800';
          case 'Rejected': return 'bg-red-100 text-red-800';
          case 'Implemented': return 'bg-purple-100 text-purple-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      }
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'badge',
      sortable: true,
      getBadgeClass: (value) => {
        switch (value) {
          case 'Critical': return 'bg-red-100 text-red-800';
          case 'High': return 'bg-orange-100 text-orange-800';
          case 'Medium': return 'bg-yellow-100 text-yellow-800';
          case 'Low': return 'bg-green-100 text-green-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      }
    },
    { key: 'submitted_by_name', label: 'Submitted By', sortable: true },
    { key: 'estimated_effort', label: 'Effort', sortable: true },
    { key: 'implementation_date', label: 'Target Date', type: 'date', sortable: true }
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
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiLightbulb} className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ideas Database</h1>
              <p className="text-gray-600">Innovation and improvement suggestions</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowIdeaForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Submit Idea</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Ideas', value: ideas.length, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'New', value: ideas.filter(i => i.status === 'New').length, color: 'bg-blue-100 text-blue-800' },
          { label: 'Under Review', value: ideas.filter(i => i.status === 'Under Review').length, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Approved', value: ideas.filter(i => i.status === 'Approved').length, color: 'bg-green-100 text-green-800' },
          { label: 'Implemented', value: ideas.filter(i => i.status === 'Implemented').length, color: 'bg-purple-100 text-purple-800' }
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
        data={ideas}
        columns={tableColumns}
        title="Ideas"
        onEdit={handleEditIdea}
        onDelete={handleDeleteIdea}
        searchable={true}
      />

      {ideas.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiLightbulb} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas yet</h3>
          <p className="text-gray-600 mb-4">Share your first improvement idea with the team.</p>
          <button
            onClick={() => setShowIdeaForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Submit Idea</span>
          </button>
        </div>
      )}

      {showIdeaForm && (
        <IdeaForm
          idea={editingIdea}
          users={users}
          processes={processes}
          onSave={handleSaveIdea}
          onCancel={() => {
            setShowIdeaForm(false);
            setEditingIdea(null);
          }}
        />
      )}
    </div>
  );
};

export default Ideas;