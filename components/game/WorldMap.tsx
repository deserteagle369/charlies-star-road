/**
 * 世界地图关卡选择组件
 */
'use client';

import Link from 'next/link';
import { CITY_MAP } from '@/lib/utils';

const CITY_ORDER = ['shanghai', 'london', 'paris', 'newyork', 'tokyo'];

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

interface WorldMapProps {
  completedCities?: string[];
  username?: string;
}

export default function WorldMap({ completedCities = [], username = 'Explorer' }: WorldMapProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰星星 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-yellow-300/20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${8 + Math.random() * 16}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          >
            ✦
          </div>
        ))}
      </div>

      {/* 周深介绍区 */}
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-sm rounded-2xl border border-yellow-400/20 p-5 mb-8">
        <div className="flex items-start gap-4">
          {/* 周深头像占位 - 后期替换为真实照片 */}
          <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-pink-400 flex items-center justify-center text-3xl">
            🎤
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

        {/* 音乐播放器 */}
        <div className="mt-4 bg-white/5 rounded-xl p-3 flex items-center gap-3">
          <div className="text-2xl animate-pulse flex-shrink-0">🎵</div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium truncate">
              正在播放 · 《大鱼》— 周深
            </div>
            <div className="mt-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full" />
            </div>
          </div>
          {/* 播放/暂停按钮 */}
          <button
            className="flex-shrink-0 w-8 h-8 bg-yellow-400/20 hover:bg-yellow-400/30 rounded-full flex items-center justify-center text-yellow-400 text-sm transition-colors"
            title="播放周深音乐"
            onClick={() => alert('音乐播放器：可将周深音乐文件放入 public/music/ 目录后启用')}
          >
            ▶
          </button>
        </div>
      </div>

      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
          🌟 Charlie&apos;s Star Road
        </h1>
        <p className="text-lg text-blue-200">
          欢迎，{username}！开启你的英语星光之旅 ✨
        </p>
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