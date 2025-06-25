import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import TaskCard from '../components/common/TaskCard';
import DataTable from '../components/common/DataTable';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiGrid, FiList, FiPlus, FiFilter, FiCheckSquare } = FiIcons;

const Tasks = () => {
  const { taskType } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [viewMode, setViewMode] = useState('cards');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const taskTypes = {
    react: 'React Tasks',
    maintain: 'Maintain Tasks',
    improve: 'Improve Tasks'
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [taskType, filterStatus]);

  const fetchTasks = async () => {
    try {
      // Mock data for development when Supabase is not connected
      const mockTasks = [
        {
          id: '1',
          title: 'Update client portal',
          description: 'Implement new features for client portal',
          task_type: 'react',
          status: 'In Progress',
          priority: 'High',
          assignee_name: 'John Doe',
          due_date: '2024-01-15',
          created_at: '2024-01-01'
        },
        {
          id: '2',
          title: 'Database backup',
          description: 'Perform weekly database backup',
          task_type: 'maintain',
          status: 'To Do',
          priority: 'Medium',
          assignee_name: 'Jane Smith',
          due_date: '2024-01-20',
          created_at: '2024-01-02'
        },
        {
          id: '3',
          title: 'Optimize query performance',
          description: 'Improve database query performance',
          task_type: 'improve',
          status: 'Done',
          priority: 'Low',
          assignee_name: 'Bob Wilson',
          due_date: '2024-01-10',
          created_at: '2024-01-03'
        }
      ];

      try {
        let query = supabase
          .from('tasks')
          .select(`
            *,
            users!tasks_assignee_fkey(name),
            processes(name)
          `);

        if (taskType && taskType !== 'all') {
          query = query.eq('task_type', taskType);
        }

        if (filterStatus !== 'all') {
          query = query.eq('status', filterStatus);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to include assignee name
        const transformedTasks = data?.map(task => ({
          ...task,
          assignee_name: task.users?.name,
          process_name: task.processes?.name
        })) || [];

        setTasks(transformedTasks);
      } catch (error) {
        console.log('Using mock data for development');
        // Filter mock data based on current filters
        let filteredMockTasks = mockTasks;
        
        if (taskType && taskType !== 'all') {
          filteredMockTasks = filteredMockTasks.filter(task => task.task_type === taskType);
        }
        
        if (filterStatus !== 'all') {
          filteredMockTasks = filteredMockTasks.filter(task => task.status === filterStatus);
        }
        
        setTasks(filteredMockTasks);
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
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
        { id: '3', name: 'Bob Wilson', email: 'bob@example.com' }
      ];

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email')
          .order('name');

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.log('Using mock users for development');
        setUsers(mockUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      
      fetchTasks(); // Refresh tasks
    } catch (error) {
      console.log('Mock status change for development');
      // Update local state for demo
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

  const tableColumns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'task_type', label: 'Type', type: 'badge', sortable: true,
      getBadgeClass: (value) => {
        switch (value) {
          case 'react': return 'bg-purple-100 text-purple-800';
          case 'maintain': return 'bg-blue-100 text-blue-800';
          case 'improve': return 'bg-green-100 text-green-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      }
    },
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
    { key: 'due_date', label: 'Due Date', type: 'date', sortable: true }
  ];

  const currentTitle = taskType ? taskTypes[taskType] : 'All Tasks';

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
          <h1 className="text-2xl font-bold text-gray-900">{currentTitle}</h1>
          <p className="text-gray-600">Manage and track your {taskType || 'all'} tasks</p>
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
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task Type Navigation */}
      <div className="flex space-x-4 border-b border-gray-200">
        {[
          { key: 'all', label: 'All Tasks' },
          { key: 'react', label: 'React' },
          { key: 'maintain', label: 'Maintain' },
          { key: 'improve', label: 'Improve' }
        ].map((type) => (
          <button
            key={type.key}
            onClick={() => navigate(`/tasks/${type.key}`)}
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              (taskType === type.key) || (type.key === 'all' && !taskType)
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task, index) => (
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
          title={currentTitle}
          onEdit={handleEditTask}
          searchable={true}
        />
      )}

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiCheckSquare} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first {taskType || ''} task.
          </p>
          <button
            onClick={() => setShowTaskForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Tasks;