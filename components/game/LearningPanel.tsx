/**
 * 学习模式面板 - 答错后可进入学习解锁答案
 */
'use client';

import { useState, useEffect } from 'react';

interface LearningContent {
  title: string;
  passage: string;
  vocabulary: { word: string; meaning: string }[];
  tip: string;
}

interface LearningPanelProps {
  question: string;
  hint: string;
  city: string;
  onComplete: (answer: string) => void;
  onClose: () => void;
}

export default function LearningPanel({ question, hint, city, onComplete, onClose }: LearningPanelProps) {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<LearningContent | null>(null);
  const [error, setError] = useState('');
  const [showTip, setShowTip] = useState(false);
  const [readComplete, setReadComplete] = useState(false);
  const [vocabExpanded, setVocabExpanded] = useState(false);

  useEffect(() => {
    fetchLearningContent();
  }, [city]);

  const fetchLearningContent = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/learning-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, question, hint }),
      });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setContent(data);
    } catch (err) {
      setError('加载学习内容失败，请稍后重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReadComplete = () => {
    setReadComplete(true);
  };

  const handleUnlockAnswer = () => {
    if (content?.vocabulary?.[0]?.word) {
      onComplete(content.vocabulary[0].word);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
        {/* 顶部标题 */}
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <h2 className="text-xl font-bold text-white">学一学</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              ✕
            </button>
          </div>
          <p className="text-amber-300 text-sm mt-1">完成学习即可查看答案 ✨</p>
        </div>

        {/* 内容区 */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center py-8">
              <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-white/60 text-sm">AI 正在生成学习内容...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-300 mb-3">{error}</p>
              <button
                onClick={fetchLearningContent}
                className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20"
              >
                重试
              </button>
            </div>
          )}

          {content && !loading && (
            <div className="space-y-5">
              {/* 题目回顾 */}
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-blue-200 text-xs mb-1">原题</p>
                <p className="text-white text-sm">{question.replace(/\([^)]+\)$/, '')}</p>
              </div>

              {/* 提示 */}
              {hint && (
                <div className="bg-yellow-500/10 rounded-xl p-3 border border-yellow-500/20">
                  <p className="text-yellow-300 text-xs mb-1">💡 提示</p>
                  <p className="text-yellow-100 text-sm">{hint}</p>
                </div>
              )}

              {/* 阅读材料 */}
              <div>
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <span>📖</span> {content.title}
                </h3>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">
                    {content.passage}
                  </p>
                </div>
                {!readComplete && (
                  <button
                    onClick={handleReadComplete}
                    className="w-full mt-3 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-300 text-sm transition-colors"
                  >
                    ✓ 我已阅读完毕
                  </button>
                )}
                {readComplete && (
                  <p className="mt-3 text-green-400 text-sm flex items-center gap-1">
                    <span>✅</span> 已阅读
                  </p>
                )}
              </div>

              {/* 词汇表 */}
              {content.vocabulary && content.vocabulary.length > 0 && (
                <div>
                  <button
                    onClick={() => setVocabExpanded(!vocabExpanded)}
                    className="w-full flex items-center justify-between py-2 text-white font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      <span>📝</span> 关键词汇
                    </span>
                    <span className="text-white/50">{vocabExpanded ? '▲' : '▼'}</span>
                  </button>
                  {vocabExpanded && (
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10 space-y-2">
                      {content.vocabulary.map((v, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold min-w-[60px]">{v.word}</span>
                          <span className="text-white/70 text-sm">{v.meaning}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 小贴士 */}
              {content.tip && (
                <div className="bg-purple-500/10 rounded-xl p-3 border border-purple-500/20">
                  <p className="text-purple-300 text-xs mb-1">💬 学习小贴士</p>
                  <p className="text-purple-100 text-sm">{content.tip}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部解锁按钮 */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <button
            onClick={handleUnlockAnswer}
            disabled={!readComplete || !content}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
          >
            🔓 解锁答案
          </button>
          {!readComplete && (
            <p className="text-center text-white/40 text-xs mt-2">请先阅读上方内容</p>
          )}
        </div>
      </div>
    </div>
  );
}