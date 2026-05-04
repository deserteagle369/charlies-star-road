-- Charlie's Star Road - Database Schema
-- Run this in Supabase SQL Editor

-- profiles: 用户资料表（含管理员角色）
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  username text unique not null,
  role text default 'student' check (role in ('student', 'admin')),
  level int default 1,
  total_stars int default 0,
  created_at timestamptz default now()
);

-- question_banks: 题库表（按单元/知识点组织）
create table question_banks (
  id uuid default gen_random_uuid() primary key,
  module_num int not null,           -- 模块号 (1-4)
  unit_num int not null,             -- 单元号 (1-3)
  unit_name text not null,           -- 单元名称，如 "What can you smell and taste?"
  knowledge_point text,              -- 知识点描述
  question text not null,            -- 题目文本（填空题）
  answer text not null,              -- 正确答案
  hint text,                         -- 提示
  explanation text,                  -- 解析
  difficulty text default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  is_active boolean default true,    -- 是否启用
  reviewed_by uuid references profiles(id),  -- 审核人
  reviewed_at timestamptz,           -- 审核时间
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
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
create index question_banks_module_idx on question_banks(module_num, unit_num);
create index question_banks_status_idx on question_banks(status);
create index question_banks_active_idx on question_banks(is_active);

-- RLS policies (enable when ready for production)
-- alter table profiles enable row level security;
-- alter table missions enable row level security;
-- alter table daily_cards enable row level security;
-- alter table question_banks enable row level security;

-- 初始化管理员账号（deserteagle369@163.com）
-- 注意：此SQL需在用户注册后手动执行，或通过auth trigger自动设置
-- update profiles set role = 'admin' where email = 'deserteagle369@163.com';