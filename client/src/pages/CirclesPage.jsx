import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CircleCard from '../components/circles/CircleCard';
import CreateCircleModal from '../components/circles/CreateCircleModal';
import api from '../services/api';

const CATEGORIES = [
  'All',
  'Technology',
  'Art and Design',
  'Student Life',
  'Photography',
  'Music',
  'Personal Growth'
];

export default function CirclesPage() {
  const { user } = useAuth();
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCircles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await api.get('/circles', { params });
      if (res.data.success) {
        setCircles(res.data.circles);
      }
    } catch (err) {
      console.error('Failed to load circles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCircles();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCircles();
  };

  const handleCircleCreated = (newCircle) => {
    setCircles((prev) => [newCircle, ...prev]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-vibe-600 mb-1">
            <Users className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Communities</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Vibe Circles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md">
            Connect around topics you care about. Join circles, start discussions, and view dedicated feeds.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-vibe-600 hover:bg-vibe-700 text-white text-xs font-bold shadow-md shadow-vibe-500/20 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Circle</span>
          </button>
        )}
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search circles by name or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white shadow-xs text-xs sm:text-sm rounded-2xl border border-slate-200/80 focus:border-vibe-400 focus:ring-2 focus:ring-vibe-100 outline-none transition-all placeholder:text-slate-400"
          />
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-vibe-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Circles Grid */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-vibe-600 animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-400">Loading circles...</p>
        </div>
      ) : circles.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-card border border-slate-200/80 space-y-3">
          <Users className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No circles found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try choosing another category, or start your own community circle above!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {circles.map((circle) => (
            <CircleCard key={circle._id} circle={circle} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateCircleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCircleCreated={handleCircleCreated}
      />
    </div>
  );
}
