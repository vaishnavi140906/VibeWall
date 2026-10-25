import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Users, Sparkles, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function MobileNav() {
  const { user } = useAuth();
  const { unreadCount } = useSocket();

  const navItems = [
    { name: 'Feed', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Circles', path: '/circles', icon: Users },
    { name: 'Spark', path: '/daily-spark', icon: Sparkles },
    ...(user
      ? [
          { name: 'Alerts', path: '/notifications', icon: Bell, badge: unreadCount },
          { name: 'Profile', path: `/profile/${user.username}`, icon: User }
        ]
      : [
          { name: 'Login', path: '/login', icon: User }
        ])
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive ? 'text-vibe-600 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
              }`
            }
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 text-[10px] font-bold text-white bg-coral-500 rounded-full flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
