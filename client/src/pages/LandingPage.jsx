import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Compass,
  MessageSquare,
  Bookmark,
  ShieldCheck,
  ArrowRight,
  Heart,
  Smile,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  // If already logged in, redirect straight to feed
  if (user) {
    return <Navigate to="/" replace />;
  }

  const features = [
    {
      icon: MessageSquare,
      title: 'Genuine Community Feed',
      description:
        'Share thoughts, stories, and photographs with real people. Every post and comment is permanently backed by MongoDB.',
      badge: 'Real Content'
    },
    {
      icon: Users,
      title: 'Vibe Circles',
      description:
        'Join topic-focused circles from Technology to Photography and Music. Find your people and exchange authentic perspectives.',
      badge: 'Micro-Communities'
    },
    {
      icon: Sparkles,
      title: 'Daily Spark Challenges',
      description:
        'A fresh daily creative prompt designed to spark mindfulness, creativity, and thoughtful reflection across the community.',
      badge: 'Daily Prompt'
    },
    {
      icon: Heart,
      title: '6 Expressive Vibes',
      description:
        'Move beyond the flat thumbs-up. Express genuine reactions: Like, Love, Inspired, Happy, Curious, and Supportive.',
      badge: 'Vibe Reactions'
    },
    {
      icon: Bookmark,
      title: 'Private Bookmarks',
      description:
        'Save inspiring conversations and posts to your private saved collection, accessible only to you across devices.',
      badge: 'Private & Secure'
    },
    {
      icon: ShieldCheck,
      title: 'Zero Bot Activity',
      description:
        'No fake follower counts, no simulated bots, no synthetic filler posts. Only registered members building real connections.',
      badge: 'Authentic'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-vibe-600 via-vibe-500 to-coral-400 flex items-center justify-center text-white shadow-md shadow-vibe-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-vibe-700 via-vibe-600 to-coral-500 bg-clip-text text-transparent">
              VibeWall
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-vibe-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-vibe-600 hover:bg-vibe-700 rounded-full shadow-sm hover:shadow-md transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-vibe-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-coral-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vibe-100/80 border border-vibe-200 text-vibe-800 text-xs font-bold uppercase tracking-wider mb-6 animate-in fade-in duration-300">
              <Sparkles className="w-3.5 h-3.5 text-vibe-600" />
              <span>Real Social Community Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Where Real Voices Meet <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-vibe-600 via-indigo-600 to-coral-500 bg-clip-text text-transparent">
                Authentic Communities
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed mb-10">
              VibeWall is a genuine community message board for real people to publish ideas,
              join niche topic circles, tackle daily creative sparks, and interact through meaningful vibes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-vibe-600 via-vibe-500 to-indigo-600 hover:from-vibe-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-vibe-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Create Your Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm sm:text-base border border-slate-200 shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In to Your Feed</span>
              </Link>
            </div>

            {/* Authenticity Guarantee Callout */}
            <div className="mt-12 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100/80 px-4 py-2 rounded-full border border-slate-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero fabricated demo accounts. Real MongoDB data persistence.</span>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/60">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Designed for Thoughtful Interaction
            </h2>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              Every feature on VibeWall is built to cultivate authentic expression and organic discovery without artificial engagement traps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-slate-200/80 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-vibe-50 text-vibe-600 flex items-center justify-center shadow-xs">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold text-vibe-700 bg-vibe-50 px-2.5 py-1 rounded-full border border-vibe-100">
                        {feature.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-3xl bg-gradient-to-r from-vibe-700 via-indigo-700 to-purple-800 text-white p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-xl mx-auto space-y-5">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Ready to find your vibe?
              </h2>
              <p className="text-vibe-100 text-xs sm:text-sm leading-relaxed">
                Join our genuine social community. Register your real profile and publish your first post today.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-vibe-800 hover:bg-slate-100 font-bold text-sm shadow-md active:scale-95 transition-all"
              >
                <span>Get Started in 30 Seconds</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 text-center text-xs text-slate-400">
        <p>© 2026 VibeWall — Interactive Community Message Board. Built with Node.js, Express, MongoDB & React.</p>
      </footer>
    </div>
  );
}
