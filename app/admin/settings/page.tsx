/**
 * API 配置页面 - /admin/settings
 * 管理所有外部 API 密钥和连接配置
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ConfigState {
  supabase_url: string;
  supabase_publishable_key: string;
  supabase_secret_key: string;
  groq_api_key: string;
}

interface TestResult {
  key: string;
  label: string;
  status: 'idle' | 'testing' | 'ok' | 'fail';
  message: string;
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<ConfigState>({
    supabase_url: '',
    supabase_publishable_key: '',
    supabase_secret_key: '',
    groq_api_key: '',
  });
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 加载当前配置
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(prev => ({ ...prev, ...data }));
      }
    } catch { /* 首次可能还没配置 */ }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showMessage('success', '✅ 配置已保存！环境变量已更新，请重启 dev server 生效');
    } catch (err) {
      showMessage('error', '保存失败：' + (err instanceof Error ? err.message : '未知错误'));
    }
    setSaving(false);
  };

  const testConnection = async (key: string) => {
    const labelMap: Record<string, string> = {
      supabase: 'Supabase 数据库',
      groq: 'Groq AI',
    };

    setTestResults(prev => [...prev.filter(r => r.key !== key), {
      key,
      label: labelMap[key] || key,
      status: 'testing',
      message: '测试中...',
    }]);

    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', target: key, ...config }),
      });
      const data = await res.json();

      setTestResults(prev => prev.map(r =>
        r.key === key ? {
          ...r,
          status: data.success ? 'ok' : 'fail',
          message: data.message || (data.success ? '连接成功' : '连接失败'),
        } : r
      ));
    } catch (err) {
      setTestResults(prev => prev.map(r =>
        r.key === key ? { ...r, status: 'fail', message: '请求失败' } : r
      ));
    }
  };

  const testAI = async () => {
    setTestResults(prev => [...prev.filter(r => r.key !== 'groq'), {
      key: 'groq',
      label: 'Groq AI 出题',
      status: 'testing',
      message: '正在调用 Groq API 生成测试题...',
    }]);

    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', target: 'groq', ...config }),
      });
      const data = await res.json();

      setTestResults(prev => prev.map(r =>
        r.key === 'groq' ? {
          ...r,
          status: data.success ? 'ok' : 'fail',
          message: data.message,
        } : r
      ));
    } catch {
      setTestResults(prev => prev.map(r =>
        r.key === 'groq' ? { ...r, status: 'fail', message: '请求失败' } : r
      ));
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              ⚙️ API 配置
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              配置 Supabase 数据库和 Groq AI 出题接口
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              ← 题库管理
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              游戏首页
            </Link>
          </div>
        </div>

        {/* 消息 */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
            {message.text}
          </div>
        )}

        {/* Supabase 配置 */}
        <div className="mb-6 p-6 rounded-2xl bg-gray-800/50 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              🗄️ Supabase 数据库
            </h2>
            <button
              onClick={() => testConnection('supabase')}
              className="px-3 py-1.5 bg-blue-600 rounded-lg text-xs hover:bg-blue-500 transition-colors"
            >
              🔌 测试连接
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Project URL</label>
              <input
                type="text"
                value={config.supabase_url}
                onChange={e => setConfig({ ...config, supabase_url: e.target.value })}
                placeholder="https://xxxxx.supabase.co"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-600 text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Publishable Key <span className="text-green-400">(anon/public)</span>
              </label>
              <input
                type="password"
                value={config.supabase_publishable_key}
                onChange={e => setConfig({ ...config, supabase_publishable_key: e.target.value })}
                placeholder="sb_publishable_xxxx 或 eyJ..."
                className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-600 text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">用于客户端和常规数据库操作</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Service Role Key <span className="text-yellow-400">(secret/admin)</span>
              </label>
              <input
                type="password"
                value={config.supabase_secret_key}
                onChange={e => setConfig({ ...config, supabase_secret_key: e.target.value })}
                placeholder="sb_secret_xxxx 或 eyJ..."
                className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-600 text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">⚠️ 绕过 RLS 的管理员密钥，请勿泄露</p>
            </div>
          </div>
        </div>

        {/* Groq AI 配置 */}
        <div className="mb-6 p-6 rounded-2xl bg-gray-800/50 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              🤖 Groq AI 出题
            </h2>
            <button
              onClick={testAI}
              className="px-3 py-1.5 bg-purple-600 rounded-lg text-xs hover:bg-purple-500 transition-colors"
            >
              🧪 测试出题
            </button>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">API Key</label>
            <input
              type="password"
              value={config.groq_api_key}
              onChange={e => setConfig({ ...config, groq_api_key: e.target.value })}
              placeholder="gsk_xxxx"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-600 text-sm font-mono placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              免费申请：<a href="https://console.groq.com/keys" target="_blank" className="text-blue-400 hover:underline">console.groq.com/keys</a>
            </p>
          </div>
        </div>

        {/* 测试结果 */}
        {testResults.length > 0 && (
          <div className="mb-6 space-y-2">
            {testResults.map(r => (
              <div
                key={r.key}
                className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                  r.status === 'ok' ? 'bg-green-500/10 text-green-300 border border-green-500/20' :
                  r.status === 'fail' ? 'bg-red-500/10 text-red-300 border border-red-500/20' :
                  'bg-gray-700/50 text-gray-300 border border-gray-600'
                }`}
              >
                {r.status === 'testing' && <span className="animate-spin">⏳</span>}
                {r.status === 'ok' && '✅'}
                {r.status === 'fail' && '❌'}
                <span className="font-medium">{r.label}:</span>
                <span>{r.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* 保存按钮 */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 transition-all"
          >
            {saving ? '⏳ 保存中...' : '💾 保存配置'}
          </button>
          <p className="text-gray-500 text-xs">
            保存后需重启 <code className="bg-gray-800 px-1 rounded">npm run dev</code> 使环境变量生效
          </p>
        </div>

        {/* 帮助说明 */}
        <div className="mt-8 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">📖 获取 API Key 指南</h3>
          <div className="space-y-2 text-xs text-gray-400">
            <p>
              <strong className="text-gray-300">Supabase:</strong>
              登录 <a href="https://supabase.com/dashboard" target="_blank" className="text-blue-400 hover:underline">Supabase Dashboard</a> →
              选择项目 → Settings → API → 复制 Project URL 和 anon/public key
            </p>
            <p>
              <strong className="text-gray-300">Groq:</strong>
              注册 <a href="https://console.groq.com" target="_blank" className="text-blue-400 hover:underline">Groq Console</a> →
              API Keys → Create API Key → 复制 <code className="bg-gray-800 px-1 rounded">gsk_</code> 开头的密钥
            </p>
            <p>
              <strong className="text-gray-300">密钥格式说明:</strong>
              Supabase 新版密钥格式为 <code className="bg-gray-800 px-1 rounded">sb_publishable_</code> / <code className="bg-gray-800 px-1 rounded">sb_secret_</code>，
              旧版为 <code className="bg-gray-800 px-1 rounded">eyJ</code> 开头的 JWT，两种格式都支持。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}