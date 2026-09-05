'use client';

import { useState } from 'react';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/app-context';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email or username');
      return;
    }
    setError(null);
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 flex flex-col justify-center max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/20 mb-3">
          <Sparkles className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
          Friends Space
        </h1>
        <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
          A simple, private space to share your daily steps, reading, and screen time with friends.
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
          Welcome Back
        </h2>
        <p className="text-xs text-neutral-400 mb-5">Sign in to your private account</p>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="you@example.com or @alex_r"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5 mt-2"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <p className="text-xs text-neutral-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="mt-6 flex items-center justify-center gap-1.5 text-neutral-400 text-[11px]">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Your data is private & only shared with approved friends</span>
      </div>
    </div>
  );
}
