import React, { useState, useEffect } from 'react';
import { Bookmark, Loader2, MessageSquare } from 'lucide-react';
import PostCard from '../components/feed/PostCard';
import api from '../services/api';

export default function SavedPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookmarks');
      if (res.data.success) {
        setPosts(res.data.posts);
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-vibe-50 text-vibe-600 flex items-center justify-center">
          <Bookmark className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Saved Posts</h1>
          <p className="text-xs text-slate-500">Your private collection of bookmarked community posts</p>
        </div>
      </div>

      {/* Bookmarks List */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-vibe-600 animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-400">Loading your saved posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-card border border-slate-200/80 space-y-3">
          <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No saved posts yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Whenever you find a post you'd like to revisit later, click the bookmark icon on any post in the feed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
