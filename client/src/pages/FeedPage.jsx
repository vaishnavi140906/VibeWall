import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MessageSquare, Loader2, ArrowUpRight, Flame, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import CreatePostCard from '../components/feed/CreatePostCard';
import PostCard from '../components/feed/PostCard';
import api from '../services/api';

export default function FeedPage() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my-circles'

  const fetchPosts = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const params = { page: pageNum, limit: 10 };
      const res = await api.get('/posts', { params });

      if (res.data.success) {
        if (append) {
          setPosts((prev) => [...prev, ...res.data.posts]);
        } else {
          setPosts(res.data.posts);
        }
        setHasMore(pageNum < res.data.pages);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Error fetching feed posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, false);

    // Listen for custom post creation event from global modal
    const handleGlobalPost = (e) => {
      if (e.detail) {
        setPosts((prev) => [e.detail, ...prev]);
      }
    };
    window.addEventListener('vibewall:post_created', handleGlobalPost);
    return () => window.removeEventListener('vibewall:post_created', handleGlobalPost);
  }, []);

  // Real-time Socket.IO subscriptions
  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (newPost) => {
      setPosts((prev) => {
        // Prevent duplicate if already in state
        if (prev.some((p) => p._id === newPost._id)) return prev;
        return [newPost, ...prev];
      });
    };

    const handleDeletedPost = ({ postId }) => {
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    };

    const handleReaction = ({ postId, reactionCounts }) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, reactionCounts } : p))
      );
    };

    const handleComment = ({ postId, commentsCount }) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, commentsCount } : p))
      );
    };

    socket.on('post:new', handleNewPost);
    socket.on('post:deleted', handleDeletedPost);
    socket.on('post:reaction', handleReaction);
    socket.on('post:comment', handleComment);

    return () => {
      socket.off('post:new', handleNewPost);
      socket.off('post:deleted', handleDeletedPost);
      socket.off('post:reaction', handleReaction);
      socket.off('post:comment', handleComment);
    };
  }, [socket]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Create Post Section for Logged In User */}
      {user ? (
        <CreatePostCard onPostCreated={handlePostCreated} />
      ) : (
        <div className="bg-gradient-to-r from-vibe-600 via-indigo-600 to-coral-500 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-black tracking-tight">Join the conversation on VibeWall</h3>
            <p className="text-xs text-vibe-100">
              Create your real account to publish posts, react with 6 emotional vibes, and join circles.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/login"
              className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-xs font-bold transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-full bg-white text-vibe-700 hover:bg-slate-100 text-xs font-bold transition-all shadow-sm"
            >
              Register
            </Link>
          </div>
        </div>
      )}

      {/* Feed Filter Header */}
      <div className="flex items-center justify-between px-2 pt-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-vibe-100 text-vibe-700">
            <Flame className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Community Vibe Feed
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'} displayed
        </span>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded-md w-1/4" />
                  <div className="h-3 bg-slate-200 rounded-md w-1/6" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded-md w-full" />
                <div className="h-4 bg-slate-200 rounded-md w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-card border border-slate-200/80 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-vibe-50 text-vibe-600 flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">The Feed is Clean & Ready</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              No fabricated posts or synthetic bots. Be the pioneer who publishes the very first vibe on the board!
            </p>
          </div>
          {user && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-vibe-600 hover:bg-vibe-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Share the First Vibe</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => fetchPosts(page + 1, true)}
                disabled={loadingMore}
                className="px-6 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/80 shadow-xs transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-vibe-600" />
                    <span>Loading more vibes...</span>
                  </>
                ) : (
                  <span>Load More Vibes</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
