import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import DataTable from '../components/common/DataTable';
import ProcessForm from '../components/forms/ProcessForm';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiLayers, FiPlus, FiExternalLink, FiUsers, FiMonitor, FiTool, FiSettings } = FiIcons;

const Processes = () => {
  const [processes, setProcesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [systems, setSystems] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [software, setSoftware] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);

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

      const transformedProcesses = data?.map(process => ({
        ...process,
        owner_name: process.users_67abc23def?.name,
        systems_count: 0, // Will implement relationships later
        equipment_count: 0,
        software_count: 0,
        team_count: 0,
        tasks_count: 0
      })) || [];

      setProcesses(transformedProcesses);
    } catch (error) {
      console.error('Error fetching processes:', error);
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
    }
  };

  const handleEditProcess = (process) => {
    setEditingProcess(process);
    setShowProcessForm(true);
  };

  const handleSaveProcess = async (processData) => {
    try {
      if (editingProcess) {
        const { error } = await supabase
          .from('processes_67abc23def')
          .update(processData)
          .eq('id', editingProcess.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('processes_67abc23def')
          .insert([processData]);

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
    { key: 'name', label: 'Process Name', sortable: true },
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
              <p className="text-gray-600">Manage operational processes and SOPs</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Processes', value: processes.length, color: 'bg-primary-100 text-primary-800' },
          { label: 'Live Processes', value: processes.filter(p => p.status === 'Live').length, color: 'bg-green-100 text-green-800' },
          { label: 'Planned Processes', value: processes.filter(p => p.status === 'Planned').length, color: 'bg-blue-100 text-blue-800' },
          { label: 'With SOPs', value: processes.filter(p => p.sop_url).length, color: 'bg-purple-100 text-purple-800' }
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
        onEdit={handleEditProcess}
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
    </div>
  );
};

export default Processes;