/**
 * 奖励卡片组件 - 显示通关后的 AI 合照
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import PhotoGallery from './PhotoGallery';
import MusicPlayer from './MusicPlayer';

interface RewardCardProps {
  imageUrl: string;
  cityName: string;
  completedCities?: string[]; // 已完成站点列表
  unlockedPhotos?: number; // 已解锁照片数
  totalStations?: number;
  onShare?: () => void;
  score?: number;
}

export default function RewardCard({
  imageUrl,
  cityName,
  completedCities = [],
  unlockedPhotos = 0,
  totalStations = 5,
  onShare,
  score = 0,
}: RewardCardProps) {
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

  const isAllCompleted = completedCities.length >= totalStations;

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/20 backdrop-blur-md text-center">
      {/* 标题 */}
      <div className="mb-4">
        <span className="text-5xl mb-2 block">
          {isAllCompleted ? '🏆' : '🎉'}
        </span>
        <h2 className="text-2xl font-bold text-white mb-1">
          {isAllCompleted ? '恭喜通关全部站点！' : `恭喜完成 ${cityName} 关卡！`}
        </h2>
        <p className="text-blue-200">
          {isAllCompleted
            ? '你是真正的星光旅行者 ✨'
            : `你的专属星光旅行照 · ${completedCities.length}/${totalStations} 站`}
        </p>
      </div>

      {/* 奖励图片 */}
      {imageUrl && (
        <div className="relative rounded-2xl overflow-hidden mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
      )}

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {imageUrl && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-5 py-2.5 bg-white/20 rounded-xl text-white hover:bg-white/30 disabled:opacity-50 text-sm"
          >
            {downloading ? '下载中...' : '📥 保存图片'}
          </button>
        )}
        {onShare && (
          <button
            onClick={onShare}
            className="px-5 py-2.5 bg-white/20 rounded-xl text-white hover:bg-white/30 text-sm"
          >
            📤 分享
          </button>
        )}
        <Link
          href="/"
          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-bold hover:from-blue-600 hover:to-purple-600 text-sm"
        >
          🗺️ 返回地图
        </Link>
      </div>

      {/* 周深音乐欣赏区（完整模式） */}
      <MusicPlayer compact={false} />

      {/* 照片墙（渐进解锁体系） */}
      <div className="mt-4">
        <PhotoGallery
          unlockedCount={unlockedPhotos}
          totalStations={totalStations}
        />
      </div>

      {/* 激励文案 */}
      {completedCities.length < totalStations && (
        <div className="mt-4 bg-yellow-400/10 rounded-xl p-3 border border-yellow-400/20">
          <p className="text-yellow-400/90 text-sm font-medium">
            🌟 继续闯关！完成 {totalStations - completedCities.length} 站即可解锁全部 {totalStations + 1} 张星光照片！
          </p>
        </div>
      )}
    </div>
  );
}
