/**
 * 音乐播放器组件 - 周深推荐曲目
 * 使用本地 MP3 文件播放
 */
'use client';

import { useState, useRef, useEffect } from 'react';

interface MusicPlayerProps {
  compact?: boolean; // 紧凑模式（用于 WorldMap），完整模式用于奖励页
}

// 周深代表曲目 - 使用本地 MP3 文件
const ZHOUSHEN_SONGS = [
  {
    name: '大鱼',
    desc: '电影《大鱼海棠》主题曲 · 空灵高音代表作',
    emoji: '🐟',
    src: '/music/shanghai.mp3',
    city: '上海站',
    level: 1,
  },
  {
    name: '起风了',
    desc: '全网刷屏 · 一秒治愈无数心灵',
    emoji: '🌬️',
    src: '/music/london.mp3',
    city: '伦敦站',
    level: 2,
  },
  {
    name: '玫瑰与小鹿',
    desc: '童话般的世界 · 温柔如诗',
    emoji: '🦌',
    src: '/music/paris.mp3',
    city: '巴黎站',
    level: 3,
  },
  {
    name: '触不可及',
    desc: '都市节拍 · 追逐梦想的勇气',
    emoji: '🌃',
    src: '/music/newyork.mp3',
    city: '纽约站',
    level: 4,
  },
  {
    name: '亲爱的旅人啊',
    desc: '千与千寻中文版 · 旅途的温柔告别',
    emoji: '⛩️',
    src: '/music/tokyo.mp3',
    city: '东京站',
    level: 5,
  },
];

export default function MusicPlayer({ compact = false }: MusicPlayerProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (playingIndex !== null) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.addEventListener('timeupdate', () => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setProgress(
              audioRef.current.duration
                ? (audioRef.current.currentTime / audioRef.current.duration) * 100
                : 0
            );
          }
        });
        audioRef.current.addEventListener('loadedmetadata', () => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        });
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
          setProgress(0);
        });
      }
      audioRef.current.src = ZHOUSHEN_SONGS[playingIndex].src;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
    return () => {
      // Don't destroy audio on index change, only on unmount
    };
  }, [playingIndex]);

  const togglePlay = (index: number) => {
    if (playingIndex === index && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setPlayingIndex(index);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const displayedSongs = compact
    ? ZHOUSHEN_SONGS.slice(0, 2)
    : showAll
    ? ZHOUSHEN_SONGS
    : ZHOUSHEN_SONGS.slice(0, 3);

  if (compact) {
    // ============================================================
    // 紧凑模式：用于 WorldMap 首页
    // ============================================================
    return (
      <div className="mt-4 bg-white/5 rounded-xl p-3">
        {/* 正在播放栏 */}
        <div className="flex items-center gap-3">
          <button
            className="flex-shrink-0 w-10 h-10 bg-yellow-400/20 hover:bg-yellow-400/30 rounded-full flex items-center justify-center text-yellow-400 text-lg transition-colors"
            onClick={() => {
              if (playingIndex !== null && isPlaying) {
                audioRef.current?.pause();
                setIsPlaying(false);
              } else if (playingIndex !== null) {
                audioRef.current?.play();
                setIsPlaying(true);
              } else {
                setPlayingIndex(0);
              }
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium truncate">
              {playingIndex !== null
                ? `${ZHOUSHEN_SONGS[playingIndex].emoji} ${ZHOUSHEN_SONGS[playingIndex].name} — 周深`
                : '🎵 点击播放 · 周深音乐'}
            </div>
            <div className="mt-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer"
              onClick={(e) => {
                if (audioRef.current && audioRef.current.duration) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = (e.clientX - rect.left) / rect.width;
                  audioRef.current.currentTime = pct * audioRef.current.duration;
                }
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-white/30 text-xs mt-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* 快速选曲 */}
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {ZHOUSHEN_SONGS.map((song, i) => (
            <button
              key={song.name}
              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs transition-colors ${
                playingIndex === i
                  ? 'bg-yellow-400/30 text-yellow-400'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
              onClick={() => togglePlay(i)}
            >
              {song.emoji} {song.name}
            </button>
          ))}
        </div>
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
        {!showAll && ZHOUSHEN_SONGS.length > 3 && (
          <button
            className="text-blue-200/60 hover:text-white text-xs"
            onClick={() => setShowAll(true)}
          >
            查看全部 {ZHOUSHEN_SONGS.length} 首 ›
          </button>
        )}
      </div>

      {/* 当前播放器 */}
      {playingIndex !== null && (
        <div className="mb-3 bg-gradient-to-r from-yellow-400/10 to-pink-400/10 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <button
              className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center text-yellow-400 text-xl hover:bg-yellow-400/30 transition-colors"
              onClick={() => togglePlay(playingIndex)}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium">
                {ZHOUSHEN_SONGS[playingIndex].emoji} {ZHOUSHEN_SONGS[playingIndex].name}
              </div>
              <div className="text-blue-200/50 text-xs">
                周深 · {ZHOUSHEN_SONGS[playingIndex].city}
              </div>
              {/* 进度条 */}
              <div className="mt-1.5 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer"
                onClick={(e) => {
                  if (audioRef.current && audioRef.current.duration) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    audioRef.current.currentTime = pct * audioRef.current.duration;
                  }
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-white/30 text-xs mt-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 曲目网格 */}
      <div className="grid grid-cols-2 gap-2">
        {displayedSongs.map((song, i) => (
          <button
            key={song.name}
            className={`bg-white/5 rounded-xl p-2.5 text-left hover:bg-white/10 transition-colors cursor-pointer ${
              playingIndex === i ? 'ring-1 ring-yellow-400/40' : ''
            }`}
            onClick={() => togglePlay(i)}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm">{song.emoji}</span>
              <span className="text-white text-xs font-medium">{song.name}</span>
              {playingIndex === i && isPlaying && (
                <span className="text-yellow-400 text-xs animate-pulse">♫</span>
              )}
            </div>
            <div className="text-blue-200/50 text-xs leading-tight">{song.desc}</div>
            <div className="text-white/20 text-xs mt-1">{song.city}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
