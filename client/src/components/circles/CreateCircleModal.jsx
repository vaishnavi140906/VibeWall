import React, { useState } from 'react';
import { Loader2, Plus, Sparkles } from 'lucide-react';
import Modal from '../common/Modal';
import api from '../../services/api';

const CATEGORIES = [
  'Technology',
  'Art and Design',
  'Student Life',
  'Photography',
  'Music',
  'Personal Growth',
  'General'
];

const GRADIENTS = [
  { label: 'Violet Indigo', value: 'from-violet-500 to-indigo-600' },
  { label: 'Blue Cyan', value: 'from-blue-500 to-cyan-600' },
  { label: 'Fuchsia Pink', value: 'from-fuchsia-500 to-pink-500' },
  { label: 'Emerald Teal', value: 'from-emerald-500 to-teal-600' },
  { label: 'Amber Orange', value: 'from-amber-500 to-orange-500' },
  { label: 'Rose Coral', value: 'from-rose-500 to-coral-500' }
];

export default function CreateCircleModal({ isOpen, onClose, onCircleCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [coverColor, setCoverColor] = useState(GRADIENTS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError('Please provide a circle name and description.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/circles', {
        name: name.trim(),
        description: description.trim(),
        category,
        coverColor
      });

      if (res.data.success) {
        setName('');
        setDescription('');
        setCategory('General');
        onClose();
        if (onCircleCreated) onCircleCreated(res.data.circle);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create circle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a New Vibe Circle">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Circle Name
          </label>
          <input
            type="text"
            placeholder="e.g. Indie Game Developers, Lo-Fi Producers"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-vibe-400 focus:ring-2 focus:ring-vibe-100"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-vibe-400 focus:ring-2 focus:ring-vibe-100 cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Describe what members will share and discuss in this circle..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-vibe-400 focus:ring-2 focus:ring-vibe-100 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Cover Theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            {GRADIENTS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setCoverColor(g.value)}
                className={`h-10 rounded-xl bg-gradient-to-r ${g.value} transition-all ${
                  coverColor === g.value ? 'ring-2 ring-offset-2 ring-vibe-600 scale-102' : 'opacity-80 hover:opacity-100'
                }`}
                title={g.label}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-vibe-600 hover:bg-vibe-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Create Circle</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
