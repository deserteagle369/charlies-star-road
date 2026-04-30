/**
 * POST /api/complete-city - 用户完成一关后调用，解锁下一站和照片
 * Body: { city: string, score: number }
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { CITY_ORDER } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { city, score = 0 } = await req.json();

    // 查找当前关卡的索引
    const cityIndex = CITY_ORDER.indexOf(city);
    if (cityIndex === -1) {
      return NextResponse.json({ error: 'Invalid city' }, { status: 400 });
    }

    // 获取当前进度
    const { data: current } = await supabaseAdmin
      .from('missions')
      .select('*')
      .eq('user_id', userId)
      .single();

    const completedCities: string[] = current?.completed_cities || [];
    const totalScore: number = current?.total_score || 0;

    // 如果该城市已通关，跳过
    if (completedCities.includes(city)) {
      return NextResponse.json({
        message: 'City already completed',
        completed_cities: completedCities,
        next_city: CITY_ORDER[cityIndex + 1] || null,
        unlocked_photos: completedCities.length,
      });
    }

    // 添加到已完成列表
    const newCompletedCities = [...completedCities, city];
    const newTotalScore = totalScore + score;
    const newUnlockedPhotos = newCompletedCities.length;

    // 确定下一站
    const nextCity = CITY_ORDER[cityIndex + 1] || null;

    // 更新数据库
    const { data, error } = await supabaseAdmin
      .from('missions')
      .upsert(
        {
          user_id: userId,
          current_city: nextCity || city,
          completed_cities: newCompletedCities,
          total_score: newTotalScore,
          unlocked_photos: newUnlockedPhotos,
          last_played_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('complete-city error:', error);
      return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      completed_cities: newCompletedCities,
      next_city: nextCity,
      unlocked_photos: newUnlockedPhotos,
      total_score: newTotalScore,
      is_final: nextCity === null, // 是否通关全部站点
    });
  } catch (err) {
    console.error('POST /api/complete-city error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
