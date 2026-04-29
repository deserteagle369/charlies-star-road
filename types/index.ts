/** 题目数据结构 */
export interface Question {
  question: string;
  answer: string;
  hint?: string;
}

/** 用户资料 */
export interface Profile {
  id: string;
  username: string;
  level: number;
  total_stars: number;
  created_at: string;
}

/** 关卡任务 */
export interface Mission {
  id: string;
  user_id: string;
  unit_name: string;
  is_completed: boolean;
  reward_image_url: string | null;
  completed_at: string | null;
  created_at: string;
}

/** 每日星光卡 */
export interface DailyCard {
  id: string;
  user_id: string;
  card_day: number;
  message: string;
  image_url: string | null;
  created_at: string;
}

/** API 出题请求 */
export interface GenerateQuestionsRequest {
  city: string;
  difficulty: string;
  count?: number;
}

/** API 出题响应 */
export interface GenerateQuestionsResponse {
  questions: Question[];
}

/** API 合照生成请求 */
export interface GenerateRewardRequest {
  photoBase64: string;
  city: string;
  username: string;
}

/** API 合照生成响应 */
export interface GenerateRewardResponse {
  imageUrl: string;
}
