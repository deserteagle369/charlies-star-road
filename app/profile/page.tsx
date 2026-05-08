'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Profile {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  level: number;
  total_stars: number;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 表单状态
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('加载失败');

      const data = await res.json();
      setProfile(data.profile);
      setUsername(data.profile.username || '');
      setAvatarUrl(data.profile.avatar_url || '');
      setBio(data.profile.bio || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          avatar_url: avatarUrl.trim(),
          bio: bio.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '保存失败');
      }

      setProfile(data.profile);
      setSuccess('✅ 资料已更新！');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-950">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-purple-200">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-950 p-4">
      <div className="max-w-lg mx-auto">
        {/* 返回 */}
        <Link
          href="/game"
          className="inline-flex items-center gap-1 text-blue-300 hover:text-white text-sm mb-6"
        >
          ← 返回游戏
        </Link>

        {/* 标题 */}
        <h1 className="text-2xl font-bold text-white mb-6">👤 个人资料</h1>

        {/* 错误/成功提示 */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/20 text-green-300 text-sm animate-pulse">
            {success}
          </div>
        )}

        {/* 头像预览区 */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 mb-4">
          <div className="flex flex-col items-center gap-4 mb-6">
            {/* 头像 */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-pink-500 flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="头像" className="w-full h-full object-cover" />
                ) : (
                  profile?.username?.[0]?.toUpperCase() || '?'
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-7 h-7 bg-green-500 rounded-full border-2 border-indigo-900 flex items-center justify-center text-xs">
                ✅
              </span>
            </div>
            <div className="text-center">
              <p className="text-white font-medium">{profile?.username}</p>
              <p className="text-purple-200/60 text-xs">{profile?.email}</p>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-yellow-400">{profile?.level || 1}</p>
              <p className="text-xs text-purple-200/60">等级</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-pink-400">⭐ {profile?.total_stars || 0}</p>
              <p className="text-xs text-purple-200/60">星星</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-cyan-400">
                {profile?.role === 'admin' ? '👑' : '🎓'}
              </p>
              <p className="text-xs text-purple-200/60">
                {profile?.role === 'admin' ? '管理员' : '学员'}
              </p>
            </div>
          </div>

          {/* 编辑表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 昵称 */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1.5">
                昵称
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="你的昵称"
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all"
              />
            </div>

            {/* 头像 URL */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1.5">
                头像链接（可选）
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all"
              />
              <p className="text-xs text-purple-200/40 mt-1">支持任意图片 URL</p>
            </div>

            {/* 个人简介 */}
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1.5">
                个人简介（可选）
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="介绍一下自己..."
                maxLength={100}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all resize-none"
              />
              <p className="text-xs text-purple-200/40 mt-1 text-right">
                {bio.length}/100
              </p>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={saving || !username.trim()}
              className="w-full py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-indigo-950 hover:from-yellow-300 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {saving ? '保存中...' : '💾 保存资料'}
            </button>
          </form>
        </div>

        {/* 退出登录 */}
        <button
          onClick={async () => {
            const supabase = (await import('@/utils/supabase/client')).createClient();
            await supabase.auth.signOut();
            router.push('/login');
            router.refresh();
          }}
          className="w-full mt-4 py-3 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500/20 text-sm border border-red-500/20 transition-colors"
        >
          🚪 退出登录
        </button>
      </div>
    </div>
  );
}
