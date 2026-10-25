import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AppLayout from './layouts/AppLayout';
import AuthGuard from './layouts/AuthGuard';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import ExplorePage from './pages/ExplorePage';
import CirclesPage from './pages/CirclesPage';
import CircleDetailPage from './pages/CircleDetailPage';
import DailySparkPage from './pages/DailySparkPage';
import SavedPostsPage from './pages/SavedPostsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          {/* Public standalone pages */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Main App Layout */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<FeedPage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="circles" element={<CirclesPage />} />
            <Route path="circles/:slug" element={<CircleDetailPage />} />
            <Route path="daily-spark" element={<DailySparkPage />} />
            <Route path="profile/:username" element={<ProfilePage />} />

            {/* Protected Routes */}
            <Route
              path="saved"
              element={
                <AuthGuard>
                  <SavedPostsPage />
                </AuthGuard>
              }
            />
            <Route
              path="notifications"
              element={
                <AuthGuard>
                  <NotificationsPage />
                </AuthGuard>
              }
            />
            <Route
              path="settings"
              element={
                <AuthGuard>
                  <SettingsPage />
                </AuthGuard>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}
