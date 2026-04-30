/**
 * GET  /api/missions - 获取当前用户闯关进度
 * POST /api/missions - 创建或初始化用户进度（新用户第一关）
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET: 获取用户进度
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('missions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // 如果没有记录，返回默认初始状态
    if (!data) {
      return NextResponse.json({
        current_city: 'shanghai',
        completed_cities: [],
        total_score: 0,
        unlocked_photos: 0,
      });
    }

    return NextResponse.json({
      current_city: data.current_city,
      completed_cities: data.completed_cities,
      total_score: data.total_score,
      unlocked_photos: data.unlocked_photos,
    });
  } catch (err) {
    console.error('GET /api/missions error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: 创建/初始化用户进度
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    // upsert 进度记录
    const { data, error } = await supabaseAdmin
      .from('missions')
      .upsert(
        {
          user_id: userId,
          current_city: body.current_city || 'shanghai',
          completed_cities: body.completed_cities || [],
          total_score: body.total_score || 0,
          unlocked_photos: body.unlocked_photos || 0,
          last_played_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
      return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
    }

    return NextResponse.json({ success: true, mission: data });
  } catch (err) {
    console.error('POST /api/missions error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
