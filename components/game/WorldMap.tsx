/**
 * 世界地图关卡选择组件
 */
'use client';

import Link from 'next/link';
import { CITY_MAP } from '@/lib/utils';

const CITY_ORDER = ['shanghai', 'london', 'paris', 'newyork', 'tokyo'];

interface WorldMapProps {
  completedCities?: string[];
  username?: string;
}

export default function WorldMap({ completedCities = [], username = 'Explorer' }: WorldMapProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
          🌟 Charlie&apos;s Star Road
        </h1>
        <p className="text-lg text-blue-200">欢迎，{username}！开启你的英语星光之旅 ✨</p>
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
            const isCompleted = completedCities.includes(city) && completedCities.includes(CITY_ORDER[i + 1]);

            return (
              <line
                key={`line-${city}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isCompleted ? '#ffd700' : completedCities.includes(city) ? '#4ade80' : '#4a5568'}
                strokeWidth="2"
                strokeDasharray={isCompleted ? '0' : '5,5'}
              />
            );
          })}
        </svg>

        {/* 城市节点 */}
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {CITY_ORDER.map((cityKey, index) => {
            const city = CITY_MAP[cityKey];
            const isCompleted = completedCities.includes(cityKey);
            const isUnlocked = city.unlocked || index === 0 || completedCities.includes(CITY_ORDER[index - 1]);

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

      {/* 底部提示 */}
      <div className="mt-8 text-center text-blue-200/70 text-sm">
        <p>完成当前关卡即可解锁下一站 🌉</p>
      </div>
    </div>
  );
}
