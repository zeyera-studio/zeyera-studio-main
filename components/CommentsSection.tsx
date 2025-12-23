import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Send, Loader } from 'lucide-react';
import { Comment } from '../types';
import { fetchCommentsByContentId, postComment, deleteComment } from '../lib/commentService';
import { useAuth } from '../contexts/AuthContext';

interface CommentsSectionProps {
  contentId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ contentId }) => {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  // Fetch comments on mount and when contentId changes
  useEffect(() => {
    loadComments();
  }, [contentId]);

  const loadComments = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedComments = await fetchCommentsByContentId(contentId);
      setComments(fetchedComments);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) {
      setError('You must be logged in to comment');
      return;
    }

    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setPosting(true);
    setError('');

    const result = await postComment(contentId, user.id, newComment);

    if (result.success && result.comment) {
      // Add the new comment to the top of the list
      setComments([result.comment, ...comments]);
      setNewComment('');
    } else {
      setError(result.error || 'Failed to post comment');
    }

    setPosting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    const result = await deleteComment(commentId);

    if (result.success) {
      // Remove the comment from the list
      setComments(comments.filter(c => c.id !== commentId));
    } else {
      setError(result.error || 'Failed to delete comment');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const canDeleteComment = (comment: Comment) => {
    if (!user || !profile) return false;
    // User can delete their own comments, or admins can delete any comment
    return comment.user_id === user.id || profile.role === 'admin';
  };

  return (
    <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="text-neon-green" size={24} />
        <h3 className="text-xl font-bold text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Post Comment Form */}
      {user ? (
        <form onSubmit={handlePostComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full bg-white/10 border border-white/20 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:border-neon-green resize-none"
            rows={3}
            maxLength={1000}
            disabled={posting}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-400">
              {newComment.length}/1000
            </span>
            <button
              type="submit"
              disabled={posting || !newComment.trim()}
              className="bg-neon-green text-black px-6 py-2 rounded-lg font-semibold hover:bg-neon-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {posting ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Post Comment
                </>
              )}
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </form>
      ) : (
        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg text-center">
          <p className="text-gray-400">
            Please log in to post a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader size={32} className="animate-spin text-neon-green" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare size={48} className="mx-auto text-gray-600 mb-2" />
          <p className="text-gray-400">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-semibold text-neon-green">
                    {comment.username || 'Anonymous'}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                {canDeleteComment(comment) && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 hover:text-red-400 transition-colors p-1"
                    title="Delete comment"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="text-white whitespace-pre-wrap break-words">
                {comment.comment_text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;

