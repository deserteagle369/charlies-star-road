/**
 * 学习内容生成 API
 * 根据题目生成短文、词汇、解释
 * POST /api/learning-content
 */
import { NextRequest, NextResponse } from 'next/server';

const CITY_LEARNING_CONTEXT: Record<string, string> = {
  shanghai: 'Shanghai is China\'s largest city and global financial hub. The Bund showcases colonial architecture along the Huangpu River. Yu Garden offers classical Chinese landscaping. Local specialties include xiaolongbao and Shengjian bao.',
  london: 'London is the capital of the United Kingdom. Big Ben and the Houses of Parliament stand beside the Thames. Buckingham Palace is the royal residence. Double-decker buses and red phone booths are iconic symbols.',
  paris: 'Paris is the capital of France, known as the City of Light. The Eiffel Tower was built for the 1889 World\'s Fair. The Louvre houses the Mona Lisa. French cuisine and fashion are world-renowned.',
  newyork: 'New York City is America\'s largest city. Times Square glows with bright neon signs. Central Park provides green space in Manhattan. The Statue of Liberty welcomes immigrants to Ellis Island.',
  tokyo: 'Tokyo is Japan\'s capital, blending ultra-modern and traditional. Senso-ji Temple is Tokyo\'s oldest temple. Shibuya Crossing handles thousands of pedestrians at once. Japanese cuisine ranges from sushi to ramen.',
};

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { city = 'shanghai', question, hint } = await req.json();

    const cityContext = CITY_LEARNING_CONTEXT[city] || CITY_LEARNING_CONTEXT.shanghai;

    const prompt = `You are an English learning assistant. Generate learning content for this vocabulary question:
"${question}"
Hint: ${hint || 'No hint available'}

Generate a JSON object with:
- "title": Short engaging title for the reading passage (MUST be in Chinese/中文)
- "passage": A short English paragraph (80-120 words) about the topic, using simple vocabulary
- "vocabulary": Array of key words [{"word": "evening", "meaning": "夜晚，指下午6点到午夜之间的时间"}], each with English word and Chinese meaning (meaning MUST be in Chinese/中文)
- "tip": One helpful learning tip (MUST be in Chinese/中文)

IMPORTANT: All Chinese text (title, meaning, tip) MUST be proper Chinese characters, NOT garbled text or random symbols.
The passage should help learners understand the answer naturally. Make the vocabulary relevant to the question topic.
Output ONLY raw JSON, no markdown, no explanation.`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + (process.env.GROQ_API_KEY || ''),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a friendly English teacher. Always output valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq API error:', errText);
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
    }

    const groqData = await groqRes.json();
    const content = groqData.choices?.[0]?.message?.content?.trim() || '';

    // 解析 JSON
    let data;
    try {
      const jsonStr = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      data = JSON.parse(jsonStr);
    } catch {
      // Fallback 内容 - 确保中文正确
      data = {
        title: '上海夜生活',
        passage: 'Shanghai comes alive at night. The Bund glows with city lights. People love to explore the evening scene along the Huangpu River. Night markets offer delicious street food. Many visitors enjoy the vibrant nightlife in Puxi and Pudong. The Oriental Pearl Tower sparkles after dark. Evening walks along the river are very popular.',
        vocabulary: [
          { word: 'coast', meaning: '海岸，海滨' },
          { word: 'destination', meaning: '目的地，旅游胜地' },
          { word: 'tourist', meaning: '游客，观光客' },
          { word: 'nightlife', meaning: '夜生活' },
        ],
        tip: '记忆技巧：coast 和 coast line（海岸线）常一起使用，记住 "on the coast" 表示"在海岸线上"。',
      };
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Learning content API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}