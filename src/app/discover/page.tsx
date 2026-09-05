'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, Check, X, Clock, Users, Sparkles } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { AppHeader } from '@/components/app-header';
import type { Profile } from '@/types/database';

export default function DiscoverPage() {
  const {
    currentUser,
    searchProfiles,
    getFriendships,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [rawSearchResults, setRawSearchResults] = useState<Profile[]>([]);
  const [requestStatusMap, setRequestStatusMap] = useState<Record<string, string>>({});
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const { friends, incomingRequests, outgoingRequests } = getFriendships();

  useEffect(() => {
    if (!searchQuery.trim()) return;

    let active = true;
    const timer = setTimeout(async () => {
      const results = await searchProfiles(searchQuery);
      if (active) {
        setRawSearchResults(results);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, searchProfiles]);

  const searchResults = searchQuery.trim() ? rawSearchResults : [];

  const handleSendRequest = async (userId: string) => {
    setRequestStatusMap((prev) => ({ ...prev, [userId]: 'sending' }));
    const res = await sendFriendRequest(userId);
    if (res.success) {
      setRequestStatusMap((prev) => ({ ...prev, [userId]: 'sent' }));
      setFeedbackMessage('Friend request sent!');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } else {
      setRequestStatusMap((prev) => ({ ...prev, [userId]: 'failed' }));
      setFeedbackMessage(res.message || 'Could not send request');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const isFriend = (userId: string) => friends.some((f) => f.id === userId);
  const isIncoming = (userId: string) => incomingRequests.some((r) => r.id === userId);
  const isOutgoing = (userId: string) => outgoingRequests.some((r) => r.id === userId);

  return (
    <div className="min-h-screen">
      <AppHeader title="Discover" subtitle="Find friends & requests" />

      <div className="px-4 py-4 space-y-5">
        {feedbackMessage && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* 1. INCOMING FRIEND REQUESTS SECTION */}
        {incomingRequests.length > 0 && (
          <section className="bg-gradient-to-br from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/30 dark:to-neutral-900 rounded-3xl p-4 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Incoming Requests ({incomingRequests.length})
              </h3>
            </div>

            <div className="space-y-2.5">
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white dark:bg-neutral-900 rounded-2xl p-3 border border-emerald-100 dark:border-neutral-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        req.avatar_url ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${req.username}`
                      }
                      alt={req.full_name}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {req.full_name}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate">@{req.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      onClick={() => acceptFriendRequest(req.friendshipId)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1 transition"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => declineFriendRequest(req.friendshipId)}
                      className="p-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-xl text-xs transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. USERNAME SEARCH BAR */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Search by Username
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search e.g. sarah_m, david_k, marcus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs placeholder:text-neutral-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 3. SEARCH RESULTS */}
        {searchQuery.trim() && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-neutral-500 px-1">
              Search Results ({searchResults.length})
            </h3>

            {searchResults.length === 0 ? (
              <div className="p-6 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800">
                <p className="text-xs text-neutral-400">
                  No users found matching &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((user) => {
                  const alreadyFriend = isFriend(user.id);
                  const isPendingIn = isIncoming(user.id);
                  const isPendingOut = isOutgoing(user.id) || requestStatusMap[user.id] === 'sent';

                  return (
                    <div
                      key={user.id}
                      className="bg-white dark:bg-neutral-900 rounded-2xl p-3.5 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={
                            user.avatar_url ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`
                          }
                          alt={user.full_name}
                          className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                            {user.full_name}
                          </p>
                          <p className="text-[11px] text-neutral-400 truncate">@{user.username}</p>
                          {user.bio && (
                            <p className="text-[11px] text-neutral-500 truncate mt-0.5 max-w-xs">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 ml-2">
                        {alreadyFriend ? (
                          <span className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> Friends
                          </span>
                        ) : isPendingIn ? (
                          <span className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            Sent you request
                          </span>
                        ) : isPendingOut ? (
                          <span className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Requested
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendRequest(user.id)}
                            disabled={requestStatusMap[user.id] === 'sending'}
                            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1 transition"
                          >
                            <UserPlus className="w-3.5 h-3.5" /> Add Friend
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. CURRENT FRIENDS LIST (Manage friends) */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1 mb-2">
            Your Friends ({friends.length})
          </h3>

          {friends.length === 0 ? (
            <div className="p-5 text-center bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800">
              <p className="text-xs text-neutral-400">
                You haven&apos;t added any friends yet. Search for a username above!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((f) => (
                <div
                  key={f.id}
                  className="bg-white dark:bg-neutral-900 rounded-2xl p-3 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={
                        f.avatar_url ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${f.username}`
                      }
                      alt={f.full_name}
                      className="w-9 h-9 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {f.full_name}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate">@{f.username}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                    Connected
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
