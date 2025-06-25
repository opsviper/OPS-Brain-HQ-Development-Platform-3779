import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ReactECharts from 'echarts-for-react';

const { FiBarChart3, FiAlertTriangle, FiClock, FiUser, FiCalendar, FiTrendingUp, FiPackage } = FiIcons;

const Reports = () => {
  const [reportData, setReportData] = useState({
    taskEffortDistribution: [],
    overdueTasks: [],
    tasksWithoutDueDate: [],
    tasksWithoutAssignee: [],
    monthlyTaskCompletion: [],
    equipmentChanges: [],
    outdatedEquipment: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      // Mock data for all reports
      const mockData = {
        taskEffortDistribution: [
          { name: 'React Tasks', value: 35, color: '#8b5cf6' },
          { name: 'Maintain Tasks', value: 45, color: '#3b82f6' },
          { name: 'Improve Tasks', value: 20, color: '#10b981' }
        ],
        overdueTasks: [
          { id: '1', title: 'Update client portal', assignee_name: 'John Doe', due_date: '2024-01-10', days_overdue: 5 },
          { id: '2', title: 'Database backup', assignee_name: 'Jane Smith', due_date: '2024-01-12', days_overdue: 3 }
        ],
        tasksWithoutDueDate: [
          { id: '3', title: 'Optimize queries', assignee_name: 'Bob Wilson', task_type: 'improve' },
          { id: '4', title: 'Code review', assignee_name: 'John Doe', task_type: 'react' }
        ],
        tasksWithoutAssignee: [
          { id: '5', title: 'System documentation', due_date: '2024-01-25', task_type: 'maintain' },
          { id: '6', title: 'Performance testing', due_date: '2024-01-28', task_type: 'improve' }
        ],
        monthlyTaskCompletion: [
          { month: 'Oct', completed: 12, total: 15 },
          { month: 'Nov', completed: 18, total: 22 },
          { month: 'Dec', completed: 14, total: 20 },
          { month: 'Jan', completed: 8, total: 16 }
        ],
        equipmentChanges: [
          { month: 'Oct', added: 2, removed: 1 },
          { month: 'Nov', added: 1, removed: 0 },
          { month: 'Dec', added: 3, removed: 2 },
          { month: 'Jan', added: 1, removed: 0 }
        ],
        outdatedEquipment: [
          { id: '1', name: 'Server Rack A', category: 'Hardware', last_updated: '2023-10-15', days_since_update: 95 },
          { id: '2', name: 'Network Switch B', category: 'Networking', last_updated: '2023-11-01', days_since_update: 78 }
        ]
      };

      try {
        // Try to fetch real data from Supabase
        const [tasksResponse, equipmentResponse] = await Promise.all([
          supabase.from('tasks').select('*'),
          supabase.from('equipment').select('*')
        ]);

        if (tasksResponse.data && tasksResponse.data.length > 0) {
          // Process real data
          const tasks = tasksResponse.data;
          const now = new Date();

          // Task effort distribution
          const reactTasks = tasks.filter(t => t.task_type === 'react').length;
          const maintainTasks = tasks.filter(t => t.task_type === 'maintain').length;
          const improveTasks = tasks.filter(t => t.task_type === 'improve').length;
          const total = reactTasks + maintainTasks + improveTasks;

          if (total > 0) {
            mockData.taskEffortDistribution = [
              { name: 'React Tasks', value: Math.round((reactTasks / total) * 100), color: '#8b5cf6' },
              { name: 'Maintain Tasks', value: Math.round((maintainTasks / total) * 100), color: '#3b82f6' },
              { name: 'Improve Tasks', value: Math.round((improveTasks / total) * 100), color: '#10b981' }
            ];
          }

          // Overdue tasks
          mockData.overdueTasks = tasks.filter(task => 
            task.due_date && 
            new Date(task.due_date) < now && 
            task.status !== 'Done'
          ).map(task => ({
            ...task,
            days_overdue: Math.floor((now - new Date(task.due_date)) / (1000 * 60 * 60 * 24))
          }));

          // Tasks without due date
          mockData.tasksWithoutDueDate = tasks.filter(task => 
            task.assignee && !task.due_date
          );

          // Tasks without assignee
          mockData.tasksWithoutAssignee = tasks.filter(task => 
            task.due_date && !task.assignee
          );
        }

        setReportData(mockData);
      } catch (error) {
        console.log('Using mock data for development');
        setReportData(mockData);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const effortDistributionOptions = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}%'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: 'Task Effort',
        type: 'pie',
        radius: '50%',
        data: reportData.taskEffortDistribution.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: { color: item.color }
        })),
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

  const monthlyCompletionOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['Completed', 'Total']
    },
    xAxis: {
      type: 'category',
      data: reportData.monthlyTaskCompletion.map(item => item.month)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Completed',
        type: 'bar',
        data: reportData.monthlyTaskCompletion.map(item => item.completed),
        itemStyle: { color: '#10b981' }
      },
      {
        name: 'Total',
        type: 'bar',
        data: reportData.monthlyTaskCompletion.map(item => item.total),
        itemStyle: { color: '#e5e7eb' }
      }
    ]
  };

  const equipmentChangesOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['Added', 'Removed']
    },
    xAxis: {
      type: 'category',
      data: reportData.equipmentChanges.map(item => item.month)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Added',
        type: 'line',
        data: reportData.equipmentChanges.map(item => item.added),
        itemStyle: { color: '#10b981' }
      },
      {
        name: 'Removed',
        type: 'line',
        data: reportData.equipmentChanges.map(item => item.removed),
        itemStyle: { color: '#ef4444' }
      }
    ]
  };

  const ReportCard = ({ title, icon, children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
          <SafeIcon icon={icon} className="w-4 h-4 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

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
              <SafeIcon icon={FiBarChart3} className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600">Operational insights and performance metrics</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Overdue Tasks', value: reportData.overdueTasks.length, color: 'bg-red-100 text-red-800', icon: FiAlertTriangle },
          { label: 'Tasks w/o Due Date', value: reportData.tasksWithoutDueDate.length, color: 'bg-yellow-100 text-yellow-800', icon: FiClock },
          { label: 'Tasks w/o Assignee', value: reportData.tasksWithoutAssignee.length, color: 'bg-orange-100 text-orange-800', icon: FiUser },
          { label: 'Outdated Equipment', value: reportData.outdatedEquipment.length, color: 'bg-purple-100 text-purple-800', icon: FiPackage }
        ].map((metric, index) => (
          <div key={metric.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${metric.color}`}>
                <SafeIcon icon={metric.icon} className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportCard title="Task Effort Distribution" icon={FiBarChart3}>
          <div className="h-64">
            <ReactECharts option={effortDistributionOptions} style={{ height: '100%', width: '100%' }} />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Distribution of effort across React, Maintain, and Improve tasks
          </div>
        </ReportCard>

        <ReportCard title="Monthly Task Completion" icon={FiTrendingUp}>
          <div className="h-64">
            <ReactECharts option={monthlyCompletionOptions} style={{ height: '100%', width: '100%' }} />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Task completion trends over the last 4 months
          </div>
        </ReportCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportCard title="Equipment Changes" icon={FiPackage}>
          <div className="h-64">
            <ReactECharts option={equipmentChangesOptions} style={{ height: '100%', width: '100%' }} />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Equipment additions and removals over time
          </div>
        </ReportCard>

        <ReportCard title="Task Issues Summary" icon={FiAlertTriangle}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">Overdue Tasks</span>
              </div>
              <span className="text-lg font-bold text-red-900">{reportData.overdueTasks.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiClock} className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">No Due Date</span>
              </div>
              <span className="text-lg font-bold text-yellow-900">{reportData.tasksWithoutDueDate.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiUser} className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">No Assignee</span>
              </div>
              <span className="text-lg font-bold text-orange-900">{reportData.tasksWithoutAssignee.length}</span>
            </div>
          </div>
        </ReportCard>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportCard title="Overdue Tasks" icon={FiAlertTriangle}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-900">Task</th>
                  <th className="text-left py-2 font-medium text-gray-900">Assignee</th>
                  <th className="text-left py-2 font-medium text-gray-900">Days Overdue</th>
                </tr>
              </thead>
              <tbody>
                {reportData.overdueTasks.map((task, index) => (
                  <tr key={task.id} className="border-b border-gray-100">
                    <td className="py-2 text-gray-900">{task.title}</td>
                    <td className="py-2 text-gray-600">{task.assignee_name}</td>
                    <td className="py-2">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        {task.days_overdue} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportCard>

        <ReportCard title="Outdated Equipment" icon={FiPackage}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-900">Equipment</th>
                  <th className="text-left py-2 font-medium text-gray-900">Category</th>
                  <th className="text-left py-2 font-medium text-gray-900">Days Since Update</th>
                </tr>
              </thead>
              <tbody>
                {reportData.outdatedEquipment.map((equipment, index) => (
                  <tr key={equipment.id} className="border-b border-gray-100">
                    <td className="py-2 text-gray-900">{equipment.name}</td>
                    <td className="py-2 text-gray-600">{equipment.category}</td>
                    <td className="py-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {equipment.days_since_update} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportCard>
      </div>
    </div>
  );
};

export default Reports;