/**
 * 管理员后台 - 题库管理
 * 路由: /admin
 * 功能: 查看题目、审核、编辑、AI批量生成
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// 教材单元定义（对应四年级下册英语）
const MODULES = [
  {
    module_num: 1,
    name: 'Using my five senses',
    units: [
      { unit_num: 1, name: 'What can you smell and taste?', pages: '2-6' },
      { unit_num: 2, name: 'How does it feel?', pages: '7-11' },
      { unit_num: 3, name: 'Look at the shadow!', pages: '12-16' },
    ],
  },
  {
    module_num: 2,
    name: 'My favourite things',
    units: [
      { unit_num: 1, name: 'Sports', pages: '17-21' },
      { unit_num: 2, name: 'Cute animals', pages: '22-26' },
      { unit_num: 3, name: 'Home life', pages: '27-31' },
    ],
  },
  {
    module_num: 3,
    name: 'Things around us',
    units: [
      { unit_num: 1, name: 'Sounds', pages: '32-36' },
      { unit_num: 2, name: 'Time', pages: '37-41' },
      { unit_num: 3, name: 'Days of the week', pages: '42-46' },
    ],
  },
  {
    module_num: 4,
    name: 'More things to learn',
    units: [
      { unit_num: 1, name: 'A Music class', pages: '47-51' },
      { unit_num: 2, name: 'Festivals in China', pages: '52-56' },
      { unit_num: 3, name: 'Story time', pages: '57-61' },
    ],
  },
];

interface Question {
  id: string;
  module_num: number;
  unit_num: number;
  unit_name: string;
  knowledge_point: string;
  question: string;
  answer: string;
  hint: string;
  explanation: string;
  difficulty: string;
  status: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateCount, setGenerateCount] = useState(10);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Question>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 加载题库
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedModule) params.set('module', String(selectedModule));
      if (selectedUnit) params.set('unit', String(selectedUnit));
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('pageSize', '50');

      const res = await fetch(`/api/questions/bank?${params}`);
      const data = await res.json();
      setQuestions(data.questions || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      showMessage('error', '加载失败');
    }
    setLoading(false);
  }, [selectedModule, selectedUnit, statusFilter, page]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // AI批量生成
  const handleGenerate = async () => {
    if (!selectedModule || !selectedUnit) return;

    setGenerating(true);
    try {
      const unitName = MODULES.find(m => m.module_num === selectedModule)
        ?.units.find(u => u.unit_num === selectedUnit)?.name || '';

      const res = await fetch('/api/questions/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ai_generate',
          module_num: selectedModule,
          unit_num: selectedUnit,
          unit_name: unitName,
          count: generateCount,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      showMessage('success', `成功生成 ${data.count} 道题目！`);
      loadQuestions(); // 刷新列表
    } catch (err) {
      console.error(err);
      showMessage('error', '生成失败，请检查API配置');
    }
    setGenerating(false);
  };

  // 审核操作
  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/questions/bank', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Failed');
      showMessage('success', status === 'approved' ? '✅ 已通过审核' : '❌ 已拒绝');
      loadQuestions();
    } catch {
      showMessage('error', '操作失败');
    }
  };

  // 编辑模式
  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setEditForm({ ...q });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const res = await fetch('/api/questions/bank', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });
      if (!res.ok) throw new Error('Failed');
      setEditingId(null);
      showMessage('success', '已保存');
      loadQuestions();
    } catch {
      showMessage('error', '保存失败');
    }
  };

  // 删除
  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此题目？')) return;
    try {
      await fetch(`/api/questions/bank?id=${id}`, { method: 'DELETE' });
      showMessage('success', '已删除');
      loadQuestions();
    } catch {
      showMessage('error', '删除失败');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const currentUnitName = selectedModule && selectedUnit
    ? MODULES.find(m => m.module_num === selectedModule)?.units.find(u => u.unit_num === selectedUnit)?.name
    : '';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      {/* 头部 */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">📚 题库管理后台</h1>
            <p className="text-gray-400 mt-1">Charlie&apos;s Star Road - 四年级下册英语（牛津上海版）</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/settings" className="px-4 py-2 bg-purple-700 rounded-lg hover:bg-purple-600 transition-colors text-sm">
              ⚙️ API 配置
            </Link>
            <Link href="/" className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm">
              ← 返回游戏
            </Link>
          </div>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧：单元选择 */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-lg font-semibold mb-3">📖 选择单元</h2>
            {MODULES.map(mod => (
              <details key={mod.module_num} open={selectedModule === mod.module_num} className="group">
                <summary
                  className="cursor-pointer p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedModule(selectedModule === mod.module_num ? null : mod.module_num);
                    setSelectedUnit(null);
                  }}
                >
                  Module {mod.module_num}: {mod.name}
                </summary>
                {selectedModule === mod.module_num && (
                  <div className="ml-4 mt-2 space-y-1">
                    {mod.units.map(unit => (
                      <button
                        key={unit.unit_num}
                        onClick={() => {
                          setSelectedUnit(unit.unit_num);
                          setPage(1);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                          selectedUnit === unit.unit_num
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-750 hover:bg-gray-700 text-gray-300'
                        }`}
                      >
                        U{unit.unit_num}: {unit.name}
                        <span className="text-gray-500 text-xs ml-1">(p.{unit.pages})</span>
                      </button>
                    ))}
                  </div>
                )}
              </details>
            ))}

            {/* AI生成控制 */}
            {selectedModule && selectedUnit && (
              <div className="mt-4 p-4 rounded-xl bg-purple-900/30 border border-purple-500/30">
                <h3 className="font-semibold text-purple-300 mb-2">🤖 AI 批量出题</h3>
                <p className="text-xs text-gray-400 mb-3">{currentUnitName}</p>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={generateCount}
                  onChange={(e) => setGenerateCount(parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm mb-2"
                />
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium text-sm hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                >
                  {generating ? '⏳ AI出题中...' : `✨ 生成 ${generateCount} 道题`}
                </button>
              </div>
            )}
          </div>

          {/* 右侧：题目列表 */}
          <div className="lg:col-span-3">
            {/* 筛选栏 */}
            <div className="flex items-center gap-4 mb-4">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm"
              >
                <option value="all">全部状态</option>
                <option value="pending">待审核</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
              </select>

              <span className="text-gray-400 text-sm">
                共 {total} 道题目
              </span>

              <button
                onClick={() => loadQuestions()}
                className="ml-auto px-3 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600"
              >
                🔄 刷新
              </button>
            </div>

            {/* 题目卡片列表 */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-gray-400">加载中...</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <div className="text-5xl mb-4">📭</div>
                <p>暂无题目</p>
                <p className="text-sm mt-2">选择左侧单元后点击&quot;AI批量出题&quot;生成</p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      q.status === 'approved'
                        ? 'bg-green-900/10 border-green-500/20'
                        : q.status === 'rejected'
                        ? 'bg-red-900/10 border-red-500/20'
                        : 'bg-gray-800/50 border-gray-700'
                    }`}
                  >
                    {editingId === q.id ? (
                      /* 编辑模式 */
                      <div className="space-y-3">
                        <textarea
                          value={editForm.question || ''}
                          onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm"
                          rows={2}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            value={editForm.answer || ''}
                            onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                            placeholder="答案"
                            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm"
                          />
                          <input
                            value={editForm.hint || ''}
                            onChange={(e) => setEditForm({ ...editForm, hint: e.target.value })}
                            placeholder="提示"
                            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={saveEdit} className="px-4 py-1.5 bg-blue-600 rounded-lg text-sm hover:bg-blue-500">保存</button>
                          <button onClick={() => setEditingId(null)} className="px-4 py-1.5 bg-gray-600 rounded-lg text-sm hover:bg-gray-500">取消</button>
                        </div>
                      </div>
                    ) : (
                      /* 展示模式 */
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                q.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                                q.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                                'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {q.status === 'approved' ? '✅ 已通过' : q.status === 'rejected' ? '❌ 已拒绝' : '⏳ 待审核'}
                              </span>
                              <span className="text-xs text-gray-500">
                                M{q.module_num}-U{q.unit_num}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                q.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                                q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                'bg-red-500/10 text-red-400'
                              }`}>
                                {q.difficulty}
                              </span>
                            </div>
                            <p className="text-white font-medium mb-1">{q.question}</p>
                            <p className="text-green-300 text-sm">答案: <strong>{q.answer}</strong></p>
                            {q.hint && <p className="text-yellow-200/60 text-xs mt-1">💡 {q.hint}</p>}
                            {q.explanation && <p className="text-gray-400 text-xs mt-1">{q.explanation}</p>}
                            {q.knowledge_point && <p className="text-blue-300/60 text-xs mt-1">📌 {q.knowledge_point}</p>}
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
                          {q.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleReview(q.id, 'approved')}
                                className="px-3 py-1 bg-green-600 rounded-lg text-xs hover:bg-green-500"
                              >
                                ✅ 通过
                              </button>
                              <button
                                onClick={() => handleReview(q.id, 'rejected')}
                                className="px-3 py-1 bg-red-600 rounded-lg text-xs hover:bg-red-500"
                              >
                                ❌ 拒绝
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => startEdit(q)}
                            className="px-3 py-1 bg-gray-600 rounded-lg text-xs hover:bg-gray-500"
                          >
                            ✏️ 编辑
                          </button>
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="px-3 py-1 bg-red-900/50 text-red-300 rounded-lg text-xs hover:bg-red-900"
                          >
                            🗑️ 删除
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* 分页 */}
                {total > 50 && (
                  <div className="flex justify-center gap-2 pt-4">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="px-4 py-2 bg-gray-700 rounded-lg text-sm disabled:opacity-40"
                    >
                      ← 上一页
                    </button>
                    <span className="py-2 text-gray-400 text-sm">第 {page} 页</span>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={(page * 50) >= total}
                      className="px-4 py-2 bg-gray-700 rounded-lg text-sm disabled:opacity-40"
                    >
                      下一页 →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}