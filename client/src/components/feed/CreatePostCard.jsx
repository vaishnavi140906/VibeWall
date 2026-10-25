import React, { useState, useEffect, useRef } from 'react';
import { Image, X, Send, Loader2, Sparkles, AlertCircle, Hash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import api from '../../services/api';

export default function CreatePostCard({ onPostCreated, defaultCircleId = null, defaultChallengeId = null, placeholder = "What's on your mind or inspiring you today?" }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedCircle, setSelectedCircle] = useState(defaultCircleId || '');
  const [circles, setCircles] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch available circles for the dropdown
    api.get('/circles')
      .then((res) => {
        if (res.data.success) {
          setCircles(res.data.circles);
        }
      })
      .catch(() => {});
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WEBP, GIF).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size cannot exceed 5MB.');
      return;
    }

    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      if (selectedCircle) {
        formData.append('circleId', selectedCircle);
      }
      if (defaultChallengeId) {
        formData.append('challengeId', defaultChallengeId);
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setContent('');
        removeImage();
        setIsExpanded(false);
        if (onPostCreated) {
          onPostCreated(res.data.post);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to publish post. Please verify your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-200/80 transition-all hover:shadow-card-hover">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-start gap-3.5">
          <Avatar user={user} size="md" />
          <div className="flex-1">
            <textarea
              rows={isExpanded ? 4 : 2}
              placeholder={placeholder}
              value={content}
              onFocus={() => setIsExpanded(true)}
              onChange={(e) => setContent(e.target.value)}
              maxLength={3000}
              className="w-full resize-none bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-sm text-slate-800 placeholder:text-slate-400 p-3.5 rounded-2xl border border-transparent focus:border-vibe-300 focus:ring-2 focus:ring-vibe-100 outline-none transition-all leading-relaxed"
            />
          </div>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-72 bg-slate-100 ml-13">
            <img
              src={imagePreview}
              alt="Upload preview"
              className="w-full h-auto max-h-72 object-contain"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Post Actions & Circles Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-vibe-600 hover:bg-vibe-50 transition-colors"
            >
              <Image className="w-4 h-4 text-vibe-500" />
              <span>{imageFile ? 'Change Photo' : 'Add Photo'}</span>
            </button>

            {/* Circle selector */}
            {!defaultCircleId && circles.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedCircle}
                  onChange={(e) => setSelectedCircle(e.target.value)}
                  className="text-xs bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl px-2.5 py-1.5 border-none outline-none font-medium cursor-pointer"
                >
                  <option value="">General Feed</option>
                  {circles.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {content.length > 2000 && (
              <span className="text-[11px] text-slate-400 font-mono">
                {content.length}/3000
              </span>
            )}

            <button
              type="submit"
              disabled={!content.trim() || loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-vibe-600 to-indigo-600 hover:from-vibe-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm hover:shadow-md hover:shadow-vibe-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Vibe</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
