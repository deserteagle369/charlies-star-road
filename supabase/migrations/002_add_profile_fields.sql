-- 给 profiles 表添加头像和个人简介字段
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists bio text;

-- 添加注释
comment on column profiles.avatar_url is '用户头像 URL';
comment on column profiles.bio is '个人简介';
