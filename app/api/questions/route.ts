/**
 * 答题 API - 学生端
 * POST /api/questions
 * 优先从题库取已审核题目，题库不足时AI补充生成
 *
 * Body: { module?: number, unit?: number, city?: string, difficulty?: string, count?: number }
 */
import { NextRequest, NextResponse } from 'next/server';

// 使用 publishable key 的客户端
import { supabase } from '@/lib/supabase';

// 城市到单元的映射（游戏关卡 → 教材单元）
const CITY_UNIT_MAP: Record<string, { module: number; unit: number }> = {
  shanghai: { module: 1, unit: 1 },    // 上海站 → M1U1 感官
  london:   { module: 1, unit: 2 },    // 伦敦站 → M1U2 触觉
  paris:    { module: 1, unit: 3 },    // 巴黎站 → M1U3 影子
  newyork:  { module: 2, unit: 1 },    // 纽约站 → M2U1 运动
  tokyo:    { module: 2, unit: 2 },    // 东京站 → M2U2 动物
};

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const city = body.city || 'shanghai';
    const difficulty = body.difficulty || 'easy';
    const count = Math.min(body.count || 5, 20);

    // 确定目标单元
    let targetModule: number | undefined;
    let targetUnit: number | undefined;

    if (body.module && body.unit) {
      targetModule = body.module;
      targetUnit = body.unit;
    } else if (CITY_UNIT_MAP[city]) {
      targetModule = CITY_UNIT_MAP[city].module;
      targetUnit = CITY_UNIT_MAP[city].unit;
    }

    // Step 1: 从题库取已审核的题目
    let questions: Array<Record<string, string>> = [];

    if (targetModule && targetUnit) {
      const { data: bankQuestions, error } = await supabase
        .from('question_banks')
        .select('*')
        .eq('module_num', targetModule)
        .eq('unit_num', targetUnit)
        .eq('status', 'approved')
        .eq('is_active', true);

      if (!error && bankQuestions && bankQuestions.length > 0) {
        // 随机打乱，取指定数量
        const shuffled = bankQuestions.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);
        questions = selected.map((q: Record<string, unknown>) => ({
          question: q.question as string,
          answer: q.answer as string,
          hint: (q.hint as string) || '',
          explanation: (q.explanation as string) || '',
          knowledge_point: (q.knowledge_point as string) || '',
          source: 'bank',
        }));
      }
    }

    // Step 2: 题库不足时——只返回题库已有的题目，不足时返回空列表
    //   学生看到"暂无题目"，管理员需到后台题库添加
    //   AI 备用仅在管理员显式传参 force_ai=true 时触发
    if (questions.length < count) {
      if (body.force_ai === true) {
        const needCount = count - questions.length;
        console.log(`Bank has ${questions.length} questions, force AI generating ${needCount}`);
        const aiQuestions = await generateByAI(
          targetModule || 1,
          targetUnit || 1,
          city,
          difficulty,
          needCount
        );
        questions = [...questions, ...aiQuestions];
      } else {
        // 严格模式：返回题库已有的题目（不充数）
        console.log(`Bank has ${questions.length} questions (need ${count}), returning what we have`);
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

/**
 * AI备用出题（与原逻辑一致）
 */
async function generateByAI(
  _moduleNum: number,
  _unitNum: number,
  city: string,
  difficulty: string,
  count: number
): Promise<Array<Record<string, string>>> {
  const CITY_PROMPTS: Record<string, string> = {
    shanghai: 'Shanghai - China financial center, with Bund, Oriental Pearl Tower, Yu Garden',
    london: 'London - UK capital, with Big Ben, Buckingham Palace, Tower Bridge',
    paris: 'Paris - French capital, with Eiffel Tower, Louvre, Arc de Triomphe',
    newyork: 'New York - American city, with Statue of Liberty, Times Square, Central Park',
    tokyo: 'Tokyo - Japanese capital, with Senso-ji Temple, Shibuya Crossing, Tokyo Tower',
  };

  const DIFFICULTY_MAP: Record<string, string> = {
    easy: 'simple vocabulary, short sentences',
    medium: 'intermediate grammar, common phrases',
    hard: 'advanced vocabulary, idioms and expressions',
  };

  const cityInfo = CITY_PROMPTS[city] || CITY_PROMPTS.shanghai;
  const diffLevel = DIFFICULTY_MAP[difficulty] || DIFFICULTY_MAP.easy;

  const prompt = `You are an English education expert designing fill-in-the-blank questions.
Based on the city info and difficulty below, generate ${count} English fill-in-the-blank questions.
Requirements:
1. One blank per question, test vocabulary, grammar, or phrases
2. Questions related to the city's history, culture, or tourism
3. Unique answer, grammatically correct
4. Question in English, answer is a word or short phrase
5. Output ONLY raw JSON, no markdown, no explanation

Output format:
{"questions":[{"question":"The ___ Tower is Shanghai's iconic landmark.","answer":"Oriental","hint":"Starts with O","explanation":"Oriental Pearl Tower is Shanghai's most famous skyscraper."}]}`;

  const userMsg = `City: ${cityInfo}\nDifficulty: ${diffLevel}\nGenerate ${count} questions`;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + (process.env.GROQ_API_KEY || ''),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: userMsg },
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq API error:', errText);
      return [];
    }

    const groqData = await groqRes.json();
    const content = groqData.choices?.[0]?.message?.content?.trim() || '';

    let parsed;
    try {
      const jsonStr = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      const match = content.match(/"question"\s*:\s*"([^"]+)"/g);
      if (match) {
        parsed = { questions: match.map((m: string) => ({
          question: m.match(/"question"\s*:\s*"([^"]+)"/)?.[1] || m,
          hint: '',
        })) };
      }
      if (!parsed?.questions) return [];
    }

    return parsed.questions.map((q: Record<string, string>) => ({
      ...q,
      hint: q.hint || '',
      explanation: q.explanation || '',
      source: 'ai',
    }));
  } catch (err) {
    console.error('AI generation fallback error:', err);
    return [];
  }
}