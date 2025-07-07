import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const { FiMessageCircle, FiSend, FiUser, FiClock, FiEdit3, FiTrash2, FiX } = FiIcons;

const TaskComments = ({ taskId, isOpen, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const { userProfile } = useAuth();

  useEffect(() => {
    if (isOpen && taskId) {
      fetchComments();
    }
  }, [isOpen, taskId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_comments_67abc23def')
        .select(`
          *,
          users_67abc23def!task_comments_67abc23def_user_id_fkey(name, email)
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const transformedComments = data?.map(comment => ({
        ...comment,
        user_name: comment.users_67abc23def?.name || 'Unknown User',
        user_email: comment.users_67abc23def?.email || ''
      })) || [];

      setComments(transformedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('task_comments_67abc23def')
        .insert([{
          task_id: taskId,
          user_id: userProfile?.id,
          comment: newComment.trim(),
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setNewComment('');
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.comment);
  };

  const handleUpdateComment = async () => {
    if (!editText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('task_comments_67abc23def')
        .update({
          comment: editText.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingComment);

      if (error) throw error;

      setEditingComment(null);
      setEditText('');
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Error updating comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('task_comments_67abc23def')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error deleting comment. Please try again.');
    }
  };

  const canEditComment = (comment) => {
    return userProfile?.id === comment.user_id || userProfile?.role === 'admin';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <SafeIcon icon={FiMessageCircle} className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Task Comments</h2>
              <p className="text-sm text-gray-500">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiX} className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : comments.length > 0 ? (
            <AnimatePresence>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-medium text-sm">
                          {comment.user_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{comment.user_name}</p>
                        <p className="text-xs text-gray-500 flex items-center space-x-1">
                          <SafeIcon icon={FiClock} className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                          {comment.updated_at && comment.updated_at !== comment.created_at && (
                            <span>(edited)</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {canEditComment(comment) && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditComment(comment)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        >
                          <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingComment === comment.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="Edit your comment..."
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleUpdateComment}
                          disabled={submitting || !editText.trim()}
                          className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => {
                            setEditingComment(null);
                            setEditText('');
                          }}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-8">
              <SafeIcon icon={FiMessageCircle} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
              <p className="text-gray-600">Be the first to add a comment to this task.</p>
            </div>
          )}
        </div>

        {/* Add Comment Form */}
        <div className="p-6 border-t border-gray-200">
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-700 font-medium text-sm">
                  {userProfile?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Add a comment..."
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Posting as {userProfile?.name || 'Unknown User'}
              </p>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <SafeIcon icon={FiSend} className="w-4 h-4" />
                <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskComments;