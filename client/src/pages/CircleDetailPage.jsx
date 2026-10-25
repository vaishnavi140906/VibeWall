import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  ArrowLeft,
  Check,
  Plus,
  Loader2,
  Compass,
  Cpu,
  Palette,
  GraduationCap,
  Camera,
  Headphones,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreatePostCard from '../components/feed/CreatePostCard';
import PostCard from '../components/feed/PostCard';
import api from '../services/api';

const ICON_MAP = {
  Cpu,
  Palette,
  GraduationCap,
  Camera,
  Headphones,
  Sparkles,
  Compass
};

export default function CircleDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [circle, setCircle] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [memberCount, setMemberCount] = useState(0);

  const fetchCircleData = async () => {
    setLoading(true);
    try {
      const [circleRes, postsRes] = await Promise.all([
        api.get(`/circles/${slug}`),
        api.get(`/posts?circle=${slug}`)
      ]);

      if (circleRes.data.success) {
        setCircle(circleRes.data.circle);
        setIsMember(Boolean(circleRes.data.circle.isMember));
        setMemberCount(circleRes.data.circle.memberCount || 0);
      }

      if (postsRes.data.success) {
        setPosts(postsRes.data.posts);
      }
    } catch (err) {
      console.error('Failed to load circle data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCircleData();
  }, [slug]);

  const handleToggleJoin = async () => {
    if (!user) {
      alert('Please log in to join this circle.');
      return;
    }

    setJoinLoading(true);
    try {
      if (isMember) {
        const res = await api.post(`/circles/${circle._id}/leave`);
        if (res.data.success) {
          setIsMember(false);
          setMemberCount(res.data.memberCount);
        }
      } else {
        const res = await api.post(`/circles/${circle._id}/join`);
        if (res.data.success) {
          setIsMember(true);
          setMemberCount(res.data.memberCount);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update membership.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 text-vibe-600 animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-400">Loading circle...</p>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center shadow-card border border-slate-200/80 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Circle Not Found</h2>
        <p className="text-xs text-slate-500">The circle you are looking for does not exist or has been removed.</p>
        <Link
          to="/circles"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-vibe-600 text-white text-xs font-bold shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Circles</span>
        </Link>
      </div>
    );
  }

  const IconComponent = ICON_MAP[circle.icon] || Compass;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back button */}
      <Link
        to="/circles"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-vibe-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>All Circles</span>
      </Link>

      {/* Circle Banner Header */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-slate-200/80">
        <div className={`h-36 sm:h-44 bg-gradient-to-r ${circle.coverColor || 'from-violet-500 to-indigo-600'} p-6 flex items-end justify-between relative`}>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-vibe-700 -mb-10 sm:-mb-12 ring-4 ring-white z-10">
            <IconComponent className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-white/95 bg-black/25 backdrop-blur-xs px-3 py-1.5 rounded-full">
            {circle.category}
          </span>
        </div>

        <div className="p-6 pt-14 sm:pt-16 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {circle.name}
              </h1>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-1.5">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{memberCount} members</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>{posts.length} posts</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleToggleJoin}
              disabled={joinLoading}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all shrink-0 ${
                isMember
                  ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                  : 'bg-vibe-600 text-white hover:bg-vibe-700'
              }`}
            >
              {isMember ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Joined Circle</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Join Circle</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            {circle.description}
          </p>
        </div>
      </div>

      {/* Create Post targeted to this Circle */}
      {user && (
        <CreatePostCard
          defaultCircleId={circle._id}
          onPostCreated={handlePostCreated}
          placeholder={`Share a thought or question in ${circle.name}...`}
        />
      )}

      {/* Circle Posts Feed */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
          Circle Feed ({posts.length})
        </h3>

        {posts.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-card border border-slate-200/80 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-800">No posts in this circle yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first member to start a discussion in {circle.name}!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
}
