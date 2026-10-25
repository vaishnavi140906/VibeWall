import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Bell,
  LogOut,
  User,
  Settings,
  PlusCircle,
  Menu,
  X,
  Compass,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from './Avatar';

export default function Navbar({ onOpenCreatePost }) {
  const { user, logout } = useAuth();
  const { unreadCount, latestNotification, clearLatestNotification } = useSocket();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-shadow duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-vibe-600 via-vibe-500 to-coral-400 flex items-center justify-center text-white shadow-md shadow-vibe-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-vibe-700 via-vibe-600 to-coral-500 bg-clip-text text-transparent">
                  VibeWall
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 -mt-1 hidden sm:block">
                  Community Board
                </span>
              </div>
            </Link>
          </div>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-md hidden md:block"
          >
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search posts, topics, members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm rounded-full border border-transparent focus:border-vibe-300 focus:ring-2 focus:ring-vibe-100 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {onOpenCreatePost && (
                  <button
                    onClick={onOpenCreatePost}
                    className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-vibe-600 to-vibe-500 hover:from-vibe-700 hover:to-vibe-600 text-white text-sm font-semibold shadow-sm hover:shadow-md hover:shadow-vibe-500/20 active:scale-95 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Post</span>
                  </button>
                )}

                {/* Notification Bell */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-slate-600 hover:text-vibe-600 hover:bg-vibe-50 rounded-full transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-coral-500 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-vibe-200 transition-all focus:outline-none"
                  >
                    <Avatar user={user} size="sm" />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-800 truncate">{user.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">@{user.username}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to={`/profile/${user.username}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-vibe-600 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/saved"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-vibe-600 transition-colors"
                        >
                          <Bookmark className="w-4 h-4 text-slate-400" />
                          <span>Saved Posts</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-vibe-600 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>Settings</span>
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-vibe-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-vibe-600 hover:bg-vibe-700 rounded-full shadow-sm hover:shadow-md transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Real-time Toast Banner for incoming notification */}
      {latestNotification && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm bg-white rounded-2xl shadow-2xl border border-vibe-100 p-4 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <Avatar user={latestNotification.sender} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800">New Notification</p>
            <p className="text-xs text-slate-600 truncate mt-0.5">{latestNotification.message}</p>
          </div>
          <button
            onClick={clearLatestNotification}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
