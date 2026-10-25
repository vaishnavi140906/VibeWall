import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Camera,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import api from '../services/api';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Edit State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [interestsString, setInterestsString] = useState(
    (user?.interests || []).join(', ')
  );
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });

  // Avatar State
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState({ text: '', type: '' });
  const avatarInputRef = useRef(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });

  // Delete Account State
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ text: '', type: '' });

    try {
      const interests = interestsString
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

      const res = await api.put('/users/profile', {
        fullName: fullName.trim(),
        bio: bio.trim(),
        interests
      });

      if (res.data.success) {
        updateUser(res.data.user);
        setProfileMessage({ text: 'Profile updated successfully!', type: 'success' });
      }
    } catch (err) {
      setProfileMessage({
        text: err.response?.data?.message || 'Failed to update profile.',
        type: 'error'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Avatar Upload
  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarMessage({ text: 'Please select a valid image file.', type: 'error' });
      return;
    }

    setAvatarLoading(true);
    setAvatarMessage({ text: '', type: '' });

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        updateUser({ avatar: res.data.avatar });
        setAvatarMessage({ text: 'Avatar uploaded successfully!', type: 'success' });
      }
    } catch (err) {
      setAvatarMessage({
        text: err.response?.data?.message || 'Failed to upload avatar.',
        type: 'error'
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage({ text: '', type: '' });

    try {
      const res = await api.put('/auth/update-password', {
        currentPassword,
        newPassword,
        confirmNewPassword
      });

      if (res.data.success) {
        setPasswordMessage({ text: 'Password changed successfully!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      setPasswordMessage({
        text: err.response?.data?.message || 'Failed to change password.',
        type: 'error'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      setDeleteError('Password confirmation is required.');
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');

    try {
      const res = await api.delete('/auth/delete-account', {
        data: { password: deletePassword }
      });

      if (res.data.success) {
        await logout();
        navigate('/landing');
      }
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500">Manage your profile, password, and account security</p>
      </div>

      {/* 1. Profile Photo */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Camera className="w-4 h-4 text-vibe-600" />
          <span>Profile Picture</span>
        </h2>

        <div className="flex items-center gap-5">
          <Avatar user={user} size="xl" />
          <div className="space-y-2">
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarFile}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarLoading}
              className="px-4 py-2 rounded-xl bg-vibe-600 hover:bg-vibe-700 text-white text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {avatarLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              <span>Upload New Photo</span>
            </button>
            <p className="text-[11px] text-slate-400">
              JPEG, PNG, WEBP or GIF (Max 5MB). Stored persistently via Cloudinary.
            </p>
          </div>
        </div>

        {avatarMessage.text && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              avatarMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {avatarMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{avatarMessage.text}</span>
          </div>
        )}
      </div>

      {/* 2. Edit Profile Details */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <User className="w-4 h-4 text-vibe-600" />
          <span>Profile Information</span>
        </h2>

        {profileMessage.text && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              profileMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {profileMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{profileMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-vibe-400 focus:ring-2 focus:ring-vibe-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Username
            </label>
            <input
              type="text"
              disabled
              value={`@${user?.username}`}
              className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-400">Usernames are permanent unique identifiers.</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={250}
              placeholder="Tell other community members a bit about yourself..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-vibe-400 focus:ring-2 focus:ring-vibe-100 resize-none"
            />
            <span className="text-[10px] text-slate-400">{bio.length}/250 characters</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Interests (comma separated)
            </label>
            <input
              type="text"
              placeholder="Design, Open Source, Lo-Fi, Photography"
              value={interestsString}
              onChange={(e) => setInterestsString(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-vibe-400 focus:ring-2 focus:ring-vibe-100"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-2.5 rounded-xl bg-vibe-600 hover:bg-vibe-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {profileLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Change Password */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Lock className="w-4 h-4 text-vibe-600" />
          <span>Security & Password</span>
        </h2>

        {passwordMessage.text && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              passwordMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {passwordMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{passwordMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-vibe-400 focus:ring-2 focus:ring-vibe-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-vibe-400 focus:ring-2 focus:ring-vibe-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-vibe-400 focus:ring-2 focus:ring-vibe-100"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-6 py-2.5 rounded-xl bg-vibe-600 hover:bg-vibe-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {passwordLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. Danger Zone: Delete Account */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-rose-200 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-rose-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Danger Zone</span>
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Permanently delete your VibeWall account and remove all your published posts, comments, reactions, bookmarks, and circle memberships from MongoDB.
        </p>

        {!showDeleteModal ? (
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete My Account</span>
          </button>
        ) : (
          <form onSubmit={handleDeleteAccount} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
            {deleteError && (
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-800 text-xs">
                {deleteError}
              </div>
            )}
            <p className="text-xs font-bold text-rose-900">
              Confirm your password to permanently delete your account:
            </p>
            <input
              type="password"
              required
              placeholder="Enter your current password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-rose-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-200"
            />
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={deleteLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {deleteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm Permanent Deletion</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
