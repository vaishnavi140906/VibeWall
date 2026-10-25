import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Cpu,
  Palette,
  GraduationCap,
  Camera,
  Headphones,
  Sparkles,
  Compass,
  Check,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ICON_MAP = {
  Cpu,
  Palette,
  GraduationCap,
  Camera,
  Headphones,
  Sparkles,
  Compass
};

export default function CircleCard({ circle, onMembershipToggle }) {
  const { user } = useAuth();
  const [isMember, setIsMember] = useState(Boolean(circle.isMember));
  const [memberCount, setMemberCount] = useState(circle.memberCount || 0);
  const [loading, setLoading] = useState(false);

  const IconComponent = ICON_MAP[circle.icon] || Compass;

  const handleToggleJoin = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please log in to join Vibe Circles.');
      return;
    }

    setLoading(true);
    try {
      if (isMember) {
        const res = await api.post(`/circles/${circle._id}/leave`);
        if (res.data.success) {
          setIsMember(false);
          setMemberCount(res.data.memberCount);
          if (onMembershipToggle) onMembershipToggle(circle._id, false);
        }
      } else {
        const res = await api.post(`/circles/${circle._id}/join`);
        if (res.data.success) {
          setIsMember(true);
          setMemberCount(res.data.memberCount);
          if (onMembershipToggle) onMembershipToggle(circle._id, true);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update membership.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-slate-200/80 transition-all hover:shadow-card-hover hover:-translate-y-0.5 flex flex-col justify-between group">
      {/* Circle Cover Banner */}
      <div className={`h-24 bg-gradient-to-r ${circle.coverColor || 'from-violet-500 to-indigo-600'} p-4 flex items-end justify-between relative`}>
        <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-vibe-700 -mb-6 ring-4 ring-white group-hover:scale-105 transition-transform">
          <IconComponent className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/90 bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-full">
          {circle.category}
        </span>
      </div>

      {/* Circle Details */}
      <div className="p-5 pt-8 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/circles/${circle.slug}`} className="block">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-vibe-600 transition-colors">
              {circle.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {circle.description}
          </p>
        </div>

        {/* Stats & Join Button */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1 font-semibold text-slate-600">
              <Users className="w-3.5 h-3.5" />
              <span>{memberCount}</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-slate-600">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{circle.postCount || 0}</span>
            </div>
          </div>

          <button
            onClick={handleToggleJoin}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              isMember
                ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                : 'bg-vibe-600 text-white hover:bg-vibe-700 shadow-xs'
            }`}
          >
            {isMember ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Joined</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Join</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
