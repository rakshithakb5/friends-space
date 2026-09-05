'use client';

import { useState } from 'react';
import {
  Shield,
  Footprints,
  BookOpen,
  Smartphone,
  LogOut,
  Check,
  Trash2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/app-context';
import { AppHeader } from '@/components/app-header';

export default function ProfilePage() {
  const {
    currentUser,
    privacySettings,
    updatePrivacySettings,
    updateProfile,
    getFriendships,
    removeFriend,
    logout,
    login,
    isDemoMode,
  } = useApp();

  const { friends } = getFriendships();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSaveProfile = async () => {
    await updateProfile({ full_name: fullName, bio });
    setIsEditingProfile(false);
    showFeedback('Profile updated successfully');
  };

  const handleTogglePrivacy = async (key: 'share_move' | 'share_read' | 'share_screen') => {
    if (!privacySettings) return;
    const nextVal = !privacySettings[key];
    await updatePrivacySettings({ [key]: nextVal });
    showFeedback(`Updated sharing setting`);
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  // Demo user switcher to easily test friend perspectives
  const handleSwitchUser = async (username: string) => {
    await login(username);
    showFeedback(`Switched to @${username}`);
  };

  return (
    <div className="min-h-screen">
      <AppHeader title="Profile & Privacy" subtitle="Your space settings" />

      <div className="px-4 py-4 space-y-4">
        {feedback && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* PROFILE CARD */}
        <section className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <div className="flex items-start gap-3.5">
            <img
              src={
                currentUser?.avatar_url ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.username || 'user'}`
              }
              alt={currentUser?.full_name || 'avatar'}
              className="w-14 h-14 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700 shadow-xs"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-neutral-900 dark:text-white text-base truncate">
                  {currentUser?.full_name}
                </h3>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {isEditingProfile ? 'Cancel' : 'Edit'}
                </button>
              </div>
              <p className="text-xs text-neutral-400">@{currentUser?.username}</p>
              {currentUser?.bio && !isEditingProfile && (
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1.5 leading-relaxed">
                  {currentUser.bio}
                </p>
              )}
            </div>
          </div>

          {isEditingProfile && (
            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Bio / Tagline
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Short note about your goals..."
                  className="w-full text-xs px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-medium"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Save Profile
              </button>
            </div>
          )}
        </section>

        {/* PRIVACY CONTROLS (CORE REQUIREMENT 7) */}
        <section className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Shield className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
              Sharing Controls
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mb-4">
            Control what parts of your daily journey your accepted friends can see.
          </p>

          <div className="space-y-3">
            {/* MOVE TOGGLE */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
              <div className="flex items-center gap-2.5">
                <Footprints className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">Share Steps & Walking</p>
                  <p className="text-[11px] text-neutral-400">Steps, distance, and active minutes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePrivacy('share_move')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  privacySettings?.share_move ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    privacySettings?.share_move ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* READ TOGGLE */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">Share Reading Progress</p>
                  <p className="text-[11px] text-neutral-400">Current book, page, and percentage</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePrivacy('share_read')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  privacySettings?.share_read ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    privacySettings?.share_read ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* SCREEN TIME TOGGLE */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">Share Screen Time</p>
                  <p className="text-[11px] text-neutral-400">Total hours & minutes summary only</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePrivacy('share_screen')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  privacySettings?.share_screen ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    privacySettings?.share_screen ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-3.5 p-2.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/40 text-[11px] text-neutral-500 flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
            <span>
              Friends Space never shares detailed app-by-app usage. When Screen Time is shared, friends only see your total time summary.
            </span>
          </div>
        </section>

        {/* MANAGE FRIENDS (REMOVE FRIEND) */}
        <section className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <h3 className="font-bold text-neutral-900 dark:text-white text-sm mb-1">
            Connected Friends ({friends.length})
          </h3>
          <p className="text-xs text-neutral-400 mb-3">
            You can disconnect from a friend at any time.
          </p>

          {friends.length === 0 ? (
            <p className="text-xs text-neutral-400 py-2">No connected friends yet.</p>
          ) : (
            <div className="space-y-2">
              {friends.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={
                        f.avatar_url ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${f.username}`
                      }
                      alt={f.full_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {f.full_name}
                      </p>
                      <p className="text-[10px] text-neutral-400 truncate">@{f.username}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFriend(f.friendshipId)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-xs flex items-center gap-1"
                    title="Remove friend"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">Remove</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* DEMO / TEST ACCOUNT SWITCHER */}
        {isDemoMode && (
          <section className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
            <div className="flex items-center gap-1.5 mb-1 text-emerald-700 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="font-bold text-sm">Interactive Persona Switcher</h3>
            </div>
            <p className="text-xs text-neutral-400 mb-3">
              Switch between users to verify friend request flows and privacy visibility in real time:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { username: 'alex_r', name: 'Alex (Owner)' },
                { username: 'sarah_m', name: 'Sarah (Friend)' },
                { username: 'david_k', name: 'David (Screen Private)' },
                { username: 'elena_v', name: 'Elena (Move Private)' },
              ].map((persona) => (
                <button
                  key={persona.username}
                  onClick={() => handleSwitchUser(persona.username)}
                  className={`px-2.5 py-1.5 rounded-xl text-left border text-xs transition ${
                    currentUser?.username === persona.username
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="truncate font-semibold">{persona.name}</div>
                  <div className="text-[10px] text-neutral-400">@{persona.username}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* LOGOUT BUTTON */}
        <div className="pt-2 pb-6">
          <button
            onClick={logout}
            className="w-full py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 text-neutral-600 dark:text-neutral-300 font-semibold text-xs transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
