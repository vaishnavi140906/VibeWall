import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Sparkles, Users, ArrowRight, ShieldCheck, Compass } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import MobileNav from '../components/common/MobileNav';
import Modal from '../components/common/Modal';
import CreatePostCard from '../components/feed/CreatePostCard';
import api from '../services/api';

export default function AppLayout() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [dailySpark, setDailySpark] = useState(null);
  const [featuredCircles, setFeaturedCircles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch today's challenge preview for right sidebar widget
    api.get('/challenges/today')
      .then((res) => {
        if (res.data.success) {
          setDailySpark(res.data.challenge);
        }
      })
      .catch(() => {});

    // Fetch popular circles
    api.get('/circles')
      .then((res) => {
        if (res.data.success) {
          setFeaturedCircles(res.data.circles.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  const handleGlobalPostCreated = (post) => {
    setIsCreatePostOpen(false);
    // Reload or dispatch event if on feed
    window.dispatchEvent(new CustomEvent('vibewall:post_created', { detail: post }));
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar onOpenCreatePost={() => setIsCreatePostOpen(true)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex gap-8">
        {/* Left Desktop Sidebar */}
        <Sidebar onOpenCreatePost={() => setIsCreatePostOpen(true)} />

        {/* Central Content Area */}
        <main className="flex-1 min-w-0 py-6 pb-24 lg:pb-12">
          <Outlet />
        </main>

        {/* Right Desktop Discovery Column */}
        <aside className="hidden xl:block w-80 shrink-0 py-6 space-y-6">
          {/* Daily Spark Widget */}
          {dailySpark && (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Daily Spark</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {dailySpark.submissionCount || 0} vibes
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                {dailySpark.title}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                "{dailySpark.prompt}"
              </p>
              <Link
                to="/daily-spark"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 group"
              >
                <span>View prompt responses</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}

          {/* Featured Circles Widget */}
          {featuredCircles.length > 0 && (
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Popular Circles
                </h4>
                <Link
                  to="/circles"
                  className="text-xs font-bold text-vibe-600 hover:text-vibe-700"
                >
                  Explore All
                </Link>
              </div>

              <div className="space-y-3">
                {featuredCircles.map((circle) => (
                  <Link
                    key={circle._id}
                    to={`/circles/${circle.slug}`}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${circle.coverColor || 'from-violet-500 to-indigo-600'} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-vibe-600 transition-colors truncate">
                          {circle.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {circle.memberCount} members
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-vibe-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Real Platform Guarantee */}
          <div className="px-4 py-3 rounded-2xl bg-slate-100/60 text-slate-500 text-[11px] flex items-center gap-2.5 border border-slate-200/50">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% verified member activity. No fake bots or mock stats.</span>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Create Post Modal */}
      <Modal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        title="Create New Post"
        maxWidth="max-w-xl"
      >
        <CreatePostCard onPostCreated={handleGlobalPostCreated} />
      </Modal>
    </div>
  );
}
