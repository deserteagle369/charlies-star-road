-- Charlie's Star Road - Database Schema
-- Run this in Supabase SQL Editor

-- profiles: 用户资料表
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  level int default 1,
  total_stars int default 0,
  created_at timestamptz default now()
);

-- missions: 关卡任务表
create table missions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  unit_name text not null,
  is_completed boolean default false,
  reward_image_url text,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- daily_cards: 每日星光卡
create table daily_cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  card_day int not null,
  message text not null,
  image_url text,
  created_at timestamptz default now(),
  unique(user_id, card_day)
);

-- indexes
create index missions_user_id_idx on missions(user_id);
create index missions_unit_name_idx on missions(unit_name);
create index daily_cards_user_id_idx on daily_cards(user_id);

-- RLS policies (enable when ready for production)
-- alter table profiles enable row level security;
-- alter table missions enable row level security;
-- alter table daily_cards enable row level security;

-- create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
-- create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
-- create policy "Users can read own missions" on missions for select using (auth.uid() = user_id);
-- create policy "Users can insert own missions" on missions for insert with check (auth.uid() = user_id);
-- create policy "Users can update own missions" on missions for update using (auth.uid() = user_id);
