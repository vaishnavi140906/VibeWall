import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreatePostCard from '../components/feed/CreatePostCard';
import PostCard from '../components/feed/PostCard';
import api from '../services/api';

export default function DailySparkPage() {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const fetchChallenge = async () => {
    setLoading(true);
    try {
      const res = await api.get('/challenges/today');
      if (res.data.success) {
        setChallenge(res.data.challenge);
        setHasSubmitted(Boolean(res.data.challenge.hasSubmitted));

        // Fetch submissions
        const subRes = await api.get(`/challenges/${res.data.challenge._id}/submissions`);
        if (subRes.data.success) {
          setSubmissions(subRes.data.posts);
        }
      }
    } catch (err) {
      console.error('Failed to load daily spark:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, []);

  const handlePostCreated = (newPost) => {
    setSubmissions((prev) => [newPost, ...prev]);
    setHasSubmitted(true);
  };

  const handlePostDeleted = (deletedPostId) => {
    setSubmissions((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  const formatDate = (dateString) => {
    return new Date(dateString || Date.now()).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-400">Loading today's Daily Spark...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Spark Header Banner */}
      <div className="bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-100/30 rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Daily Spark Challenge</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>{formatDate(challenge?.date)}</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
          {challenge?.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium bg-white/70 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-amber-200/60 my-4 shadow-xs">
          "{challenge?.prompt}"
        </p>

        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-2">
          <span className="bg-amber-100/80 text-amber-800 px-2.5 py-1 rounded-full">
            Theme: {challenge?.category}
          </span>
          <span>
            {submissions.length} {submissions.length === 1 ? 'response' : 'responses'} submitted today
          </span>
        </div>
      </div>

      {/* Submission Prompt / Form */}
      {user ? (
        hasSubmitted ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs font-bold">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>You have published your response for today's Daily Spark! Feel free to share more thoughts or explore what other members shared below.</span>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
              Share Your Response
            </h3>
            <CreatePostCard
              defaultChallengeId={challenge?._id}
              onPostCreated={handlePostCreated}
              placeholder="Write your response to today's prompt..."
            />
          </div>
        )
      ) : (
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 text-center space-y-2 shadow-card">
          <p className="text-sm font-bold text-slate-800">Want to join today's Daily Spark?</p>
          <p className="text-xs text-slate-500">Sign in to publish your response and connect with other community members.</p>
        </div>
      )}

      {/* Responses Feed */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
          Community Responses ({submissions.length})
        </h3>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-card border border-slate-200/80 space-y-2">
            <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-800">No responses yet for today</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first member to share your perspective on today's spark!
            </p>
          </div>
        ) : (
          submissions.map((post) => (
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
