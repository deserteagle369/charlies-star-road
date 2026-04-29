/**
 * 上海站 - 第一关答题页面
 */
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QuestionCard from '@/components/game/QuestionCard';
import ProgressBar from '@/components/game/ProgressBar';
import CameraCapture from '@/components/game/CameraCapture';
import RewardCard from '@/components/game/RewardCard';
import { CITY_MAP, getCityTheme } from '@/lib/utils';

interface Question {
  question: string;
  hint?: string;
}

export default function ShanghaiPage() {
  const params = useParams();
  const cityKey = (params.city as string) || 'shanghai';
  const city = CITY_MAP[cityKey] || CITY_MAP.shanghai;
  const theme = getCityTheme(cityKey);

  const [gameState, setGameState] = useState<'loading' | 'playing' | 'camera' | 'generating' | 'reward' | 'error'>('loading');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [rewardImage, setRewardImage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 加载题目
  useEffect(() => {
    loadQuestions();
  }, [cityKey]);

  const loadQuestions = async () => {
    setGameState('loading');
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: cityKey, difficulty: 'easy', count: 5 }),
      });

      if (!response.ok) throw new Error('Failed to load questions');

      const data = await response.json();
      setQuestions(data.questions || []);
      setGameState('playing');
    } catch (err) {
      setErrorMsg('加载题目失败，请检查网络或 API 配置');
      setGameState('error');
      console.error(err);
    }
  };

  const handleCorrect = () => {
    setScore((prev) => prev + 1);
  };

  const handleWrong = () => {
    // 答错继续，不扣分
  };

  const handleFinish = () => {
    setGameState('camera');
  };

  const handlePhotoCapture = async (photoBase64: string) => {
    setGameState('generating');
    try {
      const response = await fetch('/api/generate-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoBase64,
          city: cityKey,
          username: 'Explorer',
        }),
      });

      if (!response.ok) throw new Error('Failed to generate reward');

      const data = await response.json();
      setRewardImage(data.imageUrl);
      setGameState('reward');
    } catch (err) {
      setErrorMsg('生成奖励图片失败，请稍后重试');
      setGameState('error');
      console.error(err);
    }
  };

  const handleSkipCamera = () => {
    setGameState('reward');
  };

  // 加载中
  if (gameState === 'loading' || gameState === 'generating') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-6xl mb-4 animate-pulse">{city.emoji}</div>
        <h1 className="text-3xl font-bold text-white mb-2">{city.zh} 站</h1>
        <p className="text-blue-200 animate-pulse">
          {gameState === 'loading' ? 'AI 出题中...' : '🎨 AI 画师创作中...'}
        </p>
        <div className="mt-6 flex items-center gap-2 text-white/60">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span>请稍候</span>
        </div>
      </div>
    );
  }

  // 错误
  if (gameState === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">😢</div>
        <h2 className="text-2xl font-bold text-white mb-2">出错了</h2>
        <p className="text-red-300 text-center mb-6">{errorMsg}</p>
        <div className="flex gap-4">
          <button
            onClick={loadQuestions}
            className="px-6 py-3 bg-white/20 rounded-xl text-white hover:bg-white/30"
          >
            重试
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white/20 rounded-xl text-white hover:bg-white/30"
          >
            返回地图
          </Link>
        </div>
      </div>
    );
  }

  // 拍照
  if (gameState === 'camera') {
    return <CameraCapture onCapture={handlePhotoCapture} onCancel={handleSkipCamera} />;
  }

  // 通关奖励
  if (gameState === 'reward') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <RewardCard
          imageUrl={rewardImage || ''}
          cityName={city.zh}
        />
      </div>
    );
  }

  // 答题中
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex >= questions.length - 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* 顶部信息 */}
      <div className="text-center mb-6">
        <Link href="/" className="text-blue-200/70 hover:text-white text-sm mb-2 inline-block">
          ← 返回地图
        </Link>
        <h1 className="text-3xl font-bold text-white mb-1">
          <span className="mr-2">{city.emoji}</span>
          {city.zh} 站
        </h1>
        <p className="text-blue-200 text-sm">{city.en} - 英语填空挑战</p>
      </div>

      {/* 进度条 */}
      <div className="w-full max-w-md mb-8">
        <ProgressBar current={score} total={questions.length} label="得分" />
      </div>

      {/* 答题卡片 */}
      {currentQuestion && (
        <QuestionCard
          key={currentIndex}
          question={currentQuestion.question}
          hint={currentQuestion.hint}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
        />
      )}

      {/* 下一题按钮 */}
      {!isLastQuestion && score >= currentIndex + 1 && (
        <button
          onClick={() => setCurrentIndex((prev) => prev + 1)}
          className="mt-6 px-6 py-2 bg-white/10 rounded-xl text-white hover:bg-white/20"
        >
          下一题 →
        </button>
      )}

      {/* 完成按钮（当答对当前题目时显示） */}
      {isLastQuestion && score >= questions.length && (
        <button
          onClick={handleFinish}
          className="mt-6 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-bold text-lg hover:from-green-600 hover:to-emerald-600"
        >
          🎉 完成挑战！
        </button>
      )}
    </div>
  );
}
