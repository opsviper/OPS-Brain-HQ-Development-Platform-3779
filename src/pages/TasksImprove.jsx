import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import TaskCard from '../components/common/TaskCard';
import DataTable from '../components/common/DataTable';
import TaskForm from '../components/forms/TaskForm';
import TaskComments from '../components/common/TaskComments';
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
  const [showComments, setShowComments] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchProcesses();
  }, [filterStatus]);

  const fetchTasks = async () => {
    try {
      let query = supabase
        .from('tasks_67abc23def')
        .select(`
          *,
          users_67abc23def!tasks_67abc23def_assignee_fkey(name),
          processes_67abc23def(name)
        `)
        .eq('task_type', 'improve');

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch comment counts for each task
      const tasksWithComments = await Promise.all(
        (data || []).map(async (task) => {
          try {
            const { count } = await supabase
              .from('task_comments_67abc23def')
              .select('*', { count: 'exact', head: true })
              .eq('task_id', task.id);

            return {
              ...task,
              assignee_name: task.users_67abc23def?.name,
              process_name: task.processes_67abc23def?.name,
              comments_count: count || 0
            };
          } catch (error) {
            console.error('Error fetching comment count for task:', task.id, error);
            return {
              ...task,
              assignee_name: task.users_67abc23def?.name,
              process_name: task.processes_67abc23def?.name,
              comments_count: 0
            };
          }
        })
      );

      setTasks(tasksWithComments);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
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

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tasks_67abc23def')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Error updating task status. Please try again.');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleOpenComments = (task) => {
    setSelectedTask(task);
    setShowComments(true);
  };

  const handleDeleteTask = async (task) => {
    if (!confirm(`Are you sure you want to delete "${task.title}"?`)) {
      return;
    }

    try {
      // First delete all comments for this task
      await supabase
        .from('task_comments_67abc23def')
        .delete()
        .eq('task_id', task.id);

      // Then delete the task
      const { error } = await supabase
        .from('tasks_67abc23def')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      setTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task. Please try again.');
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        const { error } = await supabase
          .from('tasks_67abc23def')
          .update({
            ...taskData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTask.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tasks_67abc23def')
          .insert([{
            ...taskData,
            task_type: 'improve',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      setShowTaskForm(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error saving task. Please try again.');
    }
  };

  const tableColumns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'description', label: 'Description', sortable: false },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      sortable: true,
      getBadgeClass: (value) => {
        switch (value) {
          case 'Done': return 'bg-green-100 text-green-800';
          case 'In Progress': return 'bg-blue-100 text-blue-800';
          case 'To Do': return 'bg-gray-100 text-gray-800';
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
    { key: 'assignee_name', label: 'Assignee', sortable: true },
    { key: 'due_date', label: 'Due Date', type: 'date', sortable: true },
    { key: 'process_name', label: 'Process', sortable: true },
    {
      key: 'comments_count',
      label: 'Comments',
      sortable: true,
      render: (value, row) => (
        <button
          onClick={() => handleOpenComments(row)}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
        >
          <SafeIcon icon={FiIcons.FiMessageCircle} className="w-4 h-4" />
          <span>{value || 0}</span>
        </button>
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
          <div className="flex rounded-lg border border-gray-300">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 rounded-l-lg ${
                viewMode === 'cards' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SafeIcon icon={FiGrid} className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-r-lg ${
                viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SafeIcon icon={FiList} className="w-4 h-4" />
            </button>
          </div>

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
              onOpenComments={handleOpenComments}
            />
          ))}
        </div>
      ) : (
        <DataTable
          data={tasks}
          columns={tableColumns}
          title="Improve Tasks"
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
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

      {/* Comments Modal */}
      <TaskComments
        taskId={selectedTask?.id}
        isOpen={showComments}
        onClose={() => {
          setShowComments(false);
          setSelectedTask(null);
          fetchTasks();
        }}
      />
    </div>
  );
};

export default TasksImprove;