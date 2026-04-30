/**
 * 音乐播放器组件 - 周深推荐曲目
 * 使用 YouTube 嵌入式播放器（免费、合法、高清）
 */
'use client';

import { useState, useRef } from 'react';

interface MusicPlayerProps {
  compact?: boolean; // 紧凑模式（用于 WorldMap），完整模式用于奖励页
}

// 周深代表曲目 + YouTube 官方/粉丝上传视频
// 注意：这些链接为演示用，实际部署时请替换为你有版权授权的音乐文件
const ZHOUSHEN_SONGS = [
  {
    name: '大鱼',
    desc: '电影《大鱼海棠》主题曲 · 空灵高音代表作',
    emoji: '🐟',
    // 《大鱼》周深 - 官方 MV（来自周深官方频道）
    youtubeId: 'Ue9Fn_OGbFc',
    duration: '4:42',
    level: 1, // 第1站解锁
  },
  {
    name: '起风了',
    desc: '全网刷屏 · 一秒治愈无数心灵',
    emoji: '🌬️',
    youtubeId: 'KQ63MCjA4eM',
    duration: '5:05',
    level: 2, // 第2站解锁
  },
  {
    name: '光亮',
    desc: '北京冬奥优秀作品 · 惊艳全世界',
    emoji: '🏅',
    youtubeId: 'hHcwBSED6aM',
    duration: '4:20',
    level: 3, // 第3站解锁
  },
  {
    name: 'Rubbish',
    desc: '全英文创作 · 跨越语言的魅力',
    emoji: '🇬🇧',
    youtubeId: 'H1IgMlk1k6o',
    duration: '3:31',
    level: 4, // 第4站解锁
  },
];

export default function MusicPlayer({ compact = false }: MusicPlayerProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'list'>('player');

  const displayedSongs = compact ? ZHOUSHEN_SONGS.slice(0, 2) : (showAll ? ZHOUSHEN_SONGS : ZHOUSHEN_SONGS.slice(0, 2));

  if (compact) {
    // ============================================================
    // 紧凑模式：用于 WorldMap 首页顶部
    // ============================================================
    return (
      <div className="mt-4 bg-white/5 rounded-xl p-3 flex items-center gap-3">
        <div className="text-2xl animate-pulse flex-shrink-0">🎵</div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-xs font-medium truncate">
            {playingIndex !== null
              ? `▶ ${ZHOUSHEN_SONGS[playingIndex].name} — 周深`
              : '点击播放 · 周深音乐'}
          </div>
          <div className="mt-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full transition-all"
              style={{ width: playingIndex !== null ? '45%' : '0%' }}
            />
          </div>
        </div>
        <button
          className="flex-shrink-0 w-8 h-8 bg-yellow-400/20 hover:bg-yellow-400/30 rounded-full flex items-center justify-center text-yellow-400 text-sm transition-colors"
          title="打开音乐播放器"
          onClick={() => setActiveTab('player')}
        >
          ▶
        </button>

        {/* 音乐播放器弹窗 */}
        {activeTab === 'player' && (
          <div
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setActiveTab('list')}
          >
            <div
              className="bg-gray-900 rounded-2xl p-5 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">🎵 周深音乐</h3>
                <button
                  className="text-white/60 hover:text-white text-lg"
                  onClick={() => setActiveTab('list')}
                >
                  ✕
                </button>
              </div>

              {/* YouTube 嵌入式播放器 */}
              {playingIndex !== null ? (
                <div className="space-y-3">
                  <div className="aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${ZHOUSHEN_SONGS[playingIndex].youtubeId}?autoplay=1&rel=0`}
                      title={ZHOUSHEN_SONGS[playingIndex].name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="text-white text-sm font-medium">
                    {ZHOUSHEN_SONGS[playingIndex].emoji} {ZHOUSHEN_SONGS[playingIndex].name}
                  </div>
                  <div className="text-blue-200/60 text-xs">
                    {ZHOUSHEN_SONGS[playingIndex].desc}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">🎤</div>
                  <p className="text-white/70 text-sm mb-4">选择一首周深金曲开始聆听</p>
                </div>
              )}

              {/* 曲目列表 */}
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {ZHOUSHEN_SONGS.map((song, i) => (
                  <button
                    key={song.name}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                      playingIndex === i
                        ? 'bg-yellow-400/20 text-yellow-400'
                        : 'bg-white/5 text-white/80 hover:bg-white/10'
                    }`}
                    onClick={() => setPlayingIndex(i)}
                  >
                    <span className="text-base">{song.emoji}</span>
                    <span className="text-xs font-medium flex-1">{song.name}</span>
                    <span className="text-white/40 text-xs">{song.duration}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // 完整模式：用于 RewardCard 奖励页面
  // ============================================================
  return (
    <div className="w-full bg-white/5 rounded-2xl border border-yellow-400/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎵</span>
          <span className="text-yellow-400 font-semibold text-sm">周深推荐曲目</span>
        </div>
        {!showAll && ZHOUSHEN_SONGS.length > 2 && (
          <button
            className="text-blue-200/60 hover:text-white text-xs"
            onClick={() => setShowAll(true)}
          >
            查看全部 {ZHOUSHEN_SONGS.length} 首 ›
          </button>
        )}
      </div>

      {/* 曲目网格 */}
      <div className="grid grid-cols-2 gap-2">
        {displayedSongs.map((song, i) => (
          <button
            key={song.name}
            className="bg-white/5 rounded-xl p-2.5 text-left hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => {
              setPlayingIndex(ZHOUSHEN_SONGS.indexOf(song));
              setActiveTab('player');
            }}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm">{song.emoji}</span>
              <span className="text-white text-xs font-medium">{song.name}</span>
              {playingIndex === ZHOUSHEN_SONGS.indexOf(song) && (
                <span className="text-yellow-400 text-xs animate-pulse">▶</span>
              )}
            </div>
            <div className="text-blue-200/50 text-xs leading-tight">{song.desc}</div>
          </button>
        ))}
      </div>

      {/* YouTube 迷你播放器（当前播放） */}
      {playingIndex !== null && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="text-2xl flex-shrink-0">{ZHOUSHEN_SONGS[playingIndex].emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">
                {ZHOUSHEN_SONGS[playingIndex].name}
              </div>
              <div className="text-blue-200/50 text-xs">周深 · {ZHOUSHEN_SONGS[playingIndex].duration}</div>
            </div>
            <button
              className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center text-yellow-400 text-xs hover:bg-yellow-400/30"
              onClick={() => setActiveTab('player')}
              title="查看视频"
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
