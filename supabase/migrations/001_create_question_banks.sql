-- 单独创建 question_banks 表（如果之前的SQL没有跑完）
-- 在 Supabase SQL Editor 中执行

-- 先检查表是否存在，如果不存在则创建
create table if not exists question_banks (
  id uuid default gen_random_uuid() primary key,
  module_num int not null,
  unit_num int not null,
  unit_name text not null,
  knowledge_point text,
  question text not null,
  answer text not null,
  hint text,
  explanation text,
  difficulty text default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  is_active boolean default true,
  reviewed_by uuid,
  reviewed_at timestamptz,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 添加索引
create index if not exists question_banks_module_idx on question_banks(module_num, unit_num);
create index if not exists question_banks_status_idx on question_banks(status);
create index if not exists question_banks_active_idx on question_banks(is_active);

-- 给 profiles 表添加 role 字段（如果还没有）
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'profiles' and column_name = 'role'
  ) then
    alter table profiles add column role text default 'student' check (role in ('student', 'admin'));
  end if;
end $$;