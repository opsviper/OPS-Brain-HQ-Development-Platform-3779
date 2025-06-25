import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { supabase } from '../config/supabase';
import ReactECharts from 'echarts-for-react';

const { FiCheckSquare, FiClock, FiTrendingUp, FiUsers, FiAlertTriangle } = FiIcons;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    activeProcesses: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [tasksByType, setTasksByType] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data for development
      const mockTasks = [
        {
          id: '1',
          title: 'Update client portal',
          task_type: 'react',
          status: 'In Progress',
          users: { name: 'John Doe' }
        },
        {
          id: '2',
          title: 'Database backup',
          task_type: 'maintain',
          status: 'To Do',
          users: { name: 'Jane Smith' }
        },
        {
          id: '3',
          title: 'Optimize performance',
          task_type: 'improve',
          status: 'Done',
          users: { name: 'Bob Wilson' }
        }
      ];

      try {
        // Fetch task statistics
        const { data: tasks } = await supabase
          .from('tasks')
          .select('*, users(name)');

        if (tasks && tasks.length > 0) {
          const totalTasks = tasks.length;
          const completedTasks = tasks.filter(task => task.status === 'Done').length;
          const overdueTasks = tasks.filter(task => 
            task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Done'
          ).length;

          setStats(prev => ({
            ...prev,
            totalTasks,
            completedTasks,
            overdueTasks
          }));

          // Recent tasks
          setRecentTasks(tasks.slice(0, 5));

          // Tasks by type
          const taskTypeData = ['react', 'maintain', 'improve'].map(type => ({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            value: tasks.filter(task => task.task_type === type).length
          }));
          setTasksByType(taskTypeData);
        } else {
          throw new Error('No data from Supabase');
        }
      } catch (error) {
        console.log('Using mock data for development');
        // Use mock data
        const totalTasks = mockTasks.length;
        const completedTasks = mockTasks.filter(task => task.status === 'Done').length;
        const overdueTasks = 0;

        setStats({
          totalTasks,
          completedTasks,
          overdueTasks,
          activeProcesses: 3
        });

        setRecentTasks(mockTasks);

        const taskTypeData = ['react', 'maintain', 'improve'].map(type => ({
          name: type.charAt(0).toUpperCase() + type.slice(1),
          value: mockTasks.filter(task => task.task_type === type).length
        }));
        setTasksByType(taskTypeData);
      }

      // Mock process count
      setStats(prev => ({
        ...prev,
        activeProcesses: 3
      }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: FiCheckSquare,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      icon: FiTrendingUp,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Overdue',
      value: stats.overdueTasks,
      icon: FiAlertTriangle,
      color: 'bg-red-500',
      change: '-3%'
    },
    {
      title: 'Active Processes',
      value: stats.activeProcesses,
      icon: FiUsers,
      color: 'bg-purple-500',
      change: '+5%'
    }
  ];

  const chartOptions = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: 'Tasks',
        type: 'pie',
        radius: '50%',
        data: tasksByType,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to OPS Brain HQ - Your operations command center</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <SafeIcon icon={stat.icon} className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="ml-2 text-sm font-medium text-green-600">{stat.change}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Type Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Type</h3>
          <div className="h-64">
            <ReactECharts option={chartOptions} style={{ height: '100%', width: '100%' }} />
          </div>
        </motion.div>

        {/* Recent Tasks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>
          <div className="space-y-4">
            {recentTasks.map((task, index) => (
              <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  task.status === 'Done' ? 'bg-green-500' :
                  task.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-400'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    {task.users?.name || 'Unassigned'} • {task.task_type}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  task.status === 'Done' ? 'bg-green-100 text-green-800' :
                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add Task', path: '/tasks/react', icon: FiCheckSquare },
            { label: 'New Process', path: '/processes', icon: FiUsers },
            { label: 'View Reports', path: '/reports', icon: FiTrendingUp },
            { label: 'Team Overview', path: '/team', icon: FiUsers }
          ].map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SafeIcon icon={action.icon} className="w-6 h-6 text-primary-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">{action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;