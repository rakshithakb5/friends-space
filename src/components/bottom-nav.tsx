'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, UserPlus, Users, User } from 'lucide-react';
import { useApp } from '@/context/app-context';

export function BottomNav() {
  const pathname = usePathname();
  const { getFriendships } = useApp();
  const { incomingRequests } = getFriendships();

  const navItems = [
    {
      label: 'My Day',
      href: '/',
      icon: Flame,
    },
    {
      label: 'Friends',
      href: '/friends',
      icon: Users,
    },
    {
      label: 'Discover',
      href: '/discover',
      icon: UserPlus,
      badge: incomingRequests.length > 0 ? incomingRequests.length : undefined,
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-t border-neutral-200/80 dark:border-neutral-800">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-16 py-1 transition-all duration-150 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
