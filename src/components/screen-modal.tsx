'use client';

import { useState } from 'react';
import { Smartphone, X, Check, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/app-context';

export function ScreenModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { todayHabit, updateHabit } = useApp();

  const totalInitialMinutes = todayHabit?.screen_time_minutes || 0;
  const initialHours = Math.floor(totalInitialMinutes / 60);
  const initialMins = totalInitialMinutes % 60;

  const [hours, setHours] = useState<number>(initialHours);
  const [minutes, setMinutes] = useState<number>(initialMins);
  const [showPrivacyNote, setShowPrivacyNote] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const totalCalculated = hours * 60 + minutes;

  const handleSave = async () => {
    setIsSaving(true);
    await updateHabit({
      screen_time_minutes: totalCalculated,
      screen_source: 'manual',
    });
    setIsSaving(false);
    onClose();
  };

  const setPreset = (h: number, m: number) => {
    setHours(h);
    setMinutes(m);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Smartphone className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Log Screen Time</h3>
              <p className="text-xs text-neutral-500">Today&apos;s total device usage summary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy & Sandbox Guarantee */}
        <div className="my-3">
          <button
            type="button"
            onClick={() => setShowPrivacyNote(!showPrivacyNote)}
            className="text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Private by design: Total time only</span>
          </button>
          {showPrivacyNote && (
            <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60">
              Web browsers cannot access Android or iOS Screen Time directly. Friends Space never collects or sees individual app usage — only your total daily summary. Check your phone&apos;s Screen Time widget and enter the hours below.
            </p>
          )}
        </div>

        <div className="space-y-4 py-2">
          {/* Quick presets */}
          <div>
            <span className="text-[11px] text-neutral-400 font-medium">Quick presets:</span>
            <div className="flex items-center gap-2 mt-1.5">
              {[
                { label: '1h 30m', h: 1, m: 30 },
                { label: '2h 15m', h: 2, m: 15 },
                { label: '3h 00m', h: 3, m: 0 },
                { label: '4h 00m', h: 4, m: 0 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPreset(p.h, p.m)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40 hover:bg-purple-100"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Picker Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Hours
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, Math.min(24, parseInt(e.target.value) || 0)))}
                  className="w-full text-2xl font-bold px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-xs text-neutral-500 font-medium">hrs</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Minutes
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full text-2xl font-bold px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-xs text-neutral-500 font-medium">mins</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-between">
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Total logged time</span>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {hours}h {minutes}m ({totalCalculated} mins)
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Time'}
          </button>
        </div>
      </div>
    </div>
  );
}
