'use client';

import { Sparkles, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/app-context';

export function AppHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { currentUser, isDemoMode } = useApp();

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200/60 dark:border-neutral-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white">
              {title || 'Friends Space'}
            </h1>
          </div>
          <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            {subtitle || formattedDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDemoMode && (
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Private V1
            </span>
          )}
          {currentUser?.avatar_url && (
            <img
              src={currentUser.avatar_url}
              alt={currentUser.full_name}
              className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 object-cover"
            />
          )}
        </div>
      </div>
    </header>
  );
}
