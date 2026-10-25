import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Loader2, Heart, MessageSquare, Sparkles } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import Avatar from '../components/common/Avatar';
import api from '../services/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadCount } = useSocket();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await api.put('/notifications/all/read');
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleClickNotification = async (notification) => {
    if (!notification.read) {
      try {
        await api.put(`/notifications/${notification._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        // Continue navigation regardless
      }
    }

    if (notification.post) {
      navigate(`/#post-${notification.post._id || notification.post}`);
    } else if (notification.sender?.username) {
      navigate(`/profile/${notification.sender.username}`);
    }
  };

  const getIcon = (type) => {
    if (type === 'reaction') return <Heart className="w-4 h-4 text-rose-500 fill-current" />;
    if (type === 'comment') return <MessageSquare className="w-4 h-4 text-blue-500 fill-current" />;
    return <Sparkles className="w-4 h-4 text-vibe-500 fill-current" />;
  };

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-vibe-50 text-vibe-600 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Notifications</h1>
            <p className="text-xs text-slate-500">Real-time interactions from your posts & comments</p>
          </div>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-vibe-700 hover:bg-vibe-50 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-vibe-600 animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-400">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-card border border-slate-200/80 space-y-3">
          <Bell className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No notifications yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When other real members react to your posts or comment on your vibes, you'll be notified here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-card border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleClickNotification(n)}
              className={`p-4 sm:p-5 flex items-start gap-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer ${
                !n.read ? 'bg-vibe-50/40' : ''
              }`}
            >
              <div className="relative shrink-0">
                <Avatar user={n.sender} size="md" />
                <span className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-xs">
                  {getIcon(n.type)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-slate-800 leading-snug">
                  {n.message}
                </p>
                <span className="text-[10px] text-slate-400 block mt-1">
                  {formatTime(n.createdAt)}
                </span>
              </div>

              {!n.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-vibe-600 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
