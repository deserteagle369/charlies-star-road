/**
 * 管理员登录页 — Charlie's Star Road
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // 检查是否为管理员（白名单）
      const adminEmails = [
        process.env.NEXT_PUBLIC_ADMIN_EMAIL || '',
        'admin@charlies-star-road.com',
      ].filter(Boolean);

      if (!adminEmails.includes(email)) {
        await supabase.auth.signOut();
        throw new Error('您没有管理员权限');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-indigo-950 to-purple-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🛡️</div>
          <h1 className="text-2xl font-bold text-white">管理员后台</h1>
          <p className="text-indigo-300/60 text-sm mt-1">Charlie&apos;s Star Road</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1.5">
                管理员邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1.5">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl text-sm bg-red-500/20 text-red-300 border border-red-500/30">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 transition-all"
            >
              {loading ? '验证中...' : '进入后台'}
            </button>
          </form>
        </div>

        <div className="text-center mt-4">
          <a href="/" className="text-indigo-300/50 hover:text-indigo-300 text-sm">
            ← 返回游戏
          </a>
        </div>
      </div>
    </div>
  );
}