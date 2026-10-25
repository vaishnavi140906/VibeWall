import React, { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Home,
  Compass,
  Users,
  Sparkles,
  Bookmark,
  Bell,
  User,
  Settings,
  PlusCircle,
  Hash
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

export default function Sidebar({ onOpenCreatePost }) {
  const { user } = useAuth();
  const { unreadCount } = useSocket();
  const [joinedCircles, setJoinedCircles] = useState([]);

  useEffect(() => {
    if (user) {
      api.get('/circles/my/joined')
        .then((res) => {
          if (res.data.success) {
            setJoinedCircles(res.data.circles.slice(0, 5));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const navItems = [
    { name: 'Home Feed', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Vibe Circles', path: '/circles', icon: Users },
    { name: 'Daily Spark', path: '/daily-spark', icon: Sparkles },
    ...(user
      ? [
          { name: 'Saved Posts', path: '/saved', icon: Bookmark },
          { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
          { name: 'My Profile', path: `/profile/${user.username}`, icon: User },
          { name: 'Settings', path: '/settings', icon: Settings }
        ]
      : [])
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 py-6 pr-6 space-y-6 select-none">
      {/* Primary Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-vibe-600 text-white shadow-md shadow-vibe-600/20'
                    : 'text-slate-600 hover:text-vibe-700 hover:bg-vibe-50/70'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-coral-500 text-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Create Post Action */}
      {user && onOpenCreatePost && (
        <button
          onClick={onOpenCreatePost}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-vibe-600 to-indigo-600 hover:from-vibe-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg shadow-vibe-500/20 active:scale-95 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Publish a Vibe</span>
        </button>
      )}

      {/* Joined Circles Quick Access */}
      {user && joinedCircles.length > 0 && (
        <div className="pt-4 border-t border-slate-200/60">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              My Circles
            </span>
            <Link
              to="/circles"
              className="text-xs font-semibold text-vibe-600 hover:text-vibe-700"
            >
              View All
            </Link>
          </div>
          <div className="space-y-1">
            {joinedCircles.map((circle) => (
              <Link
                key={circle._id}
                to={`/circles/${circle.slug}`}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:text-vibe-700 hover:bg-slate-100/70 transition-colors truncate"
              >
                <div className="w-6 h-6 rounded-lg bg-vibe-100 text-vibe-700 flex items-center justify-center shrink-0">
                  <Hash className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{circle.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Community Values Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-vibe-50 to-indigo-50/50 border border-vibe-100/80">
        <div className="flex items-center gap-2 text-vibe-700 mb-1">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Authentic Social</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          No fake bots or simulated activity. Real humans exchanging ideas and daily creativity.
        </p>
      </div>
    </aside>
  );
}
