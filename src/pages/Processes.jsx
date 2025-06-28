import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import DataTable from '../components/common/DataTable';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiLayers, FiPlus, FiExternalLink, FiUsers, FiMonitor, FiTool, FiSettings, FiX, FiSave, FiUser, FiCalendar, FiLightbulb, FiCheckSquare, FiCode, FiTrendingUp } = FiIcons;

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
    setFormData(prev => ({ ...prev, [name]: value }));
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
        {options.length > 0 ? options.map(option => (
          <label key={option.id} className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={selectedItems.includes(option.id)}
              onChange={() => handleMultiSelect(field, option.id)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">{option.name}</span>
          </label>
        )) : (
          <p className="text-sm text-gray-500 italic">No items available</p>
        )}
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

const ProcessDetailModal = ({ process, onClose }) => {
  const [relatedData, setRelatedData] = useState({
    tasks: [],
    events: [],
    ideas: [],
    loading: true
  });

  useEffect(() => {
    if (process) {
      fetchRelatedData();
    }
  }, [process]);

  const fetchRelatedData = async () => {
    try {
      const [tasksResponse, eventsResponse, ideasResponse] = await Promise.all([
        supabase
          .from('tasks_67abc23def')
          .select('id, title, task_type, status, priority')
          .eq('process_id', process.id),
        supabase
          .from('key_events_67abc23def')
          .select('id, title, event_type, event_date, status')
          .eq('process_id', process.id),
        supabase
          .from('ideas_67abc23def')
          .select('id, title, status, priority')
          .eq('process_id', process.id)
      ]);

      setRelatedData({
        tasks: tasksResponse.data || [],
        events: eventsResponse.data || [],
        ideas: ideasResponse.data || [],
        loading: false
      });
    } catch (error) {
      console.error('Error fetching related data:', error);
      setRelatedData({ tasks: [], events: [], ideas: [], loading: false });
    }
  };

  const getTaskTypeIcon = (taskType) => {
    switch (taskType) {
      case 'react': return FiCode;
      case 'maintain': return FiTool;
      case 'improve': return FiTrendingUp;
      default: return FiCheckSquare;
    }
  };

  const getTaskTypeColor = (taskType) => {
    switch (taskType) {
      case 'react': return 'bg-purple-100 text-purple-800';
      case 'maintain': return 'bg-blue-100 text-blue-800';
      case 'improve': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'done': 
      case 'completed':
      case 'implemented': return 'bg-green-100 text-green-800';
      case 'in progress':
      case 'under review': return 'bg-blue-100 text-blue-800';
      case 'to do':
      case 'new':
      case 'planned': return 'bg-gray-100 text-gray-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
                <h2 className="text-xl font-semibold text-gray-900">{process.name}</h2>
                <p className="text-sm text-gray-500">Process relationships and activities</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Process Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Status</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                process.status === 'Live' ? 'bg-green-100 text-green-800' :
                process.status === 'Planned' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {process.status}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Owner</h4>
              <p className="text-sm text-gray-600">{process.owner_name || 'Unassigned'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">SOP</h4>
              {process.sop_url ? (
                <a
                  href={process.sop_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-800 text-sm flex items-center space-x-1"
                >
                  <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                  <span>View SOP</span>
                </a>
              ) : (
                <span className="text-sm text-gray-400">No SOP</span>
              )}
            </div>
          </div>

          {process.description && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-600">{process.description}</p>
            </div>
          )}

          {/* Related Items */}
          {relatedData.loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Related Tasks */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <SafeIcon icon={FiCheckSquare} className="w-4 h-4" />
                  <span>Related Tasks ({relatedData.tasks.length})</span>
                </h4>
                <div className="space-y-2">
                  {relatedData.tasks.length > 0 ? relatedData.tasks.map(task => (
                    <div key={task.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-sm text-gray-900">{task.title}</h5>
                        <SafeIcon
                          icon={getTaskTypeIcon(task.task_type)}
                          className="w-4 h-4 text-gray-400 flex-shrink-0"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(task.task_type)}`}>
                          {task.task_type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 italic">No related tasks</p>
                  )}
                </div>
              </div>

              {/* Related Events */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                  <span>Related Events ({relatedData.events.length})</span>
                </h4>
                <div className="space-y-2">
                  {relatedData.events.length > 0 ? relatedData.events.map(event => (
                    <div key={event.id} className="bg-gray-50 rounded-lg p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">{event.title}</h5>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.event_type === 'Technical' ? 'bg-blue-100 text-blue-800' :
                          event.event_type === 'Business' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.event_type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      {event.event_date && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(event.event_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 italic">No related events</p>
                  )}
                </div>
              </div>

              {/* Related Ideas */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <SafeIcon icon={FiLightbulb} className="w-4 h-4" />
                  <span>Related Ideas ({relatedData.ideas.length})</span>
                </h4>
                <div className="space-y-2">
                  {relatedData.ideas.length > 0 ? relatedData.ideas.map(idea => (
                    <div key={idea.id} className="bg-gray-50 rounded-lg p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">{idea.title}</h5>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                          {idea.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          idea.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                          idea.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                          idea.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {idea.priority}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-gray-500 italic">No related ideas</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const Processes = () => {
  const [processes, setProcesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [systems, setSystems] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [software, setSoftware] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [showProcessDetail, setShowProcessDetail] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null);

  useEffect(() => {
    fetchProcesses();
    fetchUsers();
    fetchSystems();
    fetchEquipment();
    fetchSoftware();
    fetchTeam();
  }, []);

  const fetchProcesses = async () => {
    try {
      const { data, error } = await supabase
        .from('processes_67abc23def')
        .select(`
          *,
          users_67abc23def!processes_67abc23def_owner_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch relationship counts for each process
      const processesWithCounts = await Promise.all(
        (data || []).map(async (process) => {
          try {
            const [tasksCount, eventsCount, ideasCount] = await Promise.all([
              supabase
                .from('tasks_67abc23def')
                .select('id', { count: 'exact' })
                .eq('process_id', process.id),
              supabase
                .from('key_events_67abc23def')
                .select('id', { count: 'exact' })
                .eq('process_id', process.id),
              supabase
                .from('ideas_67abc23def')
                .select('id', { count: 'exact' })
                .eq('process_id', process.id)
            ]);

            return {
              ...process,
              owner_name: process.users_67abc23def?.name || 'Unassigned',
              tasks_count: tasksCount.count || 0,
              events_count: eventsCount.count || 0,
              ideas_count: ideasCount.count || 0
            };
          } catch (error) {
            console.error('Error fetching counts for process:', process.id, error);
            return {
              ...process,
              owner_name: process.users_67abc23def?.name || 'Unassigned',
              tasks_count: 0,
              events_count: 0,
              ideas_count: 0
            };
          }
        })
      );

      setProcesses(processesWithCounts);
    } catch (error) {
      console.error('Error fetching processes:', error);
      setProcesses([]);
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

  const fetchSystems = async () => {
    try {
      const { data, error } = await supabase
        .from('systems_67abc23def')
        .select('id, name, type')
        .order('name');

      if (error) throw error;
      setSystems(data || []);
    } catch (error) {
      console.error('Error fetching systems:', error);
      setSystems([]);
    }
  };

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment_67abc23def')
        .select('id, name, category')
        .order('name');

      if (error) throw error;
      setEquipment(data || []);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setEquipment([]);
    }
  };

  const fetchSoftware = async () => {
    try {
      const { data, error } = await supabase
        .from('software_67abc23def')
        .select('id, name, use_case')
        .order('name');

      if (error) throw error;
      setSoftware(data || []);
    } catch (error) {
      console.error('Error fetching software:', error);
      setSoftware([]);
    }
  };

  const fetchTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('team_67abc23def')
        .select('id, name, role')
        .order('name');

      if (error) throw error;
      setTeam(data || []);
    } catch (error) {
      console.error('Error fetching team:', error);
      setTeam([]);
    }
  };

  const handleEditProcess = (process) => {
    setEditingProcess(process);
    setShowProcessForm(true);
  };

  const handleViewProcess = (process) => {
    setSelectedProcess(process);
    setShowProcessDetail(true);
  };

  const handleDeleteProcess = async (process) => {
    if (!confirm(`Are you sure you want to delete "${process.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('processes_67abc23def')
        .delete()
        .eq('id', process.id);

      if (error) throw error;
      
      setProcesses(prevProcesses => prevProcesses.filter(p => p.id !== process.id));
    } catch (error) {
      console.error('Error deleting process:', error);
      alert('Error deleting process. Please try again.');
    }
  };

  const handleSaveProcess = async (processData) => {
    try {
      if (editingProcess) {
        const { error } = await supabase
          .from('processes_67abc23def')
          .update({ ...processData, updated_at: new Date().toISOString() })
          .eq('id', editingProcess.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('processes_67abc23def')
          .insert([{
            ...processData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      setShowProcessForm(false);
      setEditingProcess(null);
      fetchProcesses();
    } catch (error) {
      console.error('Error saving process:', error);
      alert('Error saving process. Please try again.');
    }
  };

  const tableColumns = [
    { 
      key: 'name', 
      label: 'Process Name', 
      sortable: true,
      render: (value, row) => (
        <button
          onClick={() => handleViewProcess(row)}
          className="text-left hover:text-primary-600 font-medium"
        >
          {value}
        </button>
      )
    },
    { key: 'description', label: 'Description', sortable: false },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      sortable: true,
      getBadgeClass: (value) => {
        switch (value) {
          case 'Live': return 'bg-green-100 text-green-800';
          case 'Planned': return 'bg-blue-100 text-blue-800';
          case 'Deprecated': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      }
    },
    { key: 'owner_name', label: 'Owner', sortable: true },
    {
      key: 'tasks_count',
      label: 'Tasks',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
          {value}
        </span>
      )
    },
    {
      key: 'events_count',
      label: 'Events',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {value}
        </span>
      )
    },
    {
      key: 'ideas_count',
      label: 'Ideas',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
          {value}
        </span>
      )
    },
    {
      key: 'sop_url',
      label: 'SOP',
      sortable: false,
      render: (value) => value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:text-primary-800"
        >
          <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
        </a>
      ) : (
        <span className="text-gray-400">-</span>
      )
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiLayers} className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Process Database</h1>
              <p className="text-gray-600">Manage operational processes with linked tasks, events, and ideas</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowProcessForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add Process</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Processes', value: processes.length, color: 'bg-primary-100 text-primary-800' },
          { label: 'Live Processes', value: processes.filter(p => p.status === 'Live').length, color: 'bg-green-100 text-green-800' },
          { label: 'Linked Tasks', value: processes.reduce((sum, p) => sum + p.tasks_count, 0), color: 'bg-purple-100 text-purple-800' },
          { label: 'Linked Events', value: processes.reduce((sum, p) => sum + p.events_count, 0), color: 'bg-blue-100 text-blue-800' },
          { label: 'Linked Ideas', value: processes.reduce((sum, p) => sum + p.ideas_count, 0), color: 'bg-yellow-100 text-yellow-800' }
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

      {/* Processes Table */}
      <DataTable
        data={processes}
        columns={tableColumns}
        title="Processes"
        onAdd={() => setShowProcessForm(true)}
        onEdit={handleEditProcess}
        onDelete={handleDeleteProcess}
        searchable={true}
      />

      {processes.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiLayers} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No processes found</h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first process.
          </p>
          <button
            onClick={() => setShowProcessForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Process</span>
          </button>
        </div>
      )}

      {/* Process Form Modal */}
      {showProcessForm && (
        <ProcessForm
          process={editingProcess}
          users={users}
          systems={systems}
          equipment={equipment}
          software={software}
          team={team}
          onSave={handleSaveProcess}
          onCancel={() => {
            setShowProcessForm(false);
            setEditingProcess(null);
          }}
        />
      )}

      {/* Process Detail Modal */}
      {showProcessDetail && selectedProcess && (
        <ProcessDetailModal
          process={selectedProcess}
          onClose={() => {
            setShowProcessDetail(false);
            setSelectedProcess(null);
          }}
        />
      )}
    </div>
  );
};

export default Processes;