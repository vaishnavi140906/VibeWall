import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  MessageSquare,
  Users,
  Settings,
  Sparkles,
  Tag,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import PostCard from '../components/feed/PostCard';
import CircleCard from '../components/circles/CircleCard';
import api from '../services/api';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [joinedCircles, setJoinedCircles] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'circles'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile =
    currentUser &&
    profile &&
    currentUser.username.toLowerCase() === profile.username.toLowerCase();

  const fetchProfileData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, postsRes] = await Promise.all([
        api.get(`/users/${username}`),
        api.get(`/users/${username}/posts`)
      ]);

      if (profileRes.data.success) {
        setProfile(profileRes.data.profile);
      }

      if (postsRes.data.success) {
        setPosts(postsRes.data.posts);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  const formatDate = (dateString) => {
    return new Date(dateString || Date.now()).toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 text-vibe-600 animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-400">Loading user profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center shadow-card border border-slate-200/80 space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">{error || 'User Not Found'}</h2>
        <p className="text-xs text-slate-500">
          The requested profile does not exist or may have been deleted.
        </p>
        <Link
          to="/"
          className="inline-flex px-5 py-2.5 rounded-full bg-vibe-600 text-white text-xs font-bold shadow-sm"
        >
          Return to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-slate-200/80">
        {/* Decorative Cover */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-vibe-600 via-indigo-600 to-coral-400 p-6 flex justify-end items-start" />

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            <div className="relative inline-block">
              <Avatar user={profile} size="2xl" className="ring-4 ring-white" />
            </div>

            {isOwnProfile ? (
              <Link
                to="/settings"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors self-start sm:self-auto"
              >
                <Settings className="w-4 h-4" />
                <span>Edit Profile & Settings</span>
              </Link>
            ) : null}
          </div>

          <div className="space-y-3">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {profile.fullName}
              </h1>
              <p className="text-xs font-bold text-slate-400">@{profile.username}</p>
            </div>

            {profile.bio && (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}

            {/* Interests Chips */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {profile.interests.map((interest, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-vibe-700 bg-vibe-50 px-2.5 py-1 rounded-full border border-vibe-100"
                  >
                    <Tag className="w-3 h-3 text-vibe-500" />
                    <span>{interest}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Metadata and Real Stats */}
            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Joined {formatDate(profile.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-slate-800">{profile.postCount || posts.length}</span>
                <span>vibes published</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-slate-800">{profile.circleCount || 0}</span>
                <span>circles joined</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 px-2">
        <button
          onClick={() => setActiveTab('posts')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'posts'
              ? 'border-vibe-600 text-vibe-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Published Vibes ({posts.length})
        </button>
      </div>

      {/* Posts Feed */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center shadow-card border border-slate-200/80 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">No vibes published yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isOwnProfile
                  ? 'Share your first thoughts, insights, or photos with the community!'
                  : `@${profile.username} has not published any public posts yet.`}
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
      )}
    </div>
  );
}
