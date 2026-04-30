-- ============================================================
-- Charlies Star Road - 闯关进度表 (missions)
-- ============================================================
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 建表
CREATE TABLE IF NOT EXISTS missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_city VARCHAR(50) DEFAULT 'shanghai' NOT NULL,
  completed_cities TEXT[] DEFAULT '{}' NOT NULL,
  total_score INTEGER DEFAULT 0 NOT NULL,
  unlocked_photos INTEGER DEFAULT 0 NOT NULL,
  last_played_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. 初始化每个新用户的第一关记录（通过 RLS policy 触发）
-- Row Level Security
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- 3. RLS 策略
-- 用户只能查看自己的记录
CREATE POLICY "Users can view own missions"
  ON missions FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能更新自己的记录
CREATE POLICY "Users can update own missions"
  ON missions FOR UPDATE
  USING (auth.uid() = user_id);

-- 允许服务端/匿名插入（用于初始化新用户记录）
CREATE POLICY "Service role can insert missions"
  ON missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. 允许 API 路由（使用 service_role key）操作
-- 注意：API route 用 service_role key 绕过 RLS，额外校验 user_id

COMMENT ON TABLE missions IS '用户闯关进度表';
COMMENT ON COLUMN missions.user_id IS 'Supabase Auth 用户 ID';
COMMENT ON COLUMN missions.current_city IS '当前所在站点';
COMMENT ON COLUMN missions.completed_cities IS '已完成站点列表';
COMMENT ON COLUMN missions.unlocked_photos IS '已解锁照片数量（= 已完成站点数）';
