import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Users, Hash, MessageSquare, Loader2, Compass, ArrowRight } from 'lucide-react';
import Avatar from '../components/common/Avatar';
import CircleCard from '../components/circles/CircleCard';
import PostCard from '../components/feed/PostCard';
import api from '../services/api';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState({ users: [], posts: [], circles: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'posts', 'people', 'circles'

  useEffect(() => {
    setQuery(queryParam);
    if (queryParam.trim()) {
      handleSearch(queryParam.trim());
    } else {
      setResults({ users: [], posts: [], circles: [] });
    }
  }, [queryParam]);

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const res = await api.get('/search', { params: { q: searchTerm } });
      if (res.data.success) {
        setResults({
          users: res.data.users || [],
          posts: res.data.posts || [],
          circles: res.data.circles || []
        });
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    } else {
      setSearchParams({});
    }
  };

  const hasResults =
    results.users.length > 0 ||
    results.posts.length > 0 ||
    results.circles.length > 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Search Header */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-vibe-50 text-vibe-600">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Explore VibeWall</h1>
            <p className="text-xs text-slate-500">Discover registered members, topic circles, and conversations</p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by keywords, @username, or circle topic..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 focus:bg-white text-sm rounded-2xl border border-slate-200 focus:border-vibe-400 focus:ring-2 focus:ring-vibe-100 outline-none transition-all placeholder:text-slate-400"
          />
        </form>

        {queryParam && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-full font-bold transition-colors ${
                activeTab === 'all' ? 'bg-vibe-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({results.posts.length + results.users.length + results.circles.length})
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-3 py-1 rounded-full font-bold transition-colors ${
                activeTab === 'posts' ? 'bg-vibe-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Posts ({results.posts.length})
            </button>
            <button
              onClick={() => setActiveTab('people')}
              className={`px-3 py-1 rounded-full font-bold transition-colors ${
                activeTab === 'people' ? 'bg-vibe-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              People ({results.users.length})
            </button>
            <button
              onClick={() => setActiveTab('circles')}
              className={`px-3 py-1 rounded-full font-bold transition-colors ${
                activeTab === 'circles' ? 'bg-vibe-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Circles ({results.circles.length})
            </button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-vibe-600 animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-400">Searching database records...</p>
        </div>
      ) : queryParam && !hasResults ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-card border border-slate-200/80 space-y-2">
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No results found for "{queryParam}"</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for a different keyword, category, or registered username.
          </p>
        </div>
      ) : queryParam ? (
        <div className="space-y-6">
          {/* People Section */}
          {(activeTab === 'all' || activeTab === 'people') && results.users.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-vibe-600" />
                <span>People ({results.users.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.users.map((u) => (
                  <Link
                    key={u._id}
                    to={`/profile/${u.username}`}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-card-hover transition-all flex items-center gap-3 group"
                  >
                    <Avatar user={u} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-vibe-600 transition-colors truncate">
                        {u.fullName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">@{u.username}</p>
                      {u.bio && (
                        <p className="text-xs text-slate-600 line-clamp-1 mt-1">{u.bio}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Circles Section */}
          {(activeTab === 'all' || activeTab === 'circles') && results.circles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-vibe-600" />
                <span>Circles ({results.circles.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.circles.map((c) => (
                  <CircleCard key={c._id} circle={c} />
                ))}
              </div>
            </div>
          )}

          {/* Posts Section */}
          {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-vibe-600" />
                <span>Posts ({results.posts.length})</span>
              </h3>
              <div className="space-y-4">
                {results.posts.map((p) => (
                  <PostCard key={p._id} post={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Default Explore Suggestions */
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-vibe-50 via-indigo-50/40 to-slate-50 rounded-3xl p-6 sm:p-8 border border-vibe-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Browse Authentic Conversations
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mb-4">
              Search above or tap on a featured topic circle to discover discussions happening in real time across the VibeWall community.
            </p>
            <Link
              to="/circles"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-vibe-600 text-white text-xs font-bold shadow-sm hover:bg-vibe-700 transition-all"
            >
              <span>Explore All Circles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
