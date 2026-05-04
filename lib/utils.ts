/**
 * 通用工具函数
 */

/** 教材单元定义（四年级下册英语 - 牛津上海版） */
export interface UnitDef {
  module_num: number;
  unit_num: number;
  name: string;
  name_zh: string;
  emoji: string;
  pages: string;
}

/** 所有单元（按顺序） */
export const ALL_UNITS: UnitDef[] = [
  // Module 1: Using my five senses
  { module_num: 1, unit_num: 1, name: 'What can you smell and taste?',   name_zh: '闻一闻，尝一尝', emoji: '🍓', pages: '2-6' },
  { module_num: 1, unit_num: 2, name: 'How does it feel?',               name_zh: '摸一摸',         emoji: '🤚', pages: '7-11' },
  { module_num: 1, unit_num: 3, name: 'Look at the shadow!',             name_zh: '看影子',         emoji: '🌑', pages: '12-16' },
  // Module 2: My favourite things
  { module_num: 2, unit_num: 1, name: 'Sports',                          name_zh: '运动',           emoji: '⚽', pages: '17-21' },
  { module_num: 2, unit_num: 2, name: 'Cute animals',                    name_zh: '可爱的动物',     emoji: '🐱', pages: '22-26' },
  { module_num: 2, unit_num: 3, name: 'Home life',                       name_zh: '家庭生活',       emoji: '🏠', pages: '27-31' },
  // Module 3: Things around us
  { module_num: 3, unit_num: 1, name: 'Sounds',                          name_zh: '声音',           emoji: '🔔', pages: '32-36' },
  { module_num: 3, unit_num: 2, name: 'Time',                            name_zh: '时间',           emoji: '⏰', pages: '37-41' },
  { module_num: 3, unit_num: 3, name: 'Days of the week',                name_zh: '一周的日子',     emoji: '📅', pages: '42-46' },
  // Module 4: More things to learn
  { module_num: 4, unit_num: 1, name: 'A Music class',                   name_zh: '音乐课',         emoji: '🎵', pages: '47-51' },
  { module_num: 4, unit_num: 2, name: 'Festivals in China',              name_zh: '中国的节日',     emoji: '🏮', pages: '52-56' },
  { module_num: 4, unit_num: 3, name: 'Story time',                      name_zh: '故事时间',       emoji: '📖', pages: '57-61' },
];

/** 城市站点 → 教材单元映射（游戏关卡对应） */
export const CITY_UNIT_MAP: Record<string, UnitDef> = {
  shanghai: ALL_UNITS[0], // M1U1
  london:   ALL_UNITS[1], // M1U2
  paris:    ALL_UNITS[2], // M1U3
  newyork:  ALL_UNITS[3], // M2U1
  tokyo:    ALL_UNITS[4], // M2U2
};

/** 拼音城市名映射（保留原有关卡地图数据） */
export const CITY_MAP: Record<string, { en: string; zh: string; emoji: string; lat: number; lng: number; unlocked: boolean }> = {
  shanghai: { en: 'Shanghai', zh: '上海站', emoji: '🍓', lat: 31.2, lng: 121.5, unlocked: true },
  london:   { en: 'London',   zh: '伦敦站', emoji: '🤚', lat: 51.5, lng: -0.1, unlocked: false },
  paris:    { en: 'Paris',    zh: '巴黎站', emoji: '🌑', lat: 48.9, lng: 2.3, unlocked: false },
  newyork:  { en: 'New York', zh: '纽约站', emoji: '⚽', lat: 40.7, lng: -74.0, unlocked: false },
  tokyo:    { en: 'Tokyo',    zh: '东京站', emoji: '🐱', lat: 35.7, lng: 139.7, unlocked: false },
};

/** 关卡顺序 */
export const CITY_ORDER = ['shanghai', 'london', 'paris', 'newyork', 'tokyo'] as const;

/** 获取关卡主题色 */
export function getCityTheme(cityKey: string): { primary: string; secondary: string; accent: string } {
  const themes: Record<string, { primary: string; secondary: string; accent: string }> = {
    shanghai: { primary: '#1e3a5f', secondary: '#ff6b6b', accent: '#ffd93d' },
    london:   { primary: '#2c3e50', secondary: '#e74c3c', accent: '#f39c12' },
    paris:    { primary: '#8e44ad', secondary: '#e91e63', accent: '#ff5722' },
    newyork:  { primary: '#1a237e', secondary: '#00bcd4', accent: '#ff9800' },
    tokyo:    { primary: '#c62828', secondary: '#ff4081', accent: '#e040fb' },
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