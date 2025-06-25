import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { format } from 'date-fns';

const { FiClock, FiUser, FiFlag, FiEdit3 } = FiIcons;

const TaskCard = ({ task, onEdit, onStatusChange }) => {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'done': return 'text-green-600 bg-green-100';
      case 'in progress': return 'text-blue-600 bg-blue-100';
      case 'to do': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTaskTypeColor = (taskType) => {
    switch (taskType?.toLowerCase()) {
      case 'react': return 'text-purple-600 bg-purple-100';
      case 'maintain': return 'text-blue-600 bg-blue-100';
      case 'improve': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
          )}
        </div>
        <button
          onClick={() => onEdit(task)}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
        >
          <SafeIcon icon={FiEdit3} className="w-4 h-4" />
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(task.task_type)}`}>
          {task.task_type}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
        {task.priority && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            <SafeIcon icon={FiFlag} className="w-3 h-3 inline mr-1" />
            {task.priority}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          {task.assignee_name && (
            <div className="flex items-center space-x-1">
              <SafeIcon icon={FiUser} className="w-4 h-4" />
              <span>{task.assignee_name}</span>
            </div>
          )}
          {task.due_date && (
            <div className="flex items-center space-x-1">
              <SafeIcon icon={FiClock} className="w-4 h-4" />
              <span>{format(new Date(task.due_date), 'MMM d')}</span>
            </div>
          )}
        </div>
        
        {/* Status change buttons */}
        <div className="flex space-x-1">
          {task.status !== 'Done' && (
            <button
              onClick={() => onStatusChange(task.id, 'Done')}
              className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
            >
              Complete
            </button>
          )}
          {task.status === 'To Do' && (
            <button
              onClick={() => onStatusChange(task.id, 'In Progress')}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
            >
              Start
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;