/**
 * 答题卡片组件
 */
'use client';

import { useState, useRef, useEffect } from 'react';

interface QuestionCardProps {
  question: string;
  hint?: string;
  onCorrect: () => void;
  onWrong: () => void;
  onWrongCount?: (count: number) => void; // 连续答错次数回调
  questionNumber: number;
  totalQuestions: number;
  wrongCount?: number; // 外部传入的当前答错次数
}

export default function QuestionCard({
  question,
  hint,
  onCorrect,
  onWrong,
  onWrongCount,
  questionNumber,
  totalQuestions,
  wrongCount = 0,
}: QuestionCardProps) {
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    // 简单匹配：忽略大小写和空格
    const userAnswer = answer.trim().toLowerCase();
    // 从题目中提取答案（括号中的内容）
    const match = question.match(/\(([^)]+)\)$/);
    const correctAnswer = match ? match[1].toLowerCase() : '';

    if (userAnswer === correctAnswer) {
      setFeedback('correct');
      setTimeout(() => {
        onCorrect();
        setAnswer('');
        setFeedback(null);
        setShowHint(false);
      }, 800);
    } else {
      setFeedback('wrong');
      const newWrongCount = wrongCount + 1;
      setTimeout(() => {
        onWrong();
        onWrongCount?.(newWrongCount);
        setFeedback(null);
      }, 800);
    }
  };

  return (
    <div className={`w-full max-w-lg mx-auto p-6 rounded-3xl backdrop-blur-md transition-all duration-300 ${
      feedback === 'correct'
        ? 'bg-green-500/30 border-2 border-green-400'
        : feedback === 'wrong'
        ? 'bg-red-500/30 border-2 border-red-400 animate-shake'
        : 'bg-white/10 border border-white/20'
    }`}>
      {/* 进度指示 */}
      <div className="text-center mb-4">
        <span className="text-blue-200 text-sm">
          第 {questionNumber} / {totalQuestions} 题
        </span>
      </div>

      {/* 题目 */}
      <div className="text-center mb-6">
        <p className="text-xl md:text-2xl text-white font-medium leading-relaxed">
          {question.replace(/\([^)]+\)$/, '')}
        </p>
        {question.includes('(') && (
          <p className="text-blue-300/60 text-sm mt-2">({})</p>
        )}
      </div>

      {/* 提示按钮 */}
      {hint && !showHint && (
        <button
          onClick={() => setShowHint(true)}
          className="w-full mb-4 py-2 text-sm text-blue-300 hover:text-white transition-colors"
        >
          💡 需要提示？
        </button>
      )}
      {showHint && hint && (
        <p className="text-center text-yellow-300 text-sm mb-4 animate-pulse">💡 {hint}</p>
      )}

      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          ref={inputRef}
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="输入你的答案..."
          className={`w-full px-4 py-3 rounded-xl bg-white/10 border-2 text-white text-center text-lg placeholder-white/40 outline-none transition-colors ${
            feedback === 'correct'
              ? 'border-green-400 bg-green-500/20'
              : feedback === 'wrong'
              ? 'border-red-400 bg-red-500/20 animate-shake'
              : 'border-white/30 focus:border-blue-400'
          }`}
          disabled={feedback !== null}
          autoComplete="off"
          spellCheck={false}
        />

        <button
          type="submit"
          disabled={!answer.trim() || feedback !== null}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
        >
          提交答案 ✨
        </button>
      </form>

      {/* 反馈动画 */}
      {feedback === 'correct' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-6xl animate-bounce">🎉</span>
        </div>
      )}
      {feedback === 'wrong' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-6xl animate-shake">❌</span>
        </div>
      )}
    </div>
  );
}
