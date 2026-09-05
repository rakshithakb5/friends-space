-- ==============================================================================
-- FRIENDS SPACE: COMPLETE POSTGRESQL DATABASE SCHEMA & RLS POLICIES
-- Production-Hardened Version
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with public profile information
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text unique not null,
    full_name text not null,
    avatar_url text,
    bio text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint username_format check (username ~ '^[a-z0-9_]{3,20}$')
);

-- Index for fast username search
create index if not exists idx_profiles_username on public.profiles (username text_pattern_ops);

-- 2. PRIVACY SETTINGS TABLE
-- Controls which pillars are shared with accepted friends
create table if not exists public.privacy_settings (
    user_id uuid primary key references public.profiles(id) on delete cascade,
    share_move boolean not null default true,
    share_read boolean not null default true,
    share_screen boolean not null default true,
    updated_at timestamptz not null default now()
);

-- 3. DAILY HABITS TABLE
-- Move, Read, Screen logs per user per day.
-- Strictly bounded to valid ranges to prevent spoofed/corrupted entries.
create table if not exists public.daily_habits (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    log_date date not null default current_date,
    
    -- Move Metrics (bounded to realistic human daily maximums)
    steps integer not null default 0 check (steps >= 0 and steps <= 200000),
    distance_km numeric(5,2) not null default 0.00 check (distance_km >= 0.00 and distance_km <= 500.00),
    active_duration_minutes integer not null default 0 check (active_duration_minutes >= 0 and active_duration_minutes <= 1440),
    step_source text not null default 'manual', -- 'manual', 'apple_health', 'health_connect', 'google_fit'
    
    -- Read Metrics
    book_title text,
    book_author text,
    book_cover_url text,
    current_page integer check (current_page >= 0 and current_page <= 50000),
    total_pages integer check (total_pages is null or (total_pages >= 1 and total_pages <= 50000)),
    reading_progress_percent integer check (reading_progress_percent between 0 and 100),
    
    -- Screen Time Metrics (bounded strictly to 24 hours = 1440 minutes max)
    screen_time_minutes integer not null default 0 check (screen_time_minutes >= 0 and screen_time_minutes <= 1440),
    screen_source text not null default 'manual',
    
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    
    constraint unique_user_log_date unique (user_id, log_date)
);

-- Indices for daily habit lookups
create index if not exists idx_daily_habits_user_date on public.daily_habits (user_id, log_date);

