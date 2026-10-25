import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Bookmark,
  MoreHorizontal,
  Edit3,
  Trash2,
  Sparkles,
  Hash,
  Share2,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import ReactionButton from './ReactionButton';
import CommentSection from './CommentSection';
import Modal from '../common/Modal';
import api from '../../services/api';

export default function PostCard({ post, onPostDeleted, onPostUpdated }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [reactionCounts, setReactionCounts] = useState(post.reactionCounts || {});
  const [userReaction, setUserReaction] = useState(post.userReaction || null);
  const [isBookmarked, setIsBookmarked] = useState(Boolean(post.isBookmarked));
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editLoading, setEditLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = user && post.author && user._id === post.author._id;

  const handleReact = async (type) => {
    if (!user) {
      alert('Please log in to react to posts.');
      return;
    }

    try {
      const res = await api.post(`/posts/${post._id}/react`, { type });
      if (res.data.success) {
        setReactionCounts(res.data.reactionCounts);
        setUserReaction(res.data.userReaction);
      }
    } catch (err) {
      console.error('Failed to react:', err);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      alert('Please log in to bookmark posts.');
      return;
    }

    try {
      const res = await api.post(`/posts/${post._id}/bookmark`);
      if (res.data.success) {
        setIsBookmarked(res.data.isBookmarked);
      }
    } catch (err) {
      console.error('Failed to bookmark:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await api.delete(`/posts/${post._id}`);
      if (res.data.success) {
        if (onPostDeleted) onPostDeleted(post._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editContent.trim() || editLoading) return;

    setEditLoading(true);
    try {
      const res = await api.put(`/posts/${post._id}`, { content: editContent.trim() });
      if (res.data.success) {
        setIsEditing(false);
        if (onPostUpdated) onPostUpdated(res.data.post);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update post.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/#post-${post._id}`;
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <article
      id={`post-${post._id}`}
      className="bg-white rounded-3xl p-5 sm:p-6 shadow-card border border-slate-200/80 transition-all hover:shadow-card-hover"
    >
      {/* Post Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.author?.username}`}>
            <Avatar user={post.author} size="md" />
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Link
                to={`/profile/${post.author?.username}`}
                className="font-bold text-sm text-slate-900 hover:text-vibe-600 transition-colors"
              >
                {post.author?.fullName || 'Anonymous Member'}
              </Link>
              <span className="text-xs text-slate-400">
                @{post.author?.username}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{formatTimestamp(post.createdAt)}</span>

              {post.circle && (
                <>
                  <span>•</span>
                  <Link
                    to={`/circles/${post.circle.slug}`}
                    className="inline-flex items-center gap-1 font-semibold text-vibe-600 hover:text-vibe-700 bg-vibe-50 px-2 py-0.5 rounded-full text-[11px]"
                  >
                    <Hash className="w-3 h-3" />
                    <span>{post.circle.name}</span>
                  </Link>
                </>
              )}

              {post.dailyChallenge && (
                <>
                  <span>•</span>
                  <Link
                    to="/daily-spark"
                    className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[11px]"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Daily Spark</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Menu for Owner */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setIsEditing(true);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit Post</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleDelete();
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words mb-4">
        {post.content}
      </div>

      {/* Post Image (if present) */}
      {post.imageUrl && (
        <div className="mb-4 rounded-2xl overflow-hidden border border-slate-100 max-h-96 bg-slate-50 flex items-center justify-center">
          <img
            src={post.imageUrl}
            alt="Post media"
            loading="lazy"
            className="w-full h-auto max-h-96 object-contain"
          />
        </div>
      )}

      {/* Post Engagement Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-slate-600">
        <div className="flex items-center gap-3">
          {/* Reaction Button */}
          <ReactionButton
            userReaction={userReaction}
            reactionCounts={reactionCounts}
            onReact={handleReact}
          />

          {/* Comments Toggle Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              showComments
                ? 'bg-slate-100 text-slate-900'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>{commentsCount}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Share button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Copy link to post"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-full transition-colors ${
              isBookmarked
                ? 'text-vibe-600 bg-vibe-50'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Collapsible Comments Section */}
      {showComments && (
        <CommentSection
          postId={post._id}
          postAuthorId={post.author?._id}
          onCommentCountChange={(newCount) => setCommentsCount(newCount)}
        />
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Your Post"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <textarea
            rows={5}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={3000}
            className="w-full resize-none bg-slate-50 p-3 rounded-2xl border border-slate-200 focus:border-vibe-400 focus:ring-2 focus:ring-vibe-100 outline-none text-sm text-slate-800"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!editContent.trim() || editLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-vibe-600 hover:bg-vibe-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </article>
  );
}
