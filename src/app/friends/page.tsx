'use client';

import { Users, Footprints, BookOpen, Smartphone, UserPlus, EyeOff } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { AppHeader } from '@/components/app-header';
import Link from 'next/link';

export default function FriendsPage() {
  const { getFriendFeed, isLoading } = useApp();
  const friends = getFriendFeed();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-6 text-neutral-400">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mb-3" />
        <p className="text-xs">Loading Friends Space...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader title="Friends Space" subtitle="Shared daily progress" />

      <div className="px-4 py-4 space-y-4">
        {/* Intro Banner */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Friends Activity ({friends.length})
            </h2>
            <p className="text-xs text-neutral-500">
              Only progress your friends chose to share
            </p>
          </div>
          <Link
            href="/discover"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100 flex items-center gap-1 transition"
          >
            <UserPlus className="w-3.5 h-3.5" /> Find Friends
          </Link>
        </div>

        {/* Empty State */}
        {friends.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200/80 dark:border-neutral-800 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-white text-base">No Friends Yet</h3>
            <p className="text-xs text-neutral-500 max-w-xs mt-1 mb-5">
              Friends Space is much better together! Search for friends by their username to start sharing your daily Move, Read, and Screen habits.
            </p>
            <Link
              href="/discover"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Discover Users
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {friends.map((friend) => {
              const hasMove = friend.share_move && friend.steps !== null;
              const hasRead = friend.share_read && friend.book_title;
              const hasScreen = friend.share_screen && friend.screen_time_minutes !== null;

              const screenH = friend.screen_time_minutes ? Math.floor(friend.screen_time_minutes / 60) : 0;
              const screenM = friend.screen_time_minutes ? friend.screen_time_minutes % 60 : 0;

              return (
                <div
                  key={friend.friend_id}
                  className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-xs transition hover:border-neutral-300 dark:hover:border-neutral-700"
                >
                  {/* Friend Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                    <img
                      src={
                        friend.avatar_url ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${friend.username}`
                      }
                      alt={friend.full_name}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                        {friend.full_name}
                      </h3>
                      <p className="text-xs text-neutral-400 truncate">@{friend.username}</p>
                    </div>
                  </div>

                  {/* Shared Habits Grid */}
                  <div className="pt-3.5 space-y-3">
                    {/* MOVE PILLAR */}
                    {hasMove ? (
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100/80 dark:border-orange-900/30">
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400">
                            <Footprints className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 tracking-wider">
                              Move
                            </span>
                            <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                              {friend.steps?.toLocaleString()} steps
                            </p>
                          </div>
                        </div>
                        {friend.distance_km && (
                          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            {friend.distance_km} km
                          </span>
                        )}
                      </div>
                    ) : null}

                    {/* READ PILLAR */}
                    {hasRead ? (
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/80 dark:border-indigo-900/30">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {friend.book_cover_url ? (
                            <img
                              src={friend.book_cover_url}
                              alt={friend.book_title || 'book'}
                              className="w-8 h-10 rounded-md object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
                            />
                          ) : (
                            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                              <BookOpen className="w-4 h-4" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                              Read
                            </span>
                            <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                              {friend.book_title}
                            </p>
                            {friend.book_author && (
                              <p className="text-[11px] text-neutral-400 truncate">
                                {friend.book_author}
                              </p>
                            )}
                          </div>
                        </div>

                        {friend.reading_progress_percent !== null && (
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0 ml-2">
                            {friend.reading_progress_percent}%
                          </span>
                        )}
                      </div>
                    ) : null}

                    {/* SCREEN TIME PILLAR */}
                    {hasScreen ? (
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100/80 dark:border-purple-900/30">
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                            <Smartphone className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                              Screen Time
                            </span>
                            <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                              {screenH}h {screenM}m today
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-medium">
                          Total summary
                        </span>
                      </div>
                    ) : null}

                    {/* If all 3 are hidden by friend's privacy */}
                    {!hasMove && !hasRead && !hasScreen && (
                      <div className="py-2 px-3 text-center text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl flex items-center justify-center gap-1.5">
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>This friend keeps their daily metrics private</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
