'use client';

import { useState } from 'react';
import { Footprints, BookOpen, Smartphone, Plus, ArrowUpRight, ArrowDownRight, Minus, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/app-context';
import { AppHeader } from '@/components/app-header';
import { MoveModal } from '@/components/move-modal';
import { ReadModal } from '@/components/read-modal';
import { ScreenModal } from '@/components/screen-modal';
import Link from 'next/link';

export default function DashboardPage() {
  const { currentUser, todayHabit, yesterdayHabit, isLoading } = useApp();

  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isReadOpen, setIsReadOpen] = useState(false);
  const [isScreenOpen, setIsScreenOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-6 text-neutral-400">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mb-3" />
        <p className="text-xs">Loading Friends Space...</p>
      </div>
    );
  }

  // Calculate screen time delta vs yesterday
  let screenDeltaText = null;
  let screenDeltaIcon = null;
  let screenDeltaColor = 'text-neutral-500';

  if (todayHabit && yesterdayHabit && yesterdayHabit.screen_time_minutes > 0) {
    const diff = todayHabit.screen_time_minutes - yesterdayHabit.screen_time_minutes;
    const absDiff = Math.abs(diff);
    const diffH = Math.floor(absDiff / 60);
    const diffM = absDiff % 60;
    const diffFormatted = diffH > 0 ? `${diffH}h ${diffM}m` : `${diffM}m`;

    if (diff < 0) {
      screenDeltaText = `-${diffFormatted} vs yesterday`;
      screenDeltaIcon = <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      screenDeltaColor = 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60';
    } else if (diff > 0) {
      screenDeltaText = `+${diffFormatted} vs yesterday`;
      screenDeltaIcon = <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      screenDeltaColor = 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60';
    } else {
      screenDeltaText = 'Same as yesterday';
      screenDeltaIcon = <Minus className="w-3.5 h-3.5 text-neutral-400" />;
      screenDeltaColor = 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700';
    }
  }

  const stepsGoal = 10000;
  const currentSteps = todayHabit?.steps || 0;
  const stepPercent = Math.min(100, Math.round((currentSteps / stepsGoal) * 100));

  const screenHours = Math.floor((todayHabit?.screen_time_minutes || 0) / 60);
  const screenMins = (todayHabit?.screen_time_minutes || 0) % 60;

  return (
    <div className="min-h-screen">
      <AppHeader />

      <div className="px-4 py-4 space-y-4">
        {/* Welcome greeting */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-100 font-medium">Daily Journey</p>
              <h2 className="text-lg font-bold tracking-tight">
                Welcome back, {currentUser?.full_name?.split(' ')[0] || 'Friend'}!
              </h2>
            </div>
            <Link
              href="/friends"
              className="text-xs bg-white/20 hover:bg-white/30 backdrop-blur-xs px-2.5 py-1.5 rounded-xl font-medium flex items-center gap-1 transition"
            >
              See Friends <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 1. MOVE CARD */}
        <section className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-2xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Footprints className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Move
                </h3>
                <p className="text-xs text-neutral-400">Daily steps & activity</p>
              </div>
            </div>
            <button
              onClick={() => setIsMoveOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/40 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Update
            </button>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                  {currentSteps.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-neutral-400 ml-1.5">
                  / {stepsGoal.toLocaleString()} steps
                </span>
              </div>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                {stepPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mt-2.5">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${stepPercent}%` }}
              />
            </div>

            {/* Sub metrics */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
              <div>
                <span className="text-[11px] text-neutral-400 font-medium">Distance</span>
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  {todayHabit?.distance_km ?? '0.0'} km
                </p>
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 font-medium">Walking Time</span>
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  {todayHabit?.active_duration_minutes ?? 0} mins
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. READ CARD */}
        <section className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Read
                </h3>
                <p className="text-xs text-neutral-400">Current book & progress</p>
              </div>
            </div>
            <button
              onClick={() => setIsReadOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Update
            </button>
          </div>

          {todayHabit?.book_title ? (
            <div className="mt-3 flex gap-3.5 items-start">
              {todayHabit.book_cover_url ? (
                <img
                  src={todayHabit.book_cover_url}
                  alt={todayHabit.book_title}
                  className="w-14 h-20 rounded-xl object-cover shadow-sm border border-neutral-200 dark:border-neutral-800 shrink-0"
                />
              ) : (
                <div className="w-14 h-20 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500 shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                  {todayHabit.book_title}
                </h4>
                {todayHabit.book_author && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                    by {todayHabit.book_author}
                  </p>
                )}

                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-neutral-500 font-medium">
                      {todayHabit.current_page && todayHabit.total_pages
                        ? `Page ${todayHabit.current_page} of ${todayHabit.total_pages}`
                        : 'Reading'}
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {todayHabit.reading_progress_percent ?? 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${todayHabit.reading_progress_percent ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsReadOpen(true)}
              className="mt-3 p-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition"
            >
              <BookOpen className="w-6 h-6 text-neutral-400 mb-1" />
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">No current book set</p>
              <p className="text-[11px] text-neutral-400">Tap to add what you are reading today</p>
            </div>
          )}
        </section>

        {/* 3. SCREEN CARD */}
        <section className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Screen
                </h3>
                <p className="text-xs text-neutral-400">Total daily screen time</p>
              </div>
            </div>
            <button
              onClick={() => setIsScreenOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Log
            </button>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                {screenHours}h {screenMins}m
              </span>
              <p className="text-[11px] text-neutral-400 mt-0.5">Total screen summary</p>
            </div>

            {screenDeltaText && (
              <div
                className={`text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1 ${screenDeltaColor}`}
              >
                {screenDeltaIcon}
                <span>{screenDeltaText}</span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modals */}
      <MoveModal isOpen={isMoveOpen} onClose={() => setIsMoveOpen(false)} />
      <ReadModal isOpen={isReadOpen} onClose={() => setIsReadOpen(false)} />
      <ScreenModal isOpen={isScreenOpen} onClose={() => setIsScreenOpen(false)} />
    </div>
  );
}
