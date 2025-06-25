import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import AuthForm from './components/auth/AuthForm';
import Dashboard from './pages/Dashboard';
import TasksReact from './pages/TasksReact';
import TasksMaintain from './pages/TasksMaintain';
import TasksImprove from './pages/TasksImprove';
import Processes from './pages/Processes';
import Reports from './pages/Reports';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/auth" />;
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // For demo purposes, always show the main app
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/auth" element={<Navigate to="/" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Separate Task Management Routes */}
        <Route path="/tasks/react" element={<TasksReact />} />
        <Route path="/tasks/maintain" element={<TasksMaintain />} />
        <Route path="/tasks/improve" element={<TasksImprove />} />
        <Route path="/tasks" element={<Navigate to="/tasks/react" />} />
        
        {/* Toolbox Routes */}
        <Route path="/processes" element={<Processes />} />
        <Route path="/systems" element={<div className="p-6"><h1 className="text-2xl font-bold">Systems Database</h1><p className="text-gray-600">Systems inventory and management - Coming soon...</p></div>} />
        <Route path="/equipment" element={<div className="p-6"><h1 className="text-2xl font-bold">Equipment Database</h1><p className="text-gray-600">Equipment tracking and maintenance - Coming soon...</p></div>} />
        <Route path="/software" element={<div className="p-6"><h1 className="text-2xl font-bold">Software Database</h1><p className="text-gray-600">Software inventory and licenses - Coming soon...</p></div>} />
        <Route path="/team" element={<div className="p-6"><h1 className="text-2xl font-bold">Team Database</h1><p className="text-gray-600">Team member management - Coming soon...</p></div>} />
        <Route path="/events" element={<div className="p-6"><h1 className="text-2xl font-bold">Key Events Database</h1><p className="text-gray-600">Important events tracking - Coming soon...</p></div>} />
        <Route path="/ideas" element={<div className="p-6"><h1 className="text-2xl font-bold">Ideas Database</h1><p className="text-gray-600">Innovation and improvement ideas - Coming soon...</p></div>} />
        
        {/* Reports */}
        <Route path="/reports" element={<Reports />} />
        
        {/* Admin */}
        <Route path="/admin" element={<div className="p-6"><h1 className="text-2xl font-bold">Admin Panel</h1><p className="text-gray-600">System administration - Coming soon...</p></div>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;