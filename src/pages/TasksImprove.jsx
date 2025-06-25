import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import TaskCard from '../components/common/TaskCard';
import DataTable from '../components/common/DataTable';
import TaskForm from '../components/forms/TaskForm';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiGrid, FiList, FiPlus, FiTrendingUp } = FiIcons;

const TasksImprove = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [viewMode, setViewMode] = useState('cards');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchProcesses();
  }, [filterStatus]);

  const fetchTasks = async () => {
    try {
      const mockTasks = [
        {
          id: '5',
          title: 'Optimize database queries',
          description: 'Improve query performance and reduce response times',
          task_type: 'improve',
          status: 'To Do',
          priority: 'Medium',
          assignee_name: 'Jane Smith',
          assignee: '2',
          due_date: '2024-01-30',
          process_name: 'System Maintenance',
          process_id: '3',
          created_at: '2024-01-05'
        },
        {
          id: '6',
          title: 'Implement caching strategy',
          description: 'Add Redis caching to improve application performance',
          task_type: 'improve',
          status: 'In Progress',
          priority: 'High',
          assignee_name: 'Bob Wilson',
          assignee: '3',
          due_date: '2024-01-28',
          process_name: 'Client Onboarding',
          process_id: '1',
          created_at: '2024-01-06'
        }
      ];

      try {
        let query = supabase
          .from('tasks')
          .select(`
            *,
            users!tasks_assignee_fkey(name),
            processes(name)
          `)
          .eq('task_type', 'improve');

        if (filterStatus !== 'all') {
          query = query.eq('status', filterStatus);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        const transformedTasks = data?.map(task => ({
          ...task,
          assignee_name: task.users?.name,
          process_name: task.processes?.name
        })) || [];

        setTasks(transformedTasks);
      } catch (error) {
        console.log('Using mock data for development');
        let filteredTasks = mockTasks;
        if (filterStatus !== 'all') {
          filteredTasks = filteredTasks.filter(task => task.status === filterStatus);
        }
        setTasks(filteredTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john@opsviper.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@opsviper.com' },
        { id: '3', name: 'Bob Wilson', email: 'bob@opsviper.com' }
      ];

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email')
          .order('name');

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        setUsers(mockUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProcesses = async () => {
    try {
      const mockProcesses = [
        { id: '1', name: 'Client Onboarding' },
        { id: '2', name: 'Monthly Reporting' },
        { id: '3', name: 'System Maintenance' }
      ];

      try {
        const { data, error } = await supabase
          .from('processes')
          .select('id, name')
          .order('name');

        if (error) throw error;
        setProcesses(data || []);
      } catch (error) {
        setProcesses(mockProcesses);
      }
    } catch (error) {
      console.error('Error fetching processes:', error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks();
    } catch (error) {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', editingTask.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([{ ...taskData, task_type: 'improve' }]);

        if (error) throw error;
      }
      
      setShowTaskForm(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.log('Mock save for development');
      setShowTaskForm(false);
      setEditingTask(null);
    }
  };

  const tableColumns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'description', label: 'Description', sortable: false },
    { key: 'status', label: 'Status', type: 'badge', sortable: true,
      getBadgeClass: (value) => {
        switch (value) {
          case 'Done': return 'bg-green-100 text-green-800';
          case 'In Progress': return 'bg-blue-100 text-blue-800';
          case 'To Do': return 'bg-gray-100 text-gray-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      }
    },
    { key: 'priority', label: 'Priority', type: 'badge', sortable: true,
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
    { key: 'assignee_name', label: 'Assignee', sortable: true },
    { key: 'due_date', label: 'Due Date', type: 'date', sortable: true },
    { key: 'process_name', label: 'Process', sortable: true }
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
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiTrendingUp} className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Improve Tasks</h1>
              <p className="text-gray-600">Improvement and optimization tasks</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 rounded-l-lg ${
                viewMode === 'cards' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SafeIcon icon={FiGrid} className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-r-lg ${
                viewMode === 'table' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SafeIcon icon={FiList} className="w-4 h-4" />
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>

          {/* Add Task Button */}
          <button
            onClick={() => setShowTaskForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Improve Task</span>
          </button>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Improve Tasks', value: tasks.length, color: 'bg-green-100 text-green-800' },
          { label: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: 'bg-blue-100 text-blue-800' },
          { label: 'To Do', value: tasks.filter(t => t.status === 'To Do').length, color: 'bg-gray-100 text-gray-800' },
          { label: 'Completed', value: tasks.filter(t => t.status === 'Done').length, color: 'bg-green-100 text-green-800' }
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

      {/* Content */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <DataTable
          data={tasks}
          columns={tableColumns}
          title="Improve Tasks"
          onEdit={handleEditTask}
          searchable={true}
        />
      )}

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiTrendingUp} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No improvement tasks found</h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first improvement task.
          </p>
          <button
            onClick={() => setShowTaskForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Improve Task</span>
          </button>
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          taskType="improve"
          users={users}
          processes={processes}
          onSave={handleSaveTask}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default TasksImprove;