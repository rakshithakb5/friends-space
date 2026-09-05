'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, PrivacySettings, DailyHabit, Friendship, FriendFeedItem } from '@/types/database';

// Demo initial profiles for isolated offline demo mode
const INITIAL_DEMO_USERS: Profile[] = [
  {
    id: 'usr-1',
    username: 'alex_r',
    full_name: 'Alex Rivera',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Reading sci-fi & aiming for 10k steps daily.',
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'usr-2',
    username: 'sarah_m',
    full_name: 'Sarah Miller',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Product designer. Early bird walker.',
    created_at: '2026-01-12T10:00:00Z',
  },
  {
    id: 'usr-3',
    username: 'david_k',
    full_name: 'David Kim',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Avid reader & minimalist.',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'usr-4',
    username: 'elena_v',
    full_name: 'Elena Vance',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    bio: 'Screen time reduction journey.',
    created_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'usr-5',
    username: 'marcus_t',
    full_name: 'Marcus Taylor',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Coffee enthusiast & slow runner.',
    created_at: '2026-02-01T10:00:00Z',
  },
];

const INITIAL_DEMO_PRIVACY: Record<string, PrivacySettings> = {
  'usr-1': { user_id: 'usr-1', share_move: true, share_read: true, share_screen: true },
  'usr-2': { user_id: 'usr-2', share_move: true, share_read: true, share_screen: true },
  'usr-3': { user_id: 'usr-3', share_move: true, share_read: true, share_screen: false },
  'usr-4': { user_id: 'usr-4', share_move: false, share_read: true, share_screen: true },
  'usr-5': { user_id: 'usr-5', share_move: true, share_read: false, share_screen: true },
};

function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

interface AppContextType {
  currentUser: Profile | null;
  privacySettings: PrivacySettings | null;
  isLoading: boolean;
  isDemoMode: boolean;
  todayHabit: DailyHabit | null;
  yesterdayHabit: DailyHabit | null;
  login: (email: string, password?: string) => Promise<{ error: string | null }>;
  register: (name: string, username: string, email: string, password?: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
  updateHabit: (habitUpdate: Partial<DailyHabit>) => Promise<void>;
  getFriendFeed: () => FriendFeedItem[];
  searchProfiles: (query: string) => Promise<Profile[]>;
  getFriendships: () => {
    friends: (Profile & { friendshipId: string })[];
    incomingRequests: (Profile & { friendshipId: string })[];
    outgoingRequests: (Profile & { friendshipId: string })[];
  };
  sendFriendRequest: (addresseeId: string) => Promise<{ success: boolean; message?: string }>;
  acceptFriendRequest: (friendshipId: string) => Promise<void>;
  declineFriendRequest: (friendshipId: string) => Promise<void>;
  removeFriend: (friendshipId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Daily habit states for current user
  const [todayHabit, setTodayHabit] = useState<DailyHabit | null>(null);
  const [yesterdayHabit, setYesterdayHabit] = useState<DailyHabit | null>(null);

  // Friend feed state (computed via SQL RPC in live mode, or state in demo)
  const [friendFeed, setFriendFeed] = useState<FriendFeedItem[]>([]);

  // Friendships state
  const [friendsList, setFriendsList] = useState<(Profile & { friendshipId: string })[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<(Profile & { friendshipId: string })[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<(Profile & { friendshipId: string })[]>([]);

  // Demo mode isolated state
  const [demoProfiles, setDemoProfiles] = useState<Profile[]>(INITIAL_DEMO_USERS);
  const [demoPrivacy, setDemoPrivacy] = useState<Record<string, PrivacySettings>>(INITIAL_DEMO_PRIVACY);
  const [demoHabits, setDemoHabits] = useState<DailyHabit[]>([]);
  const [demoFriendships, setDemoFriendships] = useState<Friendship[]>([]);

  const todayStr = getTodayString();
  const yesterdayStr = getYesterdayString();

  // --------------------------------------------------------------------------
  // LIVE SUPABASE DATA REFRESH HELPERS
  // --------------------------------------------------------------------------
  const loadLiveUserData = useCallback(async (userId: string) => {
    const supabase = createClient();

    // 1. Fetch Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) setCurrentUser(profile);

    // 2. Fetch Privacy Settings
    const { data: privacy } = await supabase
      .from('privacy_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (privacy) setPrivacySettings(privacy);

    // 3. Fetch Today's Habit
    const { data: tHabit } = await supabase
      .from('daily_habits')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', todayStr)
      .maybeSingle();

    if (tHabit) {
      setTodayHabit(tHabit);
    } else {
      setTodayHabit({
        id: `h-temp-${todayStr}`,
        user_id: userId,
        log_date: todayStr,
        steps: 0,
        distance_km: 0,
        active_duration_minutes: 0,
        step_source: 'manual',
        book_title: null,
        book_author: null,
        book_cover_url: null,
        current_page: null,
        total_pages: null,
        reading_progress_percent: null,
        screen_time_minutes: 0,
        screen_source: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // 4. Fetch Yesterday's Habit
    const { data: yHabit } = await supabase
      .from('daily_habits')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', yesterdayStr)
      .maybeSingle();

    setYesterdayHabit(yHabit || null);

    // 5. Fetch Friends Feed via Secure Database RPC (Privacy enforced in PostgreSQL)
    const { data: feedData } = await supabase.rpc('get_friends_daily_feed', {
      query_date: todayStr,
    });

    if (feedData) {
      setFriendFeed(feedData as FriendFeedItem[]);
    }

    // 6. Fetch Friendships with joined profiles
    const { data: fships } = await supabase
      .from('friendships')
      .select(`
        id,
        requester_id,
        addressee_id,
        status,
        created_at,
        updated_at,
        requester:profiles!requester_id(*),
        addressee:profiles!addressee_id(*)
      `)
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (fships) {
      const activeFriends: (Profile & { friendshipId: string })[] = [];
      const incoming: (Profile & { friendshipId: string })[] = [];
      const outgoing: (Profile & { friendshipId: string })[] = [];

      interface FriendshipRow {
        id: string;
        requester_id: string;
        addressee_id: string;
        status: string;
        requester: Profile | null;
        addressee: Profile | null;
      }

      (fships as unknown as FriendshipRow[]).forEach((f) => {
        if (f.status === 'accepted') {
          const friendProfile = f.requester_id === userId ? f.addressee : f.requester;
          if (friendProfile) activeFriends.push({ ...friendProfile, friendshipId: f.id });
        } else if (f.status === 'pending') {
          if (f.addressee_id === userId && f.requester) {
            incoming.push({ ...f.requester, friendshipId: f.id });
          } else if (f.requester_id === userId && f.addressee) {
            outgoing.push({ ...f.addressee, friendshipId: f.id });
          }
        }
      });

      setFriendsList(activeFriends);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    }
  }, [todayStr, yesterdayStr]);

  // --------------------------------------------------------------------------
  // DEMO MODE INITIALIZATION (ISOLATED)
  // --------------------------------------------------------------------------
  const initDemoData = useCallback((user: Profile) => {
    const today = getTodayString();
    const yesterday = getYesterdayString();

    const sampleHabits: DailyHabit[] = [
      {
        id: 'h-1-today',
        user_id: user.id,
        log_date: today,
        steps: 6420,
        distance_km: 4.8,
        active_duration_minutes: 52,
        step_source: 'manual',
        book_title: 'Tomorrow, and Tomorrow, and Tomorrow',
        book_author: 'Gabrielle Zevin',
        book_cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=150&auto=format&fit=crop&q=80',
        current_page: 184,
        total_pages: 416,
        reading_progress_percent: 44,
        screen_time_minutes: 195,
        screen_source: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'h-1-yest',
        user_id: user.id,
        log_date: yesterday,
        steps: 8100,
        distance_km: 6.1,
        active_duration_minutes: 65,
        step_source: 'manual',
        book_title: 'Tomorrow, and Tomorrow, and Tomorrow',
        book_author: 'Gabrielle Zevin',
        book_cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=150&auto=format&fit=crop&q=80',
        current_page: 140,
        total_pages: 416,
        reading_progress_percent: 34,
        screen_time_minutes: 230,
        screen_source: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'h-2-today',
        user_id: 'usr-2',
        log_date: today,
        steps: 9240,
        distance_km: 7.2,
        active_duration_minutes: 74,
        step_source: 'manual',
        book_title: 'Klara and the Sun',
        book_author: 'Kazuo Ishiguro',
        book_cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=150&auto=format&fit=crop&q=80',
        current_page: 210,
        total_pages: 320,
        reading_progress_percent: 66,
        screen_time_minutes: 140,
        screen_source: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'h-3-today',
        user_id: 'usr-3',
        log_date: today,
        steps: 4500,
        distance_km: 3.4,
        active_duration_minutes: 38,
        step_source: 'manual',
        book_title: 'Atomic Habits',
        book_author: 'James Clear',
        book_cover_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=150&auto=format&fit=crop&q=80',
        current_page: 280,
        total_pages: 320,
        reading_progress_percent: 88,
        screen_time_minutes: 310,
        screen_source: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'h-4-today',
        user_id: 'usr-4',
        log_date: today,
        steps: 11200,
        distance_km: 8.5,
        active_duration_minutes: 90,
        step_source: 'manual',
        book_title: 'Deep Work',
        book_author: 'Cal Newport',
        book_cover_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=150&auto=format&fit=crop&q=80',
        current_page: 95,
        total_pages: 296,
        reading_progress_percent: 32,
        screen_time_minutes: 110,
        screen_source: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const sampleFriendships: Friendship[] = [
      {
        id: 'fr-1',
        requester_id: user.id,
        addressee_id: 'usr-2',
        status: 'accepted',
        created_at: '2026-01-25T12:00:00Z',
        updated_at: '2026-01-25T12:00:00Z',
      },
      {
        id: 'fr-2',
        requester_id: 'usr-3',
        addressee_id: user.id,
        status: 'accepted',
        created_at: '2026-01-26T12:00:00Z',
        updated_at: '2026-01-26T12:00:00Z',
      },
      {
        id: 'fr-3',
        requester_id: user.id,
        addressee_id: 'usr-4',
        status: 'accepted',
        created_at: '2026-02-01T12:00:00Z',
        updated_at: '2026-02-01T12:00:00Z',
      },
      {
        id: 'fr-4',
        requester_id: 'usr-5',
        addressee_id: user.id,
        status: 'pending',
        created_at: '2026-02-10T12:00:00Z',
        updated_at: '2026-02-10T12:00:00Z',
      },
    ];

    setDemoHabits(sampleHabits);
    setDemoFriendships(sampleFriendships);

    const userToday = sampleHabits.find((h) => h.user_id === user.id && h.log_date === today) || null;
    const userYest = sampleHabits.find((h) => h.user_id === user.id && h.log_date === yesterday) || null;
    setTodayHabit(userToday);
    setYesterdayHabit(userYest);
  }, []);

  // --------------------------------------------------------------------------
  // AUTH LIFECYCLE & INITIALIZATION
  // --------------------------------------------------------------------------
  useEffect(() => {
    let authSubscription: { unsubscribe: () => void } | null = null;

    async function init() {
      const hasSupabase =
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.NEXT_PUBLIC_USE_DEMO_STORE !== 'true';

      if (hasSupabase) {
        setIsDemoMode(false);
        const supabase = createClient();

        // 1. Initial Session Check
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          await loadLiveUserData(session.user.id);
        } else {
          setCurrentUser(null);
          setPrivacySettings(null);
          setTodayHabit(null);
          setYesterdayHabit(null);
          setFriendFeed([]);
          setFriendsList([]);
          setIncomingRequests([]);
          setOutgoingRequests([]);
        }

        // 2. Subscribe to Auth State Changes (Issue 5 Fix)
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            if (session?.user) {
              await loadLiveUserData(session.user.id);
            }
          } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
            setPrivacySettings(null);
            setTodayHabit(null);
            setYesterdayHabit(null);
            setFriendFeed([]);
            setFriendsList([]);
            setIncomingRequests([]);
            setOutgoingRequests([]);
          }
        });

        authSubscription = subscription;
      } else {
        // Run in local demo mode with isolated demo data (Issue 6 Fix)
        setIsDemoMode(true);
        const savedUser = typeof window !== 'undefined' ? localStorage.getItem('friends_space_user') : null;
        let activeUser: Profile;

        if (savedUser) {
          try {
            activeUser = JSON.parse(savedUser);
          } catch {
            activeUser = INITIAL_DEMO_USERS[0];
          }
        } else {
          activeUser = INITIAL_DEMO_USERS[0];
        }

        setCurrentUser(activeUser);
        setPrivacySettings(
          INITIAL_DEMO_PRIVACY[activeUser.id] || {
            user_id: activeUser.id,
            share_move: true,
            share_read: true,
            share_screen: true,
          }
        );
        initDemoData(activeUser);
      }

      setIsLoading(false);
    }

    init();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [loadLiveUserData, initDemoData]);

  // --------------------------------------------------------------------------
  // AUTH ACTIONS
  // --------------------------------------------------------------------------
  const login = async (email: string, password?: string) => {
    if (!isDemoMode) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || 'password123',
      });
      if (error) return { error: error.message };
      if (data.user) {
        await loadLiveUserData(data.user.id);
      }
      return { error: null };
    }

    // Demo Mode login
    const clean = email.toLowerCase().trim().replace(/^@/, '');
    const found = demoProfiles.find(
      (u) => u.username.toLowerCase() === clean || u.full_name.toLowerCase().includes(clean)
    ) || INITIAL_DEMO_USERS[0];

    setCurrentUser(found);
    if (typeof window !== 'undefined') {
      localStorage.setItem('friends_space_user', JSON.stringify(found));
    }
    setPrivacySettings(
      demoPrivacy[found.id] || {
        user_id: found.id,
        share_move: true,
        share_read: true,
        share_screen: true,
      }
    );
    initDemoData(found);
    return { error: null };
  };

  const register = async (name: string, username: string, email: string, password?: string) => {
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      return { error: 'Username must be 3-20 characters (lowercase letters, numbers, underscores).' };
    }

    if (!isDemoMode) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || 'password123',
        options: {
          data: {
            username: cleanUsername,
            full_name: name,
          },
        },
      });

      if (error) return { error: error.message };
      if (data.user) {
        await loadLiveUserData(data.user.id);
      }
      return { error: null };
    }

    // Demo Mode register
    const exists = demoProfiles.some((u) => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      return { error: `Username @${cleanUsername} is already taken. Please choose another.` };
    }

    const newUser: Profile = {
      id: `usr-${Date.now()}`,
      username: cleanUsername,
      full_name: name,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      bio: '',
      created_at: new Date().toISOString(),
    };

    const newPrivacy: PrivacySettings = {
      user_id: newUser.id,
      share_move: true,
      share_read: true,
      share_screen: true,
    };

    setDemoProfiles((prev) => [...prev, newUser]);
    setDemoPrivacy((prev) => ({ ...prev, [newUser.id]: newPrivacy }));
    setCurrentUser(newUser);
    setPrivacySettings(newPrivacy);
    if (typeof window !== 'undefined') {
      localStorage.setItem('friends_space_user', JSON.stringify(newUser));
    }
    initDemoData(newUser);
    return { error: null };
  };

  const logout = async () => {
    if (!isDemoMode) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setPrivacySettings(null);
    setTodayHabit(null);
    setYesterdayHabit(null);
    setFriendFeed([]);
    setFriendsList([]);
    setIncomingRequests([]);
    setOutgoingRequests([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('friends_space_user');
    }
  };

  // --------------------------------------------------------------------------
  // PRIVACY SETTINGS UPDATE
  // --------------------------------------------------------------------------
  const updatePrivacySettings = async (settings: Partial<PrivacySettings>) => {
    if (!currentUser || !privacySettings) return;
    const updated: PrivacySettings = { ...privacySettings, ...settings, updated_at: new Date().toISOString() };
    setPrivacySettings(updated);

    if (!isDemoMode) {
      const supabase = createClient();
      await supabase.from('privacy_settings').upsert(updated);
      // Refresh feed for friends reflection
      const { data: feedData } = await supabase.rpc('get_friends_daily_feed', {
        query_date: todayStr,
      });
      if (feedData) setFriendFeed(feedData as FriendFeedItem[]);
    } else {
      setDemoPrivacy((prev) => ({ ...prev, [currentUser.id]: updated }));
    }
  };

  // --------------------------------------------------------------------------
  // PROFILE UPDATE
  // --------------------------------------------------------------------------
  const updateProfile = async (profileUpdate: Partial<Profile>) => {
    if (!currentUser) return;
    const updated: Profile = { ...currentUser, ...profileUpdate, updated_at: new Date().toISOString() };
    setCurrentUser(updated);

    if (!isDemoMode) {
      const supabase = createClient();
      await supabase.from('profiles').update(profileUpdate).eq('id', currentUser.id);
    } else {
      setDemoProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (typeof window !== 'undefined') {
        localStorage.setItem('friends_space_user', JSON.stringify(updated));
      }
    }
  };

  // --------------------------------------------------------------------------
  // HABIT UPDATE (WITH BOUNDS ENFORCEMENT - ISSUE 7)
  // --------------------------------------------------------------------------
  const updateHabit = async (habitUpdate: Partial<DailyHabit>) => {
    if (!currentUser) return;

    // Strict bounds clamping
    const sanitizedUpdate: Partial<DailyHabit> = { ...habitUpdate };
    if (sanitizedUpdate.steps !== undefined) {
      sanitizedUpdate.steps = Math.max(0, Math.min(200000, Number(sanitizedUpdate.steps) || 0));
    }
    if (sanitizedUpdate.distance_km !== undefined) {
      sanitizedUpdate.distance_km = Math.max(0, Math.min(500, Number(sanitizedUpdate.distance_km) || 0));
    }
    if (sanitizedUpdate.active_duration_minutes !== undefined) {
      sanitizedUpdate.active_duration_minutes = Math.max(0, Math.min(1440, Number(sanitizedUpdate.active_duration_minutes) || 0));
    }
    if (sanitizedUpdate.screen_time_minutes !== undefined) {
      sanitizedUpdate.screen_time_minutes = Math.max(0, Math.min(1440, Number(sanitizedUpdate.screen_time_minutes) || 0));
    }
    if (sanitizedUpdate.reading_progress_percent !== undefined && sanitizedUpdate.reading_progress_percent !== null) {
      sanitizedUpdate.reading_progress_percent = Math.max(0, Math.min(100, Number(sanitizedUpdate.reading_progress_percent) || 0));
    }

    const updatedToday = {
      ...(todayHabit || {
        id: `h-${Date.now()}`,
        user_id: currentUser.id,
        log_date: todayStr,
        steps: 0,
        distance_km: 0,
        active_duration_minutes: 0,
        step_source: 'manual' as const,
        book_title: null,
        book_author: null,
        book_cover_url: null,
        current_page: null,
        total_pages: null,
        reading_progress_percent: null,
        screen_time_minutes: 0,
        screen_source: 'manual' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
      ...sanitizedUpdate,
      updated_at: new Date().toISOString(),
    };

    setTodayHabit(updatedToday);

    if (!isDemoMode) {
      const supabase = createClient();
      await supabase.from('daily_habits').upsert(
        {
          user_id: currentUser.id,
          log_date: todayStr,
          ...sanitizedUpdate,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,log_date' }
      );
    } else {
      setDemoHabits((prev) => {
        const idx = prev.findIndex((h) => h.user_id === currentUser.id && h.log_date === todayStr);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updatedToday;
          return next;
        }
        return [...prev, updatedToday];
      });
    }
  };

  // --------------------------------------------------------------------------
  // FRIENDS FEED (ISSUE 1, 2, 6 FIX)
  // In live mode, friend feed is retrieved exclusively via get_friends_daily_feed RPC.
  // In demo mode, computed from demo state respecting demo privacy flags.
  // --------------------------------------------------------------------------
  const getFriendFeed = useCallback((): FriendFeedItem[] => {
    if (!currentUser) return [];

    if (!isDemoMode) {
      // Live Supabase feed is already sanitized by PostgreSQL get_friends_daily_feed RPC!
      return friendFeed;
    }

    // Demo Mode feed computation
    const acceptedFriendships = demoFriendships.filter(
      (f) =>
        f.status === 'accepted' &&
        (f.requester_id === currentUser.id || f.addressee_id === currentUser.id)
    );

    const friendIds = acceptedFriendships.map((f) =>
      f.requester_id === currentUser.id ? f.addressee_id : f.requester_id
    );

    return friendIds.map((fId) => {
      const profile = demoProfiles.find((p) => p.id === fId) || {
        id: fId,
        username: 'friend',
        full_name: 'Friend',
        avatar_url: null,
        bio: null,
        created_at: '',
      };

      const privacy = demoPrivacy[fId] || {
        user_id: fId,
        share_move: true,
        share_read: true,
        share_screen: true,
      };

      const habit = demoHabits.find((h) => h.user_id === fId && h.log_date === todayStr);

      return {
        friend_id: fId,
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,

        share_move: privacy.share_move,
        steps: privacy.share_move && habit ? habit.steps : null,
        distance_km: privacy.share_move && habit ? habit.distance_km : null,
        active_duration_minutes: privacy.share_move && habit ? habit.active_duration_minutes : null,

        share_read: privacy.share_read,
        book_title: privacy.share_read && habit ? habit.book_title : null,
        book_author: privacy.share_read && habit ? habit.book_author : null,
        book_cover_url: privacy.share_read && habit ? habit.book_cover_url : null,
        reading_progress_percent: privacy.share_read && habit ? habit.reading_progress_percent : null,
        current_page: privacy.share_read && habit ? habit.current_page : null,
        total_pages: privacy.share_read && habit ? habit.total_pages : null,

        share_screen: privacy.share_screen,
        screen_time_minutes: privacy.share_screen && habit ? habit.screen_time_minutes : null,
      };
    });
  }, [currentUser, isDemoMode, friendFeed, demoFriendships, demoProfiles, demoPrivacy, demoHabits, todayStr]);

  // --------------------------------------------------------------------------
  // SEARCH PROFILES (ISSUE 1 & 6 FIX - REAL SUPABASE SEARCH)
  // --------------------------------------------------------------------------
  const searchProfiles = useCallback(
    async (query: string): Promise<Profile[]> => {
      if (!query.trim() || !currentUser) return [];
      const clean = query.toLowerCase().trim().replace(/^@/, '');

      if (!isDemoMode) {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', currentUser.id)
          .or(`username.ilike.%${clean}%,full_name.ilike.%${clean}%`)
          .limit(25);

        if (error || !data) return [];
        return data as Profile[];
      }

      // Demo search against isolated demo profiles
      return demoProfiles.filter(
        (p) =>
          p.id !== currentUser.id &&
          (p.username.toLowerCase().includes(clean) || p.full_name.toLowerCase().includes(clean))
      );
    },
    [currentUser, isDemoMode, demoProfiles]
  );

  // --------------------------------------------------------------------------
  // FRIENDSHIPS (GET)
  // --------------------------------------------------------------------------
  const getFriendships = useCallback(() => {
    if (!currentUser) return { friends: [], incomingRequests: [], outgoingRequests: [] };

    if (!isDemoMode) {
      return {
        friends: friendsList,
        incomingRequests,
        outgoingRequests,
      };
    }

    // Demo Mode computation
    const friends: (Profile & { friendshipId: string })[] = [];
    const incoming: (Profile & { friendshipId: string })[] = [];
    const outgoing: (Profile & { friendshipId: string })[] = [];

    demoFriendships.forEach((f) => {
      if (f.status === 'accepted') {
        const friendId = f.requester_id === currentUser.id ? f.addressee_id : f.requester_id;
        const profile = demoProfiles.find((p) => p.id === friendId);
        if (profile) friends.push({ ...profile, friendshipId: f.id });
      } else if (f.status === 'pending') {
        if (f.addressee_id === currentUser.id) {
          const requester = demoProfiles.find((p) => p.id === f.requester_id);
          if (requester) incoming.push({ ...requester, friendshipId: f.id });
        } else if (f.requester_id === currentUser.id) {
          const addressee = demoProfiles.find((p) => p.id === f.addressee_id);
          if (addressee) outgoing.push({ ...addressee, friendshipId: f.id });
        }
      }
    });

    return { friends, incomingRequests: incoming, outgoingRequests: outgoing };
  }, [currentUser, isDemoMode, friendsList, incomingRequests, outgoingRequests, demoFriendships, demoProfiles]);

  // --------------------------------------------------------------------------
  // FRIEND REQUEST ACTIONS (WITH BIDIRECTIONAL PREVENTION - ISSUE 4 & 7)
  // --------------------------------------------------------------------------
  const sendFriendRequest = async (addresseeId: string) => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    if (currentUser.id === addresseeId) return { success: false, message: 'Cannot add yourself' };

    if (!isDemoMode) {
      const supabase = createClient();

      // Check for bidirectional relationship existence
      const { data: existing } = await supabase
        .from('friendships')
        .select('*')
        .or(
          `and(requester_id.eq.${currentUser.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${currentUser.id})`
        )
        .maybeSingle();

      if (existing) {
        if (existing.status === 'accepted') return { success: false, message: 'Already friends' };
        if (existing.status === 'pending') return { success: false, message: 'Friend request already pending' };
      }

      // Strictly insert with status: 'pending' (RLS will reject any other status)
      const { error } = await supabase.from('friendships').insert({
        requester_id: currentUser.id,
        addressee_id: addresseeId,
        status: 'pending',
      });

      if (error) {
        return { success: false, message: error.message };
      }

      await loadLiveUserData(currentUser.id);
      return { success: true };
    }

    // Demo Mode bidirectional check
    const existing = demoFriendships.find(
      (f) =>
        (f.requester_id === currentUser.id && f.addressee_id === addresseeId) ||
        (f.requester_id === addresseeId && f.addressee_id === currentUser.id)
    );

    if (existing) {
      if (existing.status === 'accepted') return { success: false, message: 'Already friends' };
      if (existing.status === 'pending') return { success: false, message: 'Request already pending' };
    }

    const newFriendship: Friendship = {
      id: `fr-${Date.now()}`,
      requester_id: currentUser.id,
      addressee_id: addresseeId,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setDemoFriendships((prev) => [...prev, newFriendship]);
    return { success: true };
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    if (!currentUser) return;

    if (!isDemoMode) {
      const supabase = createClient();
      await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
      await loadLiveUserData(currentUser.id);
    } else {
      setDemoFriendships((prev) =>
        prev.map((f) => (f.id === friendshipId ? { ...f, status: 'accepted', updated_at: new Date().toISOString() } : f))
      );
    }
  };

  const declineFriendRequest = async (friendshipId: string) => {
    if (!currentUser) return;

    if (!isDemoMode) {
      const supabase = createClient();
      await supabase.from('friendships').delete().eq('id', friendshipId);
      await loadLiveUserData(currentUser.id);
    } else {
      setDemoFriendships((prev) => prev.filter((f) => f.id !== friendshipId));
    }
  };

  const removeFriend = async (friendshipId: string) => {
    if (!currentUser) return;

    if (!isDemoMode) {
      const supabase = createClient();
      await supabase.from('friendships').delete().eq('id', friendshipId);
      await loadLiveUserData(currentUser.id);
    } else {
      setDemoFriendships((prev) => prev.filter((f) => f.id !== friendshipId));
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        privacySettings,
        isLoading,
        isDemoMode,
        todayHabit,
        yesterdayHabit,
        login,
        register,
        logout,
        updatePrivacySettings,
        updateProfile,
        updateHabit,
        getFriendFeed,
        searchProfiles,
        getFriendships,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        removeFriend,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
