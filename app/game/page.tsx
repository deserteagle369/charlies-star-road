/**
 * 首页 - 世界地图关卡选择
 */
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import WorldMap from '@/components/game/WorldMap';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get completed missions
  const { data: missions } = await supabase
    .from('missions')
    .select('unit_name')
    .eq('user_id', user.id)
    .eq('is_completed', true);

  const username = profile?.username ?? 'Explorer';
  const completedCities = (missions ?? []).map((m: { unit_name: string }) => m.unit_name);

  return <WorldMap completedCities={completedCities} username={username} />;
}
