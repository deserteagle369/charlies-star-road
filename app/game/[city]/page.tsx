/**
 * 动态城市答题页面
 * 所有城市站复用此页面，启用朗读验证模式
 */
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QuestionCard from '@/components/game/QuestionCard';
import ProgressBar from '@/components/game/ProgressBar';
import CameraCapture from '@/components/game/CameraCapture';
import RewardCard from '@/components/game/RewardCard';
import LearningPanel from '@/components/game/LearningPanel';
import { CITY_MAP, getCityTheme, CITY_ORDER } from '@/lib/utils';

interface Question {
  question: string;
  hint?: string;
  answer?: string;
  explanation?: string;
}

interface MissionData {
  current_city: string;
  completed_cities: string[];
  total_score: number;
  unlocked_photos: number;
}

export default function CityPage() {
  const params = useParams();
  const cityKey = (params.city as string) || 'shanghai';
  const city = CITY_MAP[cityKey];

  // 城市不存在时回退
  if (!city) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">🤷</div>
        <h2 className="text-2xl font-bold text-white mb-2">未知站点</h2>
        <Link href="/" className="text-blue-300 hover:text-white">
          ← 返回地图
        </Link>
      </div>
    );
  }

  const theme = getCityTheme(cityKey);

  const [gameState, setGameState] = useState<'loading' | 'playing' | 'camera' | 'generating' | 'reward' | 'error'>('loading');
  const [wrongCount, setWrongCount] = useState(0);
  const [showLearning, setShowLearning] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [rewardImage, setRewardImage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [missionData, setMissionData] = useState<MissionData | null>(null);

  // 加载题目
  useEffect(() => {
    loadQuestions();
  }, [cityKey]);

  const fetchMission = async (userId: string) => {
    try {
      const res = await fetch('/api/missions', {
        headers: { 'x-user-id': userId },
      });
      if (res.ok) {
        const data = await res.json();
        setMissionData(data);
        return data;
      }
    } catch { /* ignore */ }
    return null;
  };

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

  const handleWrongWithCount = (count: number) => {
    setWrongCount(count);
  };

  const handleLearningComplete = (answer: string) => {
    setShowLearning(false);
    setScore((prev) => prev + 1);
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
        body: JSON.stringify({ city: cityKey, username: 'Explorer' }),
      });

      if (!response.ok) throw new Error('Failed to generate reward');

      const data = await response.json();
      setRewardImage(data.imageUrl);

      try {
        await fetch('/api/complete-city', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'demo-user',
          },
          body: JSON.stringify({ city: cityKey, score }),
        });
      } catch { /* 静默失败，不阻塞奖励展示 */ }

      setGameState('reward');
    } catch (err) {
      setErrorMsg('生成奖励图片失败，请稍后重试');
      setGameState('error');
      console.error(err);
    }
  };

  const handleSkipCamera = async () => {
    try {
      await fetch('/api/complete-city', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user',
        },
        body: JSON.stringify({ city: cityKey, score }),
      });
    } catch { /* ignore */ }
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
    const totalStations = CITY_ORDER.length;
    const completedCities = missionData?.completed_cities || [cityKey];
    const unlockedPhotos = missionData?.unlocked_photos ?? completedCities.length;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <RewardCard
          imageUrl={rewardImage || ''}
          cityName={city.zh}
          completedCities={completedCities}
          unlockedPhotos={unlockedPhotos}
          totalStations={totalStations}
        />
      </div>
    );
  }

  // 题库为空时
  if (questions.length === 0 && gameState === 'playing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">{city.emoji}</div>
        <h2 className="text-2xl font-bold text-white mb-2">{city.zh} 站</h2>
        <p className="text-yellow-300 text-center mb-6">📭 暂无题目</p>
        <p className="text-blue-200/70 text-sm text-center mb-6">
          该关卡题库为空，请联系管理员添加题目
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-white/20 rounded-xl text-white hover:bg-white/30"
        >
          ← 返回地图
        </Link>
      </div>
    );
  }

  // 答题中
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = totalQuestions > 0 && currentIndex >= totalQuestions - 1;

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
        {/* 激励标签 */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="bg-yellow-400/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full">
            🎯 每答对一题解锁下一题
          </span>
          <span className="bg-pink-400/20 text-pink-300 text-xs px-2 py-0.5 rounded-full">
            📸 通关后解锁新照片
          </span>
          <span className="bg-purple-400/20 text-purple-300 text-xs px-2 py-0.5 rounded-full">
            🎤 朗读验证模式
          </span>
        </div>
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
          answer={currentQuestion.answer || ''}
          hint={currentQuestion.hint}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          wrongCount={wrongCount}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
          onWrongCount={handleWrongWithCount}
          speakingEnabled={true}
        />
      )}

      {/* 学一学按钮（连续答错3次后出现） */}
      {wrongCount >= 3 && !showLearning && (
        <button
          onClick={() => setShowLearning(true)}
          className="mt-4 px-5 py-2 bg-amber-500/20 hover:bg-amber-500/30 rounded-xl text-amber-300 text-sm border border-amber-500/30 transition-colors"
        >
          📚 学一学 — 答错了？点我解锁答案
        </button>
      )}

      {/* 学习面板 */}
      {showLearning && currentQuestion && (
        <LearningPanel
          question={currentQuestion.question}
          hint={currentQuestion.hint || ''}
          city={cityKey}
          onComplete={handleLearningComplete}
          onClose={() => setShowLearning(false)}
        />
      )}

      {/* 下一题按钮 */}
      {!isLastQuestion && score >= currentIndex + 1 && (
        <button
          onClick={() => setCurrentIndex((prev) => prev + 1)}
          className="mt-6 px-6 py-2 bg-green-500/30 hover:bg-green-500/40 rounded-xl text-green-300 transition-colors"
        >
          下一题 → ({currentIndex + 2}/{questions.length})
        </button>
      )}

      {!isLastQuestion && score < currentIndex + 1 && (
        <p className="mt-6 text-blue-200/50 text-sm">
          答对当前题目才能继续 ✨
        </p>
      )}

      {/* 完成按钮 */}
      {isLastQuestion && score >= questions.length && (
        <button
          onClick={handleFinish}
          className="mt-6 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-bold text-lg hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30"
        >
          🎉 完成挑战！领取奖励！
        </button>
      )}
    </div>
  );
}
