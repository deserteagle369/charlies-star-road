/**
 * 照片墙组件 - 渐进解锁体系
 * 初始解锁1张，每完成一站增加1张，5站集齐"全家福"
 * 使用本地写真照片（豆瓣公开素材）
 */
'use client';

import { useState } from 'react';

interface PhotoGalleryProps {
  unlockedCount: number; // 0-5 已解锁照片数
  totalStations?: number; // 总站点数，默认5
}

// 周深写真照片 - 按解锁顺序排列
const ZHOUSHEN_PHOTOS = [
  {
    src: '/photos/photo01.jpg',
    label: '起点 · 初次相遇',
    caption: '第1站完成',
  },
  {
    src: '/photos/photo02.jpg',
    label: '第2站 · 继续前行',
    caption: '第2站完成',
  },
  {
    src: '/photos/photo03.jpg',
    label: '第3站 · 渐入佳境',
    caption: '第3站完成',
  },
  {
    src: '/photos/photo04.jpg',
    label: '第4站 · 即将抵达',
    caption: '第4站完成',
  },
  {
    src: '/photos/photo05.jpg',
    label: '终点 · 星光全家福',
    caption: '全部站点完成！',
  },
];

export default function PhotoGallery({ unlockedCount, totalStations = 5 }: PhotoGalleryProps) {
  const [lightboxPhoto, setLightboxPhoto] = useState<number | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  // unlockedCount=0 → 只有第一张可见（入口）
  // unlockedCount=1 → 第1,2张可见...
  // unlockedCount=5 → 全部可见
  const visibleCount = Math.min(Math.max(unlockedCount, 0) + 1, totalStations + 1);

  return (
    <>
      <div className="w-full bg-white/5 rounded-2xl border border-pink-400/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📸</span>
            <span className="text-pink-400 font-semibold text-sm">星光相册</span>
          </div>
          <span className="text-xs text-blue-200/60">
            {Math.max(0, unlockedCount)}/{totalStations} 站已解锁
          </span>
        </div>

        {/* 进度条 */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden flex">
            {Array.from({ length: totalStations }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 transition-all duration-500 ${
                  i < unlockedCount ? 'bg-gradient-to-r from-pink-400 to-red-400' : 'bg-white/10'
                } ${i > 0 ? 'border-l border-black/20' : ''}`}
              />
            ))}
          </div>
          <span className="text-yellow-400 text-xs font-medium">
            {unlockedCount >= totalStations ? '🏆' : '🔒'}
          </span>
        </div>

        {/* 照片网格 */}
        <div className="grid grid-cols-5 gap-2">
          {ZHOUSHEN_PHOTOS.slice(0, visibleCount).map((photo, i) => {
            const isLocked = i > unlockedCount;
            return (
              <div
                key={i}
                className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                  isLocked
                    ? 'opacity-30'
                    : 'hover:scale-105 hover:ring-2 hover:ring-yellow-400/50'
                }`}
                onClick={() => !isLocked && setLightboxPhoto(i)}
                title={isLocked ? `完成第${i + 1}站后解锁` : photo.label}
              >
                {imgErrors[i] ? (
                  <div className="w-full h-full bg-gradient-to-br from-pink-400/30 to-purple-400/30 flex items-center justify-center text-2xl">
                    🎤
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.src}
                    alt={photo.label}
                    className="w-full h-full object-cover"
                    onError={() => setImgErrors((prev) => ({ ...prev, [i]: true }))}
                  />
                )}

                {/* 解锁状态标记 */}
                {isLocked ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-white/60 text-lg">🔒</span>
                  </div>
                ) : (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                    <div className="text-white/90 text-xs text-center truncate px-0.5">
                      {photo.caption}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 提示语 */}
        {unlockedCount === 0 && (
          <p className="text-center text-blue-200/40 text-xs mt-2">
            完成第一站，解锁第2张照片 ✨
          </p>
        )}
        {unlockedCount > 0 && unlockedCount < totalStations && (
          <p className="text-center text-yellow-400/60 text-xs mt-2">
            再完成 {totalStations - unlockedCount} 站，集齐全部 {totalStations} 张照片 🏆
          </p>
        )}
        {unlockedCount >= totalStations && (
          <p className="text-center text-yellow-400 font-medium text-xs mt-2">
            🎉 恭喜集齐全部照片！你是真正的星光旅行者！
          </p>
        )}
      </div>

      {/* Lightbox 查看大图 */}
      {lightboxPhoto !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            {!imgErrors[lightboxPhoto] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ZHOUSHEN_PHOTOS[lightboxPhoto]?.src}
                alt={ZHOUSHEN_PHOTOS[lightboxPhoto]?.label}
                className="w-full rounded-2xl shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full aspect-square bg-gradient-to-br from-pink-400/30 to-purple-400/30 rounded-2xl flex items-center justify-center text-6xl">
                🎤
              </div>
            )}
            <div className="text-center mt-3">
              <p className="text-white font-medium">
                {ZHOUSHEN_PHOTOS[lightboxPhoto]?.label}
              </p>
              <p className="text-blue-200/60 text-sm">
                {ZHOUSHEN_PHOTOS[lightboxPhoto]?.caption}
              </p>
            </div>
            <button
              className="mt-3 w-full py-2 bg-white/10 rounded-xl text-white/80 text-sm hover:bg-white/20"
              onClick={() => setLightboxPhoto(null)}
            >
              点击任意处关闭
            </button>
          </div>
        </div>
      )}
    </>
  );
}
