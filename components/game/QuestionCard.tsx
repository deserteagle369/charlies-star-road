/**
 * 答题卡片组件 v3
 * 两阶段流程：先答题，正确后进入朗读
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import VoiceRecorder from './VoiceRecorder';

interface QuestionCardProps {
  question: string;
  answer: string;
  hint?: string;
  onCorrect: () => void;
  onWrong: () => void;
  onWrongCount?: (count: number) => void;
  questionNumber: number;
  totalQuestions: number;
  wrongCount?: number;
  /** 是否启用朗读阶段（外部统一控制） */
  speakingEnabled?: boolean;
}

export default function QuestionCard({
  question,
  answer,
  hint,
  onCorrect,
  onWrong,
  onWrongCount,
  questionNumber,
  totalQuestions,
  wrongCount = 0,
  speakingEnabled = false,
}: QuestionCardProps) {
  // 两阶段状态
  const [phase, setPhase] = useState<'answer' | 'speak'>('answer');
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 题目切换时重置状态
  useEffect(() => {
    setPhase('answer');
    setUserAnswer('');
    setShowHint(false);
    setFeedback(null);
    inputRef.current?.focus();
  }, [question]);

  // 标准化答案
  const normalizeAnswer = (ans: string): string => {
    return ans
      .trim()
      .toLowerCase()
      .replace(/^(a|an|the)\s+/i, '')
      .replace(/\s+/g, ' ');
  };

  // === Phase 1: 答题 ===
  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const cleanUser = normalizeAnswer(userAnswer);
    const cleanCorrect = normalizeAnswer(answer);

    if (cleanUser === cleanCorrect) {
      setFeedback('correct');
      setTimeout(() => {
        if (speakingEnabled) {
          // 进入朗读阶段
          setPhase('speak');
          setFeedback(null);
        } else {
          // 无朗读，直接完成
          onCorrect();
        }
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

  // === Phase 2: 朗读 ===
  const handleSpeakSuccess = () => {
    setFeedback('correct');
    setTimeout(() => {
      onCorrect();
    }, 800);
  };

  const handleSpeakFail = () => {
    // 朗读失败允许重试，不计入错误
    setFeedback('wrong');
    setTimeout(() => {
      setFeedback(null);
    }, 800);
  };

  // 显示的问题文本（去掉末尾括号答案）
  const displayQuestion = question.replace(/\([^)]+\)\s*$/, '');

  // 朗读阶段的完整句子
  const fullSentence = question.replace(/\s*\([^)]+\)\s*$/, '');

  return (
    <div
      className={`w-full max-w-lg mx-auto p-6 rounded-3xl backdrop-blur-2xl transition-all duration-300 ${
        feedback === 'correct'
          ? 'bg-green-500/30 border-2 border-green-400'
          : feedback === 'wrong'
          ? 'bg-red-500/30 border-2 border-red-400'
          : 'bg-white/10 border border-white/20'
      }`}
    >
      {/* 进度指示 */}
      <div className="text-center mb-4">
        <span className="text-blue-200 text-sm">
          第 {questionNumber} / {totalQuestions} 题
          {phase === 'speak' && <span className="ml-2 text-purple-300">🎤 朗读阶段</span>}
        </span>
      </div>

      {/* 题目 */}
      <div className="text-center mb-6">
        {phase === 'answer' ? (
          <p className="text-xl md:text-2xl text-white font-medium leading-relaxed">
            {displayQuestion}
          </p>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="text-yellow-300 text-sm">请朗读以下句子：</p>
            <p className="text-xl md:text-2xl text-white font-medium leading-relaxed bg-purple-500/10 border border-purple-400/30 rounded-2xl px-4 py-3">
              {fullSentence}
            </p>
          </div>
        )}
      </div>

      {/* === Phase 1: 答题 === */}
      {phase === 'answer' && (
        <>
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
            <p className="text-center text-yellow-300 text-sm mb-4 animate-pulse">
              💡 {hint}
            </p>
          )}

          {/* 输入框 + 提交 */}
          <form onSubmit={handleAnswerSubmit} className="flex flex-col gap-3">
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="输入你的答案..."
              className={`w-full px-4 py-3 rounded-2xl bg-white/10 border-2 text-white text-center text-lg placeholder-white/40 outline-none transition-colors ${
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
              disabled={!userAnswer.trim() || feedback !== null}
              className={`w-full py-3 rounded-2xl font-bold text-lg transition-all duration-200 active:scale-95 ${
                !userAnswer.trim() || feedback !== null
                  ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-purple-500/30'
              }`}
            >
              提交答案 ✨
            </button>
          </form>
        </>
      )}

      {/* === Phase 2: 朗读 === */}
      {phase === 'speak' && (
        <div className="flex flex-col gap-3">
          <VoiceRecorder
            expectedAnswer={fullSentence}
            onSuccess={handleSpeakSuccess}
            onFail={handleSpeakFail}
          />
        </div>
      )}

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