import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import DataTable from '../components/common/DataTable';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiPlus, FiX, FiSave, FiMapPin, FiClock } = FiIcons;

const EventForm = ({ event, users, processes, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'Other',
    event_date: '',
    end_date: '',
    location: '',
    process_id: '',
    created_by: '',
    status: 'Planned',
    notes: ''
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        event_type: event.event_type || 'Other',
        event_date: event.event_date || '',
        end_date: event.end_date || '',
        location: event.location || '',
        process_id: event.process_id || '',
        created_by: event.created_by || '',
        status: event.status || 'Planned',
        notes: event.notes || ''
      });
    }
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {event ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
              <SafeIcon icon={FiX} className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter event title"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe the event"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <select
                name="event_type"
                value={formData.event_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Technical">Technical</option>
                <option value="Business">Business</option>
                <option value="Compliance">Compliance</option>
                <option value="Training">Training</option>
                <option value="Meeting">Meeting</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiCalendar} className="w-4 h-4 inline mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiClock} className="w-4 h-4 inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiMapPin} className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Event location or virtual link"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Related Process</label>
              <select
                name="process_id"
                value={formData.process_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select related process</option>
                {processes.map(process => (
                  <option key={process.id} value={process.id}>{process.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
              <select
                name="created_by"
                value={formData.created_by}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select creator</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Additional notes or agenda items"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <SafeIcon icon={FiSave} className="w-4 h-4" />
              <span>{event ? 'Update' : 'Create'} Event</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchUsers();
    fetchProcesses();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('key_events_67abc23def')
        .select(`
          *,
          users_67abc23def!key_events_67abc23def_created_by_fkey(name),
          processes_67abc23def(name)
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;

      const transformedEvents = data?.map(event => ({
        ...event,
        created_by_name: event.users_67abc23def?.name || 'Unknown',
        process_name: event.processes_67abc23def?.name || 'None'
      })) || [];

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
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

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (event) => {
    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('key_events_67abc23def')
        .delete()
        .eq('id', event.id);

      if (error) throw error;
      
      setEvents(prevEvents => prevEvents.filter(e => e.id !== event.id));
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    }
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('key_events_67abc23def')
          .update({ ...eventData, updated_at: new Date().toISOString() })
          .eq('id', editingEvent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('key_events_67abc23def')
          .insert([{
            ...eventData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      setShowEventForm(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Please try again.');
    }
  };

  const tableColumns = [
    { key: 'title', label: 'Event Title', sortable: true },
    { key: 'description', label: 'Description', sortable: false },
    {
      key: 'event_type',
      label: 'Type',
      type: 'badge',
      sortable: true,
      getBadgeClass: (value) => {
        switch (value) {
          case 'Technical': return 'bg-blue-100 text-blue-800';
          case 'Business': return 'bg-green-100 text-green-800';
          case 'Compliance': return 'bg-red-100 text-red-800';
          case 'Training': return 'bg-purple-100 text-purple-800';
          case 'Meeting': return 'bg-yellow-100 text-yellow-800';
          case 'Maintenance': return 'bg-orange-100 text-orange-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      }
    },
    { key: 'event_date', label: 'Event Date', type: 'date', sortable: true },
    { key: 'location', label: 'Location', sortable: false },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      sortable: true,
      getBadgeClass: (value) => {
        switch (value) {
          case 'Planned': return 'bg-blue-100 text-blue-800';
          case 'In Progress': return 'bg-yellow-100 text-yellow-800';
          case 'Completed': return 'bg-green-100 text-green-800';
          case 'Cancelled': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      }
    },
    { key: 'created_by_name', label: 'Created By', sortable: true }
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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiCalendar} className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Key Events</h1>
              <p className="text-gray-600">Track important events and milestones</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowEventForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: events.length, color: 'bg-indigo-100 text-indigo-800' },
          { label: 'Planned', value: events.filter(e => e.status === 'Planned').length, color: 'bg-blue-100 text-blue-800' },
          { label: 'In Progress', value: events.filter(e => e.status === 'In Progress').length, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Completed', value: events.filter(e => e.status === 'Completed').length, color: 'bg-green-100 text-green-800' }
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

      <DataTable
        data={events}
        columns={tableColumns}
        title="Events"
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        searchable={true}
      />

      {events.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiCalendar} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events scheduled</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first event.</p>
          <button
            onClick={() => setShowEventForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      )}

      {showEventForm && (
        <EventForm
          event={editingEvent}
          users={users}
          processes={processes}
          onSave={handleSaveEvent}
          onCancel={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default Events;