'use client';

import { useState } from 'react';
import { Footprints, X, Plus, Info, Check } from 'lucide-react';
import { useApp } from '@/context/app-context';

export function MoveModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { todayHabit, updateHabit } = useApp();

  const [steps, setSteps] = useState<number>(todayHabit?.steps || 0);
  const [distanceKm, setDistanceKm] = useState<number>(todayHabit?.distance_km || 0);
  const [durationMins, setDurationMins] = useState<number>(todayHabit?.active_duration_minutes || 0);
  const [showIntegrationInfo, setShowIntegrationInfo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleStepAdd = (increment: number) => {
    const nextSteps = Math.max(0, steps + increment);
    setSteps(nextSteps);
    // Average 1000 steps ≈ 0.75 km and ~10 mins
    if (distanceKm === 0 || distanceKm === Number(((steps * 0.00075)).toFixed(1))) {
      setDistanceKm(Number((nextSteps * 0.00075).toFixed(1)));
    }
    if (durationMins === 0 || durationMins === Math.round(steps / 100)) {
      setDurationMins(Math.round(nextSteps / 100));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateHabit({
      steps,
      distance_km: distanceKm,
      active_duration_minutes: durationMins,
      step_source: 'manual',
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
              <Footprints className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Update Move</h3>
              <p className="text-xs text-neutral-500">Track your daily walking & activity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Integration Notice */}
        <div className="my-3">
          <button
            type="button"
            onClick={() => setShowIntegrationInfo(!showIntegrationInfo)}
            className="text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5 text-neutral-400" />
            <span>Why manual entry? (Web sensor limitation)</span>
          </button>
          {showIntegrationInfo && (
            <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60">
              Web browsers cannot access phone hardware step sensors (HealthKit / Google Fit) in the background due to OS privacy sandboxing. This quick logger takes under 5 seconds.
            </p>
          )}
        </div>

        <div className="space-y-4 py-2">
          {/* Steps Counter */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Today&apos;s Steps
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="100"
                value={steps}
                onChange={(e) => setSteps(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-2xl font-bold px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-xs text-neutral-500 font-medium">steps</span>
            </div>

            {/* Quick add chips */}
            <div className="flex items-center gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => handleStepAdd(500)}
                className="text-xs px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/40 hover:bg-orange-100 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> 500
              </button>
              <button
                type="button"
                onClick={() => handleStepAdd(1000)}
                className="text-xs px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/40 hover:bg-orange-100 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> 1,000
              </button>
              <button
                type="button"
                onClick={() => handleStepAdd(2500)}
                className="text-xs px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/40 hover:bg-orange-100 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> 2,500
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Distance */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Distance (km)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full text-base font-semibold px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Active Duration */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Active Time (mins)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={durationMins}
                onChange={(e) => setDurationMins(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-base font-semibold px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
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
            className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-md shadow-orange-600/20 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Move'}
          </button>
        </div>
      </div>
    </div>
  );
}
