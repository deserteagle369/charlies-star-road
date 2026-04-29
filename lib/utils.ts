/**
 * 通用工具函数
 */

/** 拼音城市名映射 */
export const CITY_MAP: Record<string, { en: string; zh: string; emoji: string; lat: number; lng: number; unlocked: boolean }> = {
  shanghai: { en: 'Shanghai', zh: '上海', emoji: '🏙️', lat: 31.2, lng: 121.5, unlocked: true },
  london: { en: 'London', zh: '伦敦', emoji: '🎡', lat: 51.5, lng: -0.1, unlocked: false },
  paris: { en: 'Paris', zh: '巴黎', emoji: '🗼', lat: 48.9, lng: 2.3, unlocked: false },
  newyork: { en: 'New York', zh: '纽约', emoji: '🗽', lat: 40.7, lng: -74.0, unlocked: false },
  tokyo: { en: 'Tokyo', zh: '东京', emoji: '⛩️', lat: 35.7, lng: 139.7, unlocked: false },
};

/** 获取关卡主题色 */
export function getCityTheme(cityKey: string): { primary: string; secondary: string; accent: string } {
  const themes: Record<string, { primary: string; secondary: string; accent: string }> = {
    shanghai: { primary: '#1e3a5f', secondary: '#ff6b6b', accent: '#ffd93d' },
    london: { primary: '#2c3e50', secondary: '#e74c3c', accent: '#f39c12' },
    paris: { primary: '#8e44ad', secondary: '#e91e63', accent: '#ff5722' },
    newyork: { primary: '#1a237e', secondary: '#00bcd4', accent: '#ff9800' },
    tokyo: { primary: '#c62828', secondary: '#ff4081', accent: '#e040fb' },
  };
  return themes[cityKey] || themes.shanghai;
}

/** 播放音效 */
export function playSound(soundType: 'correct' | 'wrong' | 'complete' | 'click'): void {
  const audio = new Audio(`/sounds/${soundType}.mp3`);
  audio.volume = 0.5;
  audio.play().catch(() => {
    // 静默处理自动播放限制
  });
}

/** 格式化日期 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}
