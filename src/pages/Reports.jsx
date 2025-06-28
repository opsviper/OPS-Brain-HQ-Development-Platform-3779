import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ReactECharts from 'echarts-for-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { 
  FiBarChart3, 
  FiAlertTriangle, 
  FiClock, 
  FiUser, 
  FiCalendar, 
  FiTrendingUp, 
  FiPackage, 
  FiRefreshCw,
  FiFlag,
  FiCheckSquare,
  FiLayers,
  FiUsers,
  FiPrinter,
  FiDownload
} = FiIcons;

const Reports = () => {
  const [reportData, setReportData] = useState({
    taskEffortDistribution: [],
    overdueTasks: [],
    tasksWithoutDueDate: [],
    tasksWithoutAssignee: [],
    monthlyTaskCompletion: [],
    processEffectiveness: [],
    priorityDistribution: [],
    teamWorkload: [],
    statusTrends: [],
    upcomingDeadlines: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      console.log(`🔄 Fetching report data for period: ${selectedPeriod}`);
      
      // Calculate date ranges based on selected period
      const now = new Date();
      let startDate = new Date();
      
      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      console.log(`📅 Date range: ${startDate.toISOString()} to ${now.toISOString()}`);

      // Fetch all required data with proper error handling
      const [
        tasksResponse,
        usersResponse,
        processesResponse
      ] = await Promise.all([
        supabase
          .from('tasks_67abc23def')
          .select(`
            *,
            users_67abc23def!tasks_67abc23def_assignee_fkey(name),
            processes_67abc23def(name)
          `),
        supabase
          .from('users_67abc23def')
          .select('id, name, email'),
        supabase
          .from('processes_67abc23def')
          .select('*')
      ]);

      // Log responses for debugging
      console.log('📊 Tasks response:', tasksResponse);
      console.log('👥 Users response:', usersResponse);
      console.log('⚙️ Processes response:', processesResponse);

      if (tasksResponse.error) {
        console.error('❌ Tasks query error:', tasksResponse.error);
        throw tasksResponse.error;
      }

      const tasks = tasksResponse.data || [];
      const users = usersResponse.data || [];
      const processes = processesResponse.data || [];

      console.log(`📈 Processing ${tasks.length} tasks, ${users.length} users, ${processes.length} processes`);

      // Filter tasks by selected period for time-sensitive data
      const filteredTasks = tasks.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate >= startDate && taskDate <= now;
      });

      console.log(`🔍 Filtered to ${filteredTasks.length} tasks for ${selectedPeriod} period`);

      // Process the data for reports
      const processedData = {
        // Task effort distribution by type (use all tasks, not filtered)
        taskEffortDistribution: calculateTaskDistribution(tasks),
        
        // Overdue tasks (use all tasks)
        overdueTasks: calculateOverdueTasks(tasks),
        
        // Tasks without due dates (use all tasks)
        tasksWithoutDueDate: tasks.filter(task => 
          task.assignee && !task.due_date
        ).map(task => ({
          ...task,
          assignee_name: task.users_67abc23def?.name || 'Unknown'
        })),
        
        // Tasks without assignees (use all tasks)
        tasksWithoutAssignee: tasks.filter(task => 
          task.due_date && !task.assignee
        ),
        
        // Monthly task completion (use filtered tasks for period-specific data)
        monthlyTaskCompletion: calculateMonthlyCompletion(tasks, selectedPeriod),
        
        // Process effectiveness (use all tasks)
        processEffectiveness: calculateProcessEffectiveness(tasks, processes),
        
        // Priority distribution (use all tasks)
        priorityDistribution: calculatePriorityDistribution(tasks),
        
        // Team workload (use all tasks)
        teamWorkload: calculateTeamWorkload(tasks, users),
        
        // Status trends (use all tasks)
        statusTrends: calculateStatusTrends(tasks),
        
        // Upcoming deadlines (always current)
        upcomingDeadlines: calculateUpcomingDeadlines(tasks)
      };

      console.log('📊 Processed report data:', processedData);
      setReportData(processedData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Error fetching report data:', error);
      // Keep existing data on error, don't reset to empty
    } finally {
      setLoading(false);
    }
  };

  const calculateTaskDistribution = (tasks) => {
    const reactTasks = tasks.filter(t => t.task_type === 'react').length;
    const maintainTasks = tasks.filter(t => t.task_type === 'maintain').length;
    const improveTasks = tasks.filter(t => t.task_type === 'improve').length;
    const total = reactTasks + maintainTasks + improveTasks;

    console.log(`📊 Task distribution - React: ${reactTasks}, Maintain: ${maintainTasks}, Improve: ${improveTasks}, Total: ${total}`);

    if (total === 0) return [];

    return [
      { name: 'React Tasks', value: reactTasks, percentage: Math.round((reactTasks / total) * 100), color: '#8b5cf6' },
      { name: 'Maintain Tasks', value: maintainTasks, percentage: Math.round((maintainTasks / total) * 100), color: '#3b82f6' },
      { name: 'Improve Tasks', value: improveTasks, percentage: Math.round((improveTasks / total) * 100), color: '#10b981' }
    ];
  };

  const calculateOverdueTasks = (tasks) => {
    const now = new Date();
    const overdue = tasks
      .filter(task => 
        task.due_date && 
        new Date(task.due_date) < now && 
        task.status !== 'Done'
      )
      .map(task => ({
        ...task,
        assignee_name: task.users_67abc23def?.name || 'Unassigned',
        days_overdue: Math.floor((now - new Date(task.due_date)) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => b.days_overdue - a.days_overdue);

    console.log(`⏰ Found ${overdue.length} overdue tasks`);
    return overdue;
  };

  const calculateMonthlyCompletion = (tasks, period) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const data = [];
    
    // Determine how many months to show based on period
    const monthsToShow = period === 'year' ? 12 : period === 'quarter' ? 3 : period === 'month' ? 6 : 4;

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      const monthTasks = tasks.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate.getMonth() === date.getMonth() && taskDate.getFullYear() === year;
      });
      
      const completed = monthTasks.filter(task => task.status === 'Done').length;
      
      data.push({
        month: `${month} ${year.toString().slice(-2)}`,
        completed,
        total: monthTasks.length
      });
    }

    console.log(`📅 Monthly completion data:`, data);
    return data;
  };

  const calculateProcessEffectiveness = (tasks, processes) => {
    const effectiveness = processes.map(process => {
      const processTasks = tasks.filter(task => task.process_id === process.id);
      const completedTasks = processTasks.filter(task => task.status === 'Done').length;
      const totalTasks = processTasks.length;
      
      return {
        name: process.name,
        completion_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        total_tasks: totalTasks,
        completed_tasks: completedTasks
      };
    }).filter(process => process.total_tasks > 0);

    console.log(`⚙️ Process effectiveness:`, effectiveness);
    return effectiveness;
  };

  const calculatePriorityDistribution = (tasks) => {
    const priorities = ['Low', 'Medium', 'High', 'Critical'];
    const distribution = priorities.map(priority => ({
      name: priority,
      value: tasks.filter(task => task.priority === priority).length,
      color: priority === 'Critical' ? '#ef4444' : 
             priority === 'High' ? '#f97316' :
             priority === 'Medium' ? '#eab308' : '#22c55e'
    }));

    console.log(`🚩 Priority distribution:`, distribution);
    return distribution;
  };

  const calculateTeamWorkload = (tasks, users) => {
    const workload = users.map(user => {
      const userTasks = tasks.filter(task => task.assignee === user.id);
      const activeTasks = userTasks.filter(task => task.status !== 'Done').length;
      const completedTasks = userTasks.filter(task => task.status === 'Done').length;
      
      return {
        name: user.name,
        active_tasks: activeTasks,
        completed_tasks: completedTasks,
        total_tasks: userTasks.length
      };
    }).filter(user => user.total_tasks > 0);

    console.log(`👥 Team workload:`, workload);
    return workload;
  };

  const calculateStatusTrends = (tasks) => {
    const statuses = ['To Do', 'In Progress', 'Done'];
    const trends = statuses.map(status => ({
      name: status,
      value: tasks.filter(task => task.status === status).length,
      color: status === 'Done' ? '#22c55e' :
             status === 'In Progress' ? '#3b82f6' : '#6b7280'
    }));

    console.log(`📊 Status trends:`, trends);
    return trends;
  };

  const calculateUpcomingDeadlines = (tasks) => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcoming = tasks
      .filter(task => 
        task.due_date && 
        new Date(task.due_date) >= now && 
        new Date(task.due_date) <= weekFromNow &&
        task.status !== 'Done'
      )
      .map(task => ({
        ...task,
        assignee_name: task.users_67abc23def?.name || 'Unassigned',
        days_until_due: Math.ceil((new Date(task.due_date) - now) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => a.days_until_due - b.days_until_due);

    console.log(`📅 Upcoming deadlines:`, upcoming);
    return upcoming;
  };

  // Print functionality
  const handlePrint = () => {
    window.print();
  };

  // PDF export functionality
  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = reportRef.current;
      
      // Get the full height of the content
      const originalHeight = element.style.height;
      element.style.height = 'auto';
      
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        height: element.scrollHeight,
        windowHeight: element.scrollHeight
      });
      
      // Restore original height
      element.style.height = originalHeight;
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
      
      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const filename = `OPS-Brain-HQ-Report-${selectedPeriod}-${dateStr}.pdf`;
      
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Chart configurations
  const effortDistributionOptions = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} tasks'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
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
          shadowColor: 'rgba(0,0,0,0.5)'
        }
      }
    }]
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

  const priorityDistributionOptions = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} tasks'
    },
    series: [{
      name: 'Priority',
      type: 'pie',
      radius: '60%',
      data: reportData.priorityDistribution.map(item => ({
        name: item.name,
        value: item.value,
        itemStyle: { color: item.color }
      }))
    }]
  };

  const statusTrendsOptions = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} tasks'
    },
    series: [{
      name: 'Status',
      type: 'pie',
      radius: ['40%', '70%'],
      data: reportData.statusTrends.map(item => ({
        name: item.name,
        value: item.value,
        itemStyle: { color: item.color }
      }))
    }]
  };

  const ReportCard = ({ title, icon, children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 print:shadow-none print:border print:border-gray-300 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center print:bg-gray-100">
          <SafeIcon icon={icon} className="w-4 h-4 text-primary-600 print:text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const MetricCard = ({ title, value, icon, color, change }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 print:shadow-none print:border print:border-gray-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1 print:text-gray-600">
              {change > 0 ? '+' : ''}{change}% from last period
            </p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${color} print:bg-gray-100`}>
          <SafeIcon icon={icon} className="w-5 h-5 print:text-gray-600" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading real data from Supabase...</span>
      </div>
    );
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border {
            border: 1px solid #d1d5db !important;
          }
          .print\\:border-gray-300 {
            border-color: #d1d5db !important;
          }
          .print\\:bg-gray-100 {
            background-color: #f3f4f6 !important;
          }
          .print\\:text-gray-600 {
            color: #4b5563 !important;
          }
        }
      `}</style>

      <div className="space-y-6" ref={reportRef}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center print:bg-gray-100">
                <SafeIcon icon={FiBarChart3} className="w-5 h-5 text-primary-600 print:text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">OPS Brain HQ - Reports & Analytics</h1>
                <p className="text-gray-600">Real-time operational insights and performance metrics</p>
                {lastUpdated && (
                  <p className="text-xs text-gray-500">
                    Generated: {lastUpdated.toLocaleString()} | Period: {selectedPeriod}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4 no-print">
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
            <button
              onClick={fetchReportData}
              className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <SafeIcon icon={FiPrinter} className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isGeneratingPDF}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SafeIcon icon={FiDownload} className="w-4 h-4" />
              <span>{isGeneratingPDF ? 'Generating...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Overdue Tasks"
            value={reportData.overdueTasks.length}
            icon={FiAlertTriangle}
            color="bg-red-100 text-red-600"
          />
          <MetricCard
            title="Tasks w/o Due Date"
            value={reportData.tasksWithoutDueDate.length}
            icon={FiClock}
            color="bg-yellow-100 text-yellow-600"
          />
          <MetricCard
            title="Tasks w/o Assignee"
            value={reportData.tasksWithoutAssignee.length}
            icon={FiUser}
            color="bg-orange-100 text-orange-600"
          />
          <MetricCard
            title="Due This Week"
            value={reportData.upcomingDeadlines.length}
            icon={FiCalendar}
            color="bg-blue-100 text-blue-600"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReportCard title="Task Effort Distribution" icon={FiBarChart3}>
            <div className="h-64">
              {reportData.taskEffortDistribution.length > 0 ? (
                <ReactECharts 
                  option={effortDistributionOptions} 
                  style={{ height: '100%', width: '100%' }} 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No task data available
                </div>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Distribution of effort across React, Maintain, and Improve tasks
            </div>
          </ReportCard>

          <ReportCard title="Monthly Task Completion" icon={FiTrendingUp}>
            <div className="h-64">
              {reportData.monthlyTaskCompletion.length > 0 ? (
                <ReactECharts 
                  option={monthlyCompletionOptions} 
                  style={{ height: '100%', width: '100%' }} 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No completion data available
                </div>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Task completion trends for {selectedPeriod} period
            </div>
          </ReportCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReportCard title="Priority Distribution" icon={FiFlag}>
            <div className="h-64">
              {reportData.priorityDistribution.length > 0 ? (
                <ReactECharts 
                  option={priorityDistributionOptions} 
                  style={{ height: '100%', width: '100%' }} 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No priority data available
                </div>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Task distribution by priority level
            </div>
          </ReportCard>

          <ReportCard title="Current Task Status" icon={FiCheckSquare}>
            <div className="h-64">
              {reportData.statusTrends.length > 0 ? (
                <ReactECharts 
                  option={statusTrendsOptions} 
                  style={{ height: '100%', width: '100%' }} 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No status data available
                </div>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Current status distribution of all tasks
            </div>
          </ReportCard>
        </div>

        {/* Process Effectiveness */}
        {reportData.processEffectiveness.length > 0 && (
          <ReportCard title="Process Effectiveness" icon={FiLayers} className="print-break">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-900">Process</th>
                    <th className="text-left py-2 font-medium text-gray-900">Total Tasks</th>
                    <th className="text-left py-2 font-medium text-gray-900">Completed</th>
                    <th className="text-left py-2 font-medium text-gray-900">Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.processEffectiveness.map((process, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 text-gray-900">{process.name}</td>
                      <td className="py-2 text-gray-600">{process.total_tasks}</td>
                      <td className="py-2 text-gray-600">{process.completed_tasks}</td>
                      <td className="py-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-12 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${process.completion_rate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{process.completion_rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportCard>
        )}

        {/* Team Workload */}
        {reportData.teamWorkload.length > 0 && (
          <ReportCard title="Team Workload" icon={FiUsers}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-900">Team Member</th>
                    <th className="text-left py-2 font-medium text-gray-900">Active Tasks</th>
                    <th className="text-left py-2 font-medium text-gray-900">Completed</th>
                    <th className="text-left py-2 font-medium text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.teamWorkload.map((member, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 text-gray-900">{member.name}</td>
                      <td className="py-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium print:bg-gray-100 print:text-gray-800">
                          {member.active_tasks}
                        </span>
                      </td>
                      <td className="py-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium print:bg-gray-100 print:text-gray-800">
                          {member.completed_tasks}
                        </span>
                      </td>
                      <td className="py-2 text-gray-600">{member.total_tasks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportCard>
        )}

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-break">
          {/* Overdue Tasks */}
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
                  {reportData.overdueTasks.slice(0, 5).map((task, index) => (
                    <tr key={task.id} className="border-b border-gray-100">
                      <td className="py-2 text-gray-900">{task.title}</td>
                      <td className="py-2 text-gray-600">{task.assignee_name}</td>
                      <td className="py-2">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium print:bg-gray-100 print:text-gray-800">
                          {task.days_overdue} days
                        </span>
                      </td>
                    </tr>
                  ))}
                  {reportData.overdueTasks.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-4 text-center text-gray-500">
                        No overdue tasks! 🎉
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ReportCard>

          {/* Upcoming Deadlines */}
          <ReportCard title="Upcoming Deadlines (Next 7 Days)" icon={FiCalendar}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-900">Task</th>
                    <th className="text-left py-2 font-medium text-gray-900">Assignee</th>
                    <th className="text-left py-2 font-medium text-gray-900">Due In</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.upcomingDeadlines.slice(0, 5).map((task, index) => (
                    <tr key={task.id} className="border-b border-gray-100">
                      <td className="py-2 text-gray-900">{task.title}</td>
                      <td className="py-2 text-gray-600">{task.assignee_name}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium print:bg-gray-100 print:text-gray-800 ${
                          task.days_until_due <= 1 ? 'bg-red-100 text-red-800' :
                          task.days_until_due <= 3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {task.days_until_due === 0 ? 'Today' :
                           task.days_until_due === 1 ? 'Tomorrow' :
                           `${task.days_until_due} days`}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {reportData.upcomingDeadlines.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-4 text-center text-gray-500">
                        No upcoming deadlines
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ReportCard>
        </div>

        {/* Report Footer */}
        <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t border-gray-200">
          <p>Generated by OPS Brain HQ | {new Date().toLocaleDateString()}</p>
          <p>© 2025 OPS Viper - Operations Intelligence Platform</p>
        </div>
      </div>
    </>
  );
};

export default Reports;