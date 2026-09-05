'use client';

import { useState } from 'react';
import { BookOpen, X, Check, Image as ImageIcon } from 'lucide-react';
import { useApp } from '@/context/app-context';

const SAMPLE_COVERS = [
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=150&auto=format&fit=crop&q=80',
];

export function ReadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { todayHabit, updateHabit } = useApp();

  const [title, setTitle] = useState(todayHabit?.book_title || '');
  const [author, setAuthor] = useState(todayHabit?.book_author || '');
  const [currentPage, setCurrentPage] = useState<number | ''>(todayHabit?.current_page ?? '');
  const [totalPages, setTotalPages] = useState<number | ''>(todayHabit?.total_pages ?? '');
  const [coverUrl, setCoverUrl] = useState(todayHabit?.book_cover_url || SAMPLE_COVERS[0]);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const currentNum = typeof currentPage === 'number' ? currentPage : 0;
  const totalNum = typeof totalPages === 'number' && totalPages > 0 ? totalPages : 100;
  const calculatedPercent = Math.min(100, Math.round((currentNum / totalNum) * 100));

  const handleSave = async () => {
    setIsSaving(true);
    await updateHabit({
      book_title: title.trim() || null,
      book_author: author.trim() || null,
      book_cover_url: coverUrl || null,
      current_page: typeof currentPage === 'number' ? currentPage : null,
      total_pages: typeof totalPages === 'number' ? totalPages : null,
      reading_progress_percent: calculatedPercent,
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">Update Reading</h3>
              <p className="text-xs text-neutral-500">Share your current book & progress</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 py-3">
          {/* Book Title */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Book Title
            </label>
            <input
              type="text"
              placeholder="e.g. Atomic Habits"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm font-medium px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Book Author */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Author
            </label>
            <input
              type="text"
              placeholder="e.g. James Clear"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full text-sm font-medium px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Pages and Progress */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Current Page
              </label>
              <input
                type="number"
                min="0"
                placeholder="140"
                value={currentPage}
                onChange={(e) => setCurrentPage(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                className="w-full text-sm font-semibold px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Total Pages
              </label>
              <input
                type="number"
                min="1"
                placeholder="320"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                className="w-full text-sm font-semibold px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Computed Progress preview */}
          {totalPages && (
            <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
              <span className="text-xs text-indigo-900 dark:text-indigo-300 font-medium">Progress</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {calculatedPercent}%
              </span>
            </div>
          )}

          {/* Cover selector */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
              Cover Image Preset or URL
            </label>
            <div className="flex items-center gap-2 mb-2">
              {SAMPLE_COVERS.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCoverUrl(img)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    coverUrl === img ? 'border-indigo-600 scale-105 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="cover preview" className="w-10 h-12 object-cover" />
                </button>
              ))}
            </div>
            <input
              type="url"
              placeholder="Or paste an image URL..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full text-xs px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
            />
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
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Book'}
          </button>
        </div>
      </div>
    </div>
  );
}
