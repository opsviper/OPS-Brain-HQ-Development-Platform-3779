import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const { FiHome, FiCheckSquare, FiSettings, FiUsers, FiTool, FiMonitor, FiLayers, FiLightbulb, FiCalendar, FiBarChart3, FiChevronDown, FiChevronRight, FiMenu, FiX, FiCode, FiTrendingUp } = FiIcons;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({ tasks: true, toolbox: true });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/' },
    {
      id: 'tasks',
      label: 'Task Management',
      icon: FiCheckSquare,
      expandable: true,
      children: [
        { id: 'react', label: 'React Tasks', path: '/tasks/react', icon: FiCode },
        { id: 'maintain', label: 'Maintain Tasks', path: '/tasks/maintain', icon: FiTool },
        { id: 'improve', label: 'Improve Tasks', path: '/tasks/improve', icon: FiTrendingUp },
      ]
    },
    {
      id: 'toolbox',
      label: 'Toolbox',
      icon: FiLayers,
      expandable: true,
      children: [
        { id: 'processes', label: 'Processes', path: '/processes', icon: FiLayers },
        { id: 'systems', label: 'Systems', path: '/systems', icon: FiMonitor },
        { id: 'equipment', label: 'Equipment', path: '/equipment', icon: FiTool },
        { id: 'software', label: 'Software', path: '/software', icon: FiSettings },
        { id: 'team', label: 'Team', path: '/team', icon: FiUsers },
        { id: 'events', label: 'Key Events', path: '/events', icon: FiCalendar },
        { id: 'ideas', label: 'Ideas', path: '/ideas', icon: FiLightbulb },
      ]
    },
    { id: 'reports', label: 'Reports', icon: FiBarChart3, path: '/reports' },
  ];

  // Add admin menu for admin users
  if (userProfile?.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin', icon: FiSettings, path: '/admin' });
  }

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isChildActive = (children) => {
    return children.some(child => isActive(child.path));
  };

  return (
    <motion.div
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-r border-gray-200 h-full flex flex-col shadow-sm"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiLayers} className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">OPS Brain HQ</h1>
              <p className="text-xs text-gray-500">OPS Viper</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <SafeIcon icon={isCollapsed ? FiMenu : FiX} className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.id}>
            {/* Main menu item */}
            <div
              className={`
                flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200
                ${isActive(item.path) || (item.children && isChildActive(item.children))
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
              onClick={() => {
                if (item.expandable) {
                  toggleMenu(item.id);
                } else {
                  navigate(item.path);
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <SafeIcon
                  icon={item.icon}
                  className={`w-5 h-5 ${
                    isActive(item.path) || (item.children && isChildActive(item.children))
                      ? 'text-primary-600'
                      : 'text-gray-500'
                  }`}
                />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </div>
              {!isCollapsed && item.expandable && (
                <SafeIcon
                  icon={expandedMenus[item.id] ? FiChevronDown : FiChevronRight}
                  className="w-4 h-4 text-gray-400"
                />
              )}
            </div>

            {/* Submenu items */}
            {!isCollapsed && item.children && expandedMenus[item.id] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-8 mt-2 space-y-1"
              >
                {item.children.map((child) => (
                  <div
                    key={child.id}
                    className={`
                      flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors
                      ${isActive(child.path)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => navigate(child.path)}
                  >
                    <SafeIcon
                      icon={child.icon}
                      className={`w-4 h-4 ${
                        isActive(child.path) ? 'text-primary-600' : 'text-gray-400'
                      }`}
                    />
                    <span className="text-sm font-medium">{child.label}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </nav>

      {/* User info */}
      {!isCollapsed && userProfile && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-medium text-sm">
                {userProfile.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userProfile.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {userProfile.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;