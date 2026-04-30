/**
 * 奖励卡片组件 - 显示通关后的 AI 合照
 */
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface RewardCardProps {
  imageUrl: string;
  cityName: string;
  onShare?: () => void;
  score?: number;
}

// 周深推荐歌曲列表
const ZHOUSHEN_SONGS = [
  { name: '大鱼', desc: '电影《大鱼海棠》主题曲，空灵高音', emoji: '🐟' },
  { name: '起风了', desc: '全网刷屏，治愈无数心灵', emoji: '🌬️' },
  { name: '光亮', desc: '北京冬奥优秀作品，惊艳世界', emoji: '🏅' },
  { name: 'Rubbish', desc: '全英文创作，展现实力', emoji: '🇬🇧' },
];

export default function RewardCard({ imageUrl, cityName, onShare, score = 0 }: RewardCardProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `charlie-star-road-${cityName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
    setDownloading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/20 backdrop-blur-md text-center">
      {/* 标题 */}
      <div className="mb-4">
        <span className="text-5xl mb-2 block">🎉</span>
        <h2 className="text-2xl font-bold text-white mb-1">恭喜完成 {cityName} 关卡！</h2>
        <p className="text-blue-200">你的专属星光旅行照 ✨</p>
      </div>

      {/* 奖励图片 */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <img
          src={imageUrl}
          alt={`${cityName} reward`}
          className="w-full aspect-square object-cover"
        />
        {/* 水印 */}
        <div className="absolute bottom-2 right-2 text-xs text-white/60 bg-black/30 px-2 py-1 rounded">
          Charlie's Star Road 🌟
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-5 py-2.5 bg-white/20 rounded-xl text-white hover:bg-white/30 disabled:opacity-50"
        >
          {downloading ? '下载中...' : '📥 保存图片'}
        </button>
        {onShare && (
          <button
            onClick={onShare}
            className="px-5 py-2.5 bg-white/20 rounded-xl text-white hover:bg-white/30"
          >
            📤 分享
          </button>
        )}
        <Link
          href="/"
          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-bold hover:from-blue-600 hover:to-purple-600"
        >
          🗺️ 返回地图
        </Link>
      </div>

      {/* 周深音乐欣赏区 */}
      <div className="w-full max-w-md mx-auto mt-6 bg-white/5 rounded-2xl border border-yellow-400/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎵</span>
          <span className="text-yellow-400 font-semibold text-sm">周深推荐曲目</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ZHOUSHEN_SONGS.map((song) => (
            <div
              key={song.name}
              className="bg-white/5 rounded-xl p-2.5 text-left hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm">{song.emoji}</span>
                <span className="text-white text-xs font-medium">{song.name}</span>
              </div>
              <div className="text-blue-200/50 text-xs leading-tight">{song.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 图片欣赏区 */}
      <div className="w-full max-w-md mx-auto mt-4 bg-white/5 rounded-2xl border border-pink-400/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📸</span>
          <span className="text-pink-400 font-semibold text-sm">周深照片墙</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {['🎤', '🌟', '🎶', '✨', '🎵', '🌙', '💫', '🎭'].map((emoji, i) => (
            <div
              key={i}
              className="aspect-square bg-white/5 rounded-lg flex items-center justify-center text-2xl hover:bg-white/10 transition-colors cursor-pointer"
              title={`周深精彩瞬间 ${i + 1}`}
            >
              {emoji}
            </div>
          ))}
        </div>
        <p className="text-center text-blue-200/40 text-xs mt-2">点击可查看大图（可替换为真实照片）</p>
      </div>
    </div>
  );
}
