import React, { useState, useRef, useEffect } from 'react';
import { SmilePlus } from 'lucide-react';

const REACTION_CONFIG = [
  { type: 'like', label: 'Like', emoji: '👍', color: 'text-blue-600 bg-blue-50' },
  { type: 'love', label: 'Love', emoji: '❤️', color: 'text-rose-600 bg-rose-50' },
  { type: 'inspired', label: 'Inspired', emoji: '✨', color: 'text-amber-600 bg-amber-50' },
  { type: 'happy', label: 'Happy', emoji: '😊', color: 'text-yellow-600 bg-yellow-50' },
  { type: 'curious', label: 'Curious', emoji: '🤔', color: 'text-purple-600 bg-purple-50' },
  { type: 'supportive', label: 'Supportive', emoji: '🤝', color: 'text-emerald-600 bg-emerald-50' }
];

export default function ReactionButton({ userReaction, reactionCounts = {}, onReact, disabled }) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalReactions = Object.values(reactionCounts).reduce((acc, count) => acc + count, 0);

  const activeReaction = REACTION_CONFIG.find((r) => r.type === userReaction);

  const handleQuickClick = () => {
    if (disabled) return;
    if (userReaction) {
      // Toggle off current
      onReact(userReaction);
    } else {
      // Default to 'like' or show picker
      onReact('like');
    }
  };

  const handleSelectReaction = (type) => {
    setShowPicker(false);
    onReact(type);
  };

  return (
    <div className="relative inline-block" ref={pickerRef}>
      {/* Reaction Picker Popover */}
      {showPicker && (
        <div className="absolute bottom-full mb-2 left-0 z-30 bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-slate-200/80 p-1.5 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150">
          {REACTION_CONFIG.map((r) => (
            <button
              key={r.type}
              type="button"
              onClick={() => handleSelectReaction(r.type)}
              className={`p-2 rounded-full hover:scale-125 transition-transform flex items-center justify-center text-lg ${
                userReaction === r.type ? 'bg-vibe-100 ring-2 ring-vibe-400' : 'hover:bg-slate-100'
              }`}
              title={r.label}
            >
              <span>{r.emoji}</span>
            </button>
          ))}
        </div>
      )}

      {/* Button & Counts */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleQuickClick}
          onMouseEnter={() => !disabled && setShowPicker(true)}
          disabled={disabled}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeReaction
              ? `${activeReaction.color} ring-1 ring-inset ring-current/20 shadow-sm`
              : 'text-slate-600 hover:text-vibe-600 hover:bg-slate-100'
          }`}
        >
          {activeReaction ? (
            <>
              <span className="text-sm">{activeReaction.emoji}</span>
              <span>{activeReaction.label}</span>
            </>
          ) : (
            <>
              <SmilePlus className="w-4 h-4 text-slate-500" />
              <span>React</span>
            </>
          )}
        </button>

        {/* Reaction Breakdown Badges */}
        {totalReactions > 0 && (
          <div className="flex items-center -space-x-1 pl-1">
            {REACTION_CONFIG.filter((r) => (reactionCounts[r.type] || 0) > 0)
              .slice(0, 3)
              .map((r) => (
                <span
                  key={r.type}
                  className="w-5 h-5 rounded-full bg-white shadow-xs border border-slate-100 flex items-center justify-center text-xs"
                  title={`${r.label}: ${reactionCounts[r.type]}`}
                >
                  {r.emoji}
                </span>
              ))}
            <span className="text-xs font-bold text-slate-500 pl-1.5">
              {totalReactions}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
