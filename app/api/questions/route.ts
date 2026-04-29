/**
 * 生成 AI 出题 API
 * POST /api/questions
 * Body: { city: string, difficulty: string, count?: number }
 */
import { NextRequest, NextResponse } from 'next/server';

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

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { city = 'shanghai', difficulty = 'easy', count = 5 } = await req.json();

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
{"questions":[{"question":"The ___ Tower is Shanghai's iconic landmark.","answer":"Oriental","hint":"Starts with O"}]}`;

    const userMsg = `City: ${cityInfo}\nDifficulty: ${diffLevel}\nGenerate ${count} questions`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
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
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
    }

    const groqData = await groqRes.json();
    const content = groqData.choices?.[0]?.message?.content?.trim() || '';

    let questions;
    try {
      const jsonStr = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(jsonStr);
      questions = parsed.questions || [];
    } catch {
      const match = content.match(/"question"\s*:\s*"([^"]+)"/g);
      if (match) {
        questions = match.map((m: string) => ({
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
