'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password,
        });
        if (signUpError) throw signUpError;
        if (data.user) {
          // Extract username from email (before @)
          const username = email.split('@')[0];
          await supabase.from('profiles').insert({ id: data.user.id, username });
        }
        setError('注册成功！请查收邮箱验证链接，然后登录');
        setIsSignUp(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password,
        });
        if (signInError) throw signInError;
        router.push('/game');
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '未知错误';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Charlie&apos;s Star Road
          </h1>
          <p className="text-purple-200/70 mt-2 text-sm">跟周深一起环游世界学英语</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1.5">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="你的邮箱地址"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1.5">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="至少6位密码"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all"
              />
            </div>
            {error && (
              <div className={'p-3 rounded-xl text-sm ' + (isSignUp ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300')}>{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-indigo-950 hover:from-yellow-300 hover:to-orange-400 disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? '处理中...' : isSignUp ? '注册账号' : '开始旅程'}
            </button>
          </form>
          <p className="text-center mt-6 text-sm text-purple-200/60">
            {isSignUp ? '已有账号？' : '还没有账号？'}
            {' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-yellow-400 hover:text-yellow-300 font-medium underline underline-offset-2"
            >
              {isSignUp ? '去登录' : '立即注册'}
            </button>
          </p>
        </div>
        <p className="text-center mt-6 text-xs text-purple-200/30">Powered by Supabase Auth</p>
      </div>
    </div>
  );
}
