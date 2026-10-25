import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import api from '../../services/api';

export default function CommentSection({ postId, postAuthorId, onCommentCountChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchComments = async () => {
      try {
        const res = await api.get(`/posts/${postId}/comments`);
        if (isMounted && res.data.success) {
          setComments(res.data.comments);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchComments();
    return () => {
      isMounted = false;
    };
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post(`/posts/${postId}/comments`, {
        content: newComment.trim()
      });

      if (res.data.success) {
        setComments((prev) => [...prev, res.data.comment]);
        setNewComment('');
        if (onCommentCountChange) {
          onCommentCountChange(res.data.commentsCount);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const res = await api.delete(`/posts/${postId}/comments/${commentId}`);
      if (res.data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        if (onCommentCountChange) {
          onCommentCountChange(res.data.commentsCount);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment.');
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="pt-4 border-t border-slate-100 space-y-4">
      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-6 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <MessageSquare className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
          <p className="text-xs text-slate-500 font-medium">No comments yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const isCommentAuthor = user && comment.author?._id === user._id;
            const isPostAuthor = user && postAuthorId === user._id;
            const canDelete = isCommentAuthor || isPostAuthor;

            return (
              <div key={comment._id} className="flex items-start gap-3 group text-xs">
                <Link to={`/profile/${comment.author?.username}`}>
                  <Avatar user={comment.author} size="sm" />
                </Link>
                <div className="flex-1 bg-slate-100/70 hover:bg-slate-100 rounded-2xl p-3 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Link
                      to={`/profile/${comment.author?.username}`}
                      className="font-bold text-slate-800 hover:text-vibe-600 transition-colors"
                    >
                      {comment.author?.fullName}
                      <span className="font-normal text-slate-400 ml-1.5">
                        @{comment.author?.username}
                      </span>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{formatDate(comment.createdAt)}</span>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(comment._id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-0.5 rounded transition-opacity"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Comment Input */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2">
          <Avatar user={user} size="sm" />
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={1000}
              className="w-full pl-3.5 pr-10 py-2 bg-slate-100/90 focus:bg-white text-xs rounded-full border border-slate-200/80 focus:border-vibe-400 focus:ring-2 focus:ring-vibe-100 outline-none transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-white bg-vibe-600 hover:bg-vibe-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-2 bg-slate-50 rounded-xl text-xs text-slate-500">
          <Link to="/login" className="text-vibe-600 font-semibold hover:underline">
            Log in
          </Link>{' '}
          to join the discussion and post comments.
        </div>
      )}

      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}
