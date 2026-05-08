/**
 * 世界地图关卡选择组件
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CITY_MAP, CITY_ORDER } from '@/lib/utils';
import MusicPlayer from './MusicPlayer';
import PhotoGallery from './PhotoGallery';

const TOTAL_STATIONS = CITY_ORDER.length; // 5

// 周深介绍内容
const ZHOUSHEN_INTRO = {
  quote: '"用唱歌的方式，表达内心最真实的声音"',
  name: '周深 (Zhou Shen)',
  title: '中国内地流行乐男歌手 · 跨性别音乐人',
  achievements: [
    '《大鱼》 - 播放量破亿，经典传唱',
    '《起风了》 - 全网热播，感动无数',
    '《光亮》 - 冬奥主题歌，惊艳世界',
    '《Rubbish》 - 全英文创作，跨越语言',
  ],
  highlights: '声线空灵 · 高音惊艳 · 中英双语 · 治愈人心',
};

interface MissionData {
  current_city: string;
  completed_cities: string[];
  total_score: number;
  unlocked_photos: number;
}

interface WorldMapProps {
  completedCities?: string[];
  username?: string;
}

export default function WorldMap({ completedCities = [], username = 'Explorer' }: WorldMapProps) {
  const [missionData, setMissionData] = useState<MissionData | null>(null);
  const [loading, setLoading] = useState(false);

  // 从 API 获取闯关进度
  useEffect(() => {
    const fetchMission = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/missions', {
          headers: { 'x-user-id': 'demo-user' }, // 替换为真实 user_id
        });
        if (res.ok) {
          const data = await res.json();
          setMissionData(data);
        }
      } catch {
        // 静默失败，显示默认状态
      }
      setLoading(false);
    };
    fetchMission();
  }, []);

  // 合并：优先用 API 数据，否则用 props
  const allCompleted = missionData?.completed_cities || completedCities;
  const unlockedPhotos = missionData?.unlocked_photos ?? 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰星星 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-yellow-300/20 animate-pulse"
            style={{
              left: `${(i * 17 + 7) % 100}%`,
              top: `${(i * 23 + 11) % 100}%`,
              fontSize: `${8 + (i % 5) * 4}px`,
              animationDelay: `${(i * 0.3) % 3}s`,
              animationDuration: `${2 + (i % 3)}s`,
            }}
          >
            ✦
          </div>
        ))}
      </div>

      {/* 个人资料按钮 */}
      <div className="absolute top-2 right-4 z-10">
        <Link
          href="/profile"
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10 transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
            {username[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-white/80 text-sm hidden sm:inline">{username}</span>
          <span className="text-blue-300 text-xs">⚙️</span>
        </Link>
      </div>

      {/* 周深介绍区 */}
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-sm rounded-2xl border border-yellow-400/20 p-5 mb-6">
        <div className="flex items-start gap-4">
          {/* 周深头像占位 - 使用维基百科真实照片 */}
          <div className="flex-shrink-0 w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-pink-400 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Zhou_Shen%2C_Global_Chinese_Golden_Chart%2C_Beijing_2019_%28cropped%29.jpg/440px-Zhou_Shen%2C_Global_Chinese_Golden_Chart%2C_Beijing_2019_%28cropped%29.jpg"
              alt="周深"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = '🎤';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-yellow-400/70 uppercase tracking-wider mb-0.5">
              🌟 本次旅程主题
            </div>
            <h2 className="text-white font-bold text-base mb-0.5">
              {ZHOUSHEN_INTRO.name} · {ZHOUSHEN_INTRO.title}
            </h2>
            <div className="text-blue-200/60 text-xs italic mb-2">
              {ZHOUSHEN_INTRO.quote}
            </div>
            {/* 代表作品 */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {ZHOUSHEN_INTRO.achievements.map((item) => (
                <div key={item} className="text-xs text-blue-200/70 flex items-center gap-1">
                  <span className="text-yellow-400">♪</span> {item}
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-yellow-400/60 font-medium">
              {ZHOUSHEN_INTRO.highlights}
            </div>
          </div>
        </div>

        {/* 音乐播放器（紧凑模式） */}
        <MusicPlayer compact />
      </div>

      {/* 标题 */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
          🌟 Charlie&apos;s Star Road
        </h1>
        <p className="text-lg text-blue-200">
          欢迎，{username}！开启你的英语星光之旅 ✨
        </p>
        {/* 进度总览 */}
        {allCompleted.length > 0 && (
          <div className="mt-2 flex items-center justify-center gap-3 text-sm">
            <span className="text-yellow-400">
              ⭐ 已完成 {allCompleted.length}/{TOTAL_STATIONS} 站
            </span>
            <span className="text-blue-200/50">|</span>
            <span className="text-pink-300">
              📸 已解锁 {unlockedPhotos} 张照片
            </span>
          </div>
        )}
      </div>

      {/* 地图容器 */}
      <div className="relative w-full max-w-2xl">
        {/* 连接线 SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid meet"
        >
          {CITY_ORDER.slice(0, -1).map((city, i) => {
            const current = CITY_MAP[city];
            const next = CITY_MAP[CITY_ORDER[i + 1]];
            const x1 = ((current.lng + 180) / 360) * 400;
            const y1 = ((90 - current.lat) / 180) * 300;
            const x2 = ((next.lng + 180) / 360) * 400;
            const y2 = ((90 - next.lat) / 180) * 300;
            const isCompleted = allCompleted.includes(city) && allCompleted.includes(CITY_ORDER[i + 1]);
            const currentDone = allCompleted.includes(city);

            return (
              <line
                key={`line-${city}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isCompleted ? '#ffd700' : currentDone ? '#4ade80' : '#4a5568'}
                strokeWidth="2"
                strokeDasharray={isCompleted || currentDone ? '0' : '5,5'}
              />
            );
          })}
        </svg>

        {/* 城市节点 */}
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {CITY_ORDER.map((cityKey, index) => {
            const city = CITY_MAP[cityKey];
            const isCompleted = allCompleted.includes(cityKey);
            const isUnlocked =
              city.unlocked ||
              index === 0 ||
              allCompleted.includes(CITY_ORDER[index - 1]);

            return (
              <Link
                key={cityKey}
                href={isUnlocked ? `/game/${cityKey}` : '#'}
                className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${
                  isUnlocked
                    ? 'cursor-pointer hover:scale-110 hover:bg-white/10'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={(e) => !isUnlocked && e.preventDefault()}
              >
                {/* 城市图标 */}
                <div
                  className={`text-5xl md:text-6xl mb-2 ${
                    isCompleted ? 'animate-bounce' : ''
                  }`}
                >
                  {isUnlocked ? city.emoji : '🔒'}
                </div>

                {/* 城市名 */}
                <div className="text-center">
                  <div className="text-white font-bold text-base md:text-lg">{city.zh}</div>
                  <div className="text-blue-300 text-xs">{city.en}</div>
                  {isCompleted && (
                    <span className="inline-block mt-1 text-yellow-400 text-sm">⭐ 已完成</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 照片墙（渐进解锁） */}
      <div className="w-full max-w-2xl mt-6">
        <PhotoGallery unlockedCount={unlockedPhotos} totalStations={TOTAL_STATIONS} />
      </div>

      {/* 底部提示 */}
      <div className="mt-6 text-center text-blue-200/70 text-sm">
        <p>完成当前关卡即可解锁下一站 🌉 · 集齐全部 {TOTAL_STATIONS} 张星光照片 🏆</p>
      </div>
    </div>
  );
}
