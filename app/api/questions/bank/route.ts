/**
 * 题库管理 API
 * GET    /api/questions/bank?module=1&unit=1&status=pending  - 查询题目列表
 * POST   /api/questions/bank                                  - 创建/批量生成题目
 * PUT    /api/questions/bank?id=xxx                           - 更新题目（审核/编辑）
 * DELETE /api/questions/bank?id=xxx                           - 删除题目
 */
import { NextRequest, NextResponse } from 'next/server';

// 使用 publishable key 的客户端（开发阶段，RLS未启用）
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/** 查询题库 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleNum = searchParams.get('module');
    const unitNum = searchParams.get('unit');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '50'), 100);

    let query = supabase
      .from('question_banks')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (moduleNum) query = query.eq('module_num', parseInt(moduleNum));
    if (unitNum) query = query.eq('unit_num', parseInt(unitNum));
    if (status) query = query.eq('status', status);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, count, error } = await query.range(from, to);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      questions: data || [],
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error: unknown) {
    console.error('Questions bank GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** 创建/批量生成题目 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, questions, module_num, unit_num, unit_name, knowledge_point } = body;

    // 批量插入模式：直接传入题目数组
    if (action === 'batch_insert' && Array.isArray(questions)) {
      const rows = questions.map((q: Record<string, string>) => ({
        module_num: q.module_num || module_num,
        unit_num: q.unit_num || unit_num,
        unit_name: q.unit_name || unit_name || '',
        knowledge_point: q.knowledge_point || knowledge_point || '',
        question: q.question,
        answer: q.answer,
        hint: q.hint || '',
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'easy',
        status: 'pending',
      }));

      const { data, error } = await supabase.from('question_banks').insert(rows).select();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ questions: data, count: data?.length || 0 });
    }

    // AI生成模式：调用AI按单元批量出题
    if (action === 'ai_generate') {
      const generated = await generateByAI(module_num, unit_num, unit_name, body.count || 10);
      if (!generated.length) {
        return NextResponse.json({ error: 'AI生成失败' }, { status: 502 });
      }

      const rows = generated.map(q => ({
        module_num,
        unit_num,
        unit_name: unit_name || '',
        knowledge_point: q.knowledge_point || '',
        question: q.question,
        answer: q.answer,
        hint: q.hint || '',
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'easy',
        status: 'pending',
      }));

      const { data, error } = await supabase.from('question_banks').insert(rows).select();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ questions: data, count: data?.length || 0 });
    }

    // 单条创建
    const { data, error } = await supabase.from('question_banks').insert({
      module_num: body.module_num,
      unit_num: body.unit_num,
      unit_name: body.unit_name || '',
      knowledge_point: body.knowledge_point || '',
      question: body.question,
      answer: body.answer,
      hint: body.hint || '',
      explanation: body.explanation || '',
      difficulty: body.difficulty || 'easy',
      status: 'pending',
    }).select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ question: data?.[0] });
  } catch (error: unknown) {
    console.error('Questions bank POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** 更新题目（审核/编辑） */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, question, answer, hint, explanation, difficulty, is_active } = body;

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status !== undefined) updateFields.status = status;
    if (question !== undefined) updateFields.question = question;
    if (answer !== undefined) updateFields.answer = answer;
    if (hint !== undefined) updateFields.hint = hint;
    if (explanation !== undefined) updateFields.explanation = explanation;
    if (difficulty !== undefined) updateFields.difficulty = difficulty;
    if (is_active !== undefined) updateFields.is_active = is_active;

    const { data, error } = await supabase
      .from('question_banks')
      .update(updateFields)
      .eq('id', id)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ question: data?.[0] });
  } catch (error: unknown) {
    console.error('Questions bank PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** 删除题目 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { error } = await supabase.from('question_banks').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Questions bank DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * 调用AI按单元生成填空题
 * 基于四年级下册英语教材内容
 */
async function generateByAI(
  moduleNum: number,
  unitNum: number,
  unitName: string,
  count: number
): Promise<Array<Record<string, string>>> {
  const UNIT_CONTEXTS: Record<string, string> = {
    '1-1': 'Unit 1: What can you smell and taste? Vocabulary: watermelon, grape, plum, cherry, strawberry, apple, peach, sweet, sour, bitter. Grammar: Is it... or...?, It\'s..., How does it taste?',
    '1-2': 'Unit 2: How does it feel? Vocabulary: hard, soft, rough, smooth, sharp, blunt, thick, thin. Grammar: How does it feel? It\'s...',
    '1-3': 'Unit 3: Look at the shadow! Vocabulary: hill, lawn, path, bench, shadow, sun, rise, high, at noon, go down. Grammar: prepositions (in, on, behind, beside), simple present tense.',
    '2-1': 'Unit 4: Sports. Vocabulary: play football, play table tennis, play volleyball, play badminton, play basketball, sport, poster, join, club. Grammar: Would you like to...?, Yes/No questions with Does.',
    '2-2': 'Unit 5: Cute animals. Vocabulary: bone, cat food, dog food, fish, parrot, tortoise, cute. Grammar: Wh-question: What does... (do)?, present continuous tense.',
    '2-3': 'Unit 6: Home life. Vocabulary: bedroom, living room, bathroom, kitchen, homework, model plane, wash, dinner. Grammar: Where are you... (doing)?, imperatives.',
    '3-1': 'Unit 7: Sounds. Vocabulary: quiet, loud, bell, television(TV), sound, noisy, ring, watch TV. Grammar: Yes/No question: Is/Are... (doing)?, There be.',
    '3-2': 'Unit 8: Time. Vocabulary: What time is it?, It\'s so much fun., It\'s time for..., All right., time expressions (seven o\'clock, a quarter past seven, half past seven, a quarter to eight). Grammar: Wh-questions: What time is it?, conjunctions: but, and.',
    '3-3': 'Unit 9: Days of the week. Vocabulary: always, usually, often, sometimes, never, Monday-Sunday, Chinese chess, at weekends. Grammar: frequency adverbs, simple present tense.',
    '4-1': 'Unit 10: A Music class. Vocabulary: piano, violin, triangle, drum, music. Grammar: Wh-questions: What can you play? Whose ... is it? Where\'s ...?',
    '4-2': 'Unit 11: Festivals in China. Vocabulary: the Spring Festival, the Dragon Boat Festival, the Mid-autumn Festival, the Double Ninth Festival, festival, rice dumpling. Grammar: frequency adverbs, present continuous tense, verb \'have\'.',
    '4-3': 'Unit 12: Story time. Vocabulary: duckling, swan, nest. Grammar: story narrative.',
  };

  const key = `${moduleNum}-${unitNum}`;
  const context = UNIT_CONTEXTS[key] || `Module ${moduleNum} Unit ${unitNum}: ${unitName}`;

  const prompt = `You are an expert English teacher for Grade 4 students (Shanghai Oxford Edition).
Based on the following unit context, generate ${count} fill-in-the-blank questions.

Context: ${context}

Requirements:
1. Each question tests vocabulary or grammar from this unit
2. One blank per question
3. Answer is a single word or short phrase suitable for Grade 4
4. Include helpful hints for students
5. Questions should be practical and related to daily life

Output ONLY raw JSON array:
[{"question":"The ___ Tower is Shanghai's iconic landmark.","answer":"Oriental","hint":"Starts with O","explanation":"Oriental Pearl Tower","knowledge_point":"vocabulary","difficulty":"easy"}]`;

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
          { role: 'user', content: `Generate ${count} questions for Module ${moduleNum} Unit ${unitNum}: ${unitName}` },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!groqRes.ok) {
      console.error('Groq API error:', await groqRes.text());
      return [];
    }

    const groqData = await groqRes.json();
    const content = groqData.choices?.[0]?.message?.content?.trim() || '';

    let parsed;
    try {
      const jsonStr = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      // 尝试提取JSON数组
      const match = content.match(/\[[\s\S]*?\]/);
      if (match) parsed = JSON.parse(match[0]);
      else return [];
    }

    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (err) {
    console.error('AI generation error:', err);
    return [];
  }
}