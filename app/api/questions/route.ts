/**
 * 生成 AI 出题 API
 * POST /api/questions
 * Body: { city: string, difficulty: string, count?: number }
 */
import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';

const CITY_PROMPTS: Record<string, string> = {
  shanghai: '上海 (Shanghai) - 中国金融中心，有外滩、东方明珠、豫园等景点',
  london: '伦敦 (London) - 英国首都，有大本钟、白金汉宫、塔桥等',
  paris: '巴黎 (Paris) - 法国首都，有埃菲尔铁塔、卢浮宫、凯旋门等',
  newyork: '纽约 (New York) - 美国城市，有自由女神像、时代广场、中央公园等',
  tokyo: '东京 (Tokyo) - 日本首都，有浅草寺、涩谷十字路口、东京塔等',
};

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { city = 'shanghai', difficulty = 'easy', count = 5 } = await req.json();

    const cityInfo = CITY_PROMPTS[city] || CITY_PROMPTS.shanghai;

    const messages = [
      {
        role: 'system' as const,
        content: `你是一位英语教育专家，擅长设计填空题。
请根据给定的城市信息和难度，生成英语填空题。
要求：
1. 每题一个空，考察词汇、语法或短语
2. 题目与该城市的历史、文化、旅游相关
3. 答案唯一，语法正确
4. 题目为英文，答案可以是单词或短语
5. 只返回纯 JSON，不要任何其他文字

输出格式：
{
  "questions": [
    {
      "question": "The ___ Tower is Shanghai's iconic landmark. (答案: Oriental)",
      "hint": "提示：O开头的形容词"
    }
  ]
}`,
      },
      {
        role: 'user' as const,
        content: `城市：${cityInfo}\n难度：${difficulty}\n数量：${count} 道题`,
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.8,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content?.trim() || '';

    // 尝试解析 JSON
    let questions;
    try {
      // 去掉可能的 markdown 代码块标记
      const jsonStr = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(jsonStr);
      questions = parsed.questions || [];
    } catch {
      // 解析失败，尝试正则提取
      const match = content.match(/"question"\s*:\s*"([^"]+)"/g);
      if (match) {
        questions = match.map(m => ({
          question: m.match(/"question"\s*:\s*"([^"]+)"/)?.[1] || m,
          hint: '',
        }));
      }
      if (!questions || questions.length === 0) {
        return NextResponse.json({ error: 'Failed to parse questions', raw: content }, { status: 500 });
      }
    }

    return NextResponse.json({ questions });
  } catch (error: unknown) {
    console.error('Questions API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
