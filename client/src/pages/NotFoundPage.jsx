import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-vibe-50 text-vibe-600 flex items-center justify-center mb-4 shadow-xs">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">404</h1>
      <h2 className="text-lg font-bold text-slate-800 mb-1">Page Not Found</h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6">
        The community page or conversation you are looking for doesn't exist or has moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-vibe-600 hover:bg-vibe-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
      >
        <Home className="w-4 h-4" />
        <span>Return to Feed</span>
      </Link>
    </div>
  );
}