-- 4. FRIENDSHIPS TABLE
-- Bi-directional friendship relation with state machine
create table if not exists public.friendships (
    id uuid primary key default gen_random_uuid(),
    requester_id uuid not null references public.profiles(id) on delete cascade,
    addressee_id uuid not null references public.profiles(id) on delete cascade,
    status text not null check (status in ('pending', 'accepted', 'declined')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint no_self_friendship check (requester_id != addressee_id)
);

-- Bidirectional unique index prevents both (A, B) and (B, A) from existing simultaneously
create unique index if not exists unique_bidirectional_friendship
    on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

create index if not exists idx_friendships_requester on public.friendships (requester_id, status);
create index if not exists idx_friendships_addressee on public.friendships (addressee_id, status);

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.privacy_settings enable row level security;
alter table public.daily_habits enable row level security;
alter table public.friendships enable row level security;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
create policy "Authenticated users can search/view profiles"
    on public.profiles for select
    to authenticated
    using (true);

create policy "Users can update their own profile"
    on public.profiles for update
    to authenticated
    using (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- PRIVACY SETTINGS POLICIES
-- ------------------------------------------------------------------------------
create policy "Users can read own privacy settings"
    on public.privacy_settings for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can update own privacy settings"
    on public.privacy_settings for update
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert own privacy settings"
    on public.privacy_settings for insert
    to authenticated
    with check (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- DAILY HABITS POLICIES
-- CRITICAL PRIVACY FIX: Only the owner can ever query or modify daily_habits directly.
-- Other users (friends or strangers) cannot query daily_habits via client SDK.
-- ------------------------------------------------------------------------------
create policy "Users have full access only to their own daily habits"
    on public.daily_habits for all
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- FRIENDSHIPS POLICIES
-- Strict state-transition enforcement:
-- 1. Requester can only insert with status = 'pending' (cannot auto-accept)
-- 2. Only addressee can accept or decline
-- ------------------------------------------------------------------------------
create policy "Users can view friendships they are involved in"
    on public.friendships for select
    to authenticated
    using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "Users can send friend requests"
    on public.friendships for insert
    to authenticated
    with check (
        auth.uid() = requester_id 
        and status = 'pending'
    );

create policy "Addressees can respond to friend requests"
    on public.friendships for update
    to authenticated
    using (auth.uid() = addressee_id)
    with check (
        auth.uid() = addressee_id 
        and status in ('accepted', 'declined')
    );

create policy "Either party can delete a friendship or cancel a request"
    on public.friendships for delete
    to authenticated
    using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- ==============================================================================
-- AUTOMATED USER CREATION TRIGGER
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
    raw_username text;
    clean_username text;
    user_fullname text;
begin
    raw_username := new.raw_user_meta_data->>'username';
    user_fullname := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
    
    if raw_username is null or raw_username = '' then
        clean_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '', 'g'));
        if length(clean_username) < 3 then
            clean_username := 'user_' || substr(new.id::text, 1, 8);
        end if;
    else
        clean_username := lower(raw_username);
    end if;

    -- Insert Profile
    insert into public.profiles (id, username, full_name, avatar_url)
    values (
        new.id,
        clean_username,
        user_fullname,
        new.raw_user_meta_data->>'avatar_url'
    )
    on conflict (id) do update set
        username = excluded.username,
        full_name = excluded.full_name;

    -- Insert Default Privacy Settings (all enabled)
    insert into public.privacy_settings (user_id, share_move, share_read, share_screen)
    values (new.id, true, true, true)
    on conflict (user_id) do nothing;

    return new;
end;
$$;

-- Drop trigger if already exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ==============================================================================
-- SECURE FUNCTION: GET SANITIZED FRIENDS DAILY FEED
-- Security Definer: Executes with elevated privileges to join habits & privacy,
-- but strictly filters data based on auth.uid() and friend's privacy flags.
-- Any metric disabled by friend returns NULL at the SQL engine level.
-- ==============================================================================
create or replace function public.get_friends_daily_feed(query_date date default current_date)
returns table (
    friend_id uuid,
    username text,
    full_name text,
    avatar_url text,
    share_move boolean,
    steps integer,
    distance_km numeric,
    active_duration_minutes integer,
    share_read boolean,
    book_title text,
    book_author text,
    book_cover_url text,
    reading_progress_percent integer,
    current_page integer,
    total_pages integer,
    share_screen boolean,
    screen_time_minutes integer
)
language plpgsql
security definer set search_path = public
as $$
declare
    current_user_id uuid := auth.uid();
begin
    if current_user_id is null then
        return;
    end if;

    return query
    select
        p.id as friend_id,
        p.username,
        p.full_name,
        p.avatar_url,
        coalesce(ps.share_move, true) as share_move,
        case when coalesce(ps.share_move, true) then dh.steps else null end as steps,
        case when coalesce(ps.share_move, true) then dh.distance_km else null end as distance_km,
        case when coalesce(ps.share_move, true) then dh.active_duration_minutes else null end as active_duration_minutes,
        
        coalesce(ps.share_read, true) as share_read,
        case when coalesce(ps.share_read, true) then dh.book_title else null end as book_title,
        case when coalesce(ps.share_read, true) then dh.book_author else null end as book_author,
        case when coalesce(ps.share_read, true) then dh.book_cover_url else null end as book_cover_url,
        case when coalesce(ps.share_read, true) then dh.reading_progress_percent else null end as reading_progress_percent,
        case when coalesce(ps.share_read, true) then dh.current_page else null end as current_page,
        case when coalesce(ps.share_read, true) then dh.total_pages else null end as total_pages,
        
        coalesce(ps.share_screen, true) as share_screen,
        case when coalesce(ps.share_screen, true) then dh.screen_time_minutes else null end as screen_time_minutes
    from public.friendships f
    join public.profiles p on (
        (f.requester_id = current_user_id and p.id = f.addressee_id) or
        (f.addressee_id = current_user_id and p.id = f.requester_id)
    )
    left join public.privacy_settings ps on ps.user_id = p.id
    left join public.daily_habits dh on dh.user_id = p.id and dh.log_date = query_date
    where f.status = 'accepted';
end;
$$;

-- Grant execution permission to authenticated users
grant execute on function public.get_friends_daily_feed(date) to authenticated;
