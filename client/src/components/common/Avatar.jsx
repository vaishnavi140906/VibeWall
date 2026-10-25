import React, { useState } from 'react';

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base font-semibold',
  xl: 'w-20 h-20 text-xl font-bold',
  '2xl': 'w-24 h-24 text-2xl font-bold'
};

const gradientPalettes = [
  'from-violet-500 to-indigo-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-600',
  'from-purple-500 to-pink-500'
];

export default function Avatar({ user, size = 'md', className = '' }) {
  const [imageError, setImageError] = useState(false);

  const getInitials = () => {
    if (!user) return '?';
    const name = user.fullName || user.username || '';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || '?';
  };

  const getGradient = () => {
    const str = user?.username || user?.fullName || 'vibewall';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradientPalettes.length;
    return gradientPalettes[index];
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const avatarUrl = user?.avatar?.url;

  if (avatarUrl && !imageError) {
    return (
      <img
        src={avatarUrl}
        alt={user.fullName || user.username || 'User avatar'}
        onError={() => setImageError(true)}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white shadow-sm shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-tr ${getGradient()} text-white flex items-center justify-center font-medium ring-2 ring-white shadow-sm select-none shrink-0 ${className}`}
    >
      {getInitials()}
    </div>
  );
}
