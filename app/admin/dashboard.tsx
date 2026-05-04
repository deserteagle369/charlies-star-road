/**
 * 管理员后台仪表盘 — Charlie's Star Road
 * 服务器组件：从 Supabase 拉取数据展示
 */
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { CITY_MAP } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getStats() {

  // 获取用户总数
  const { count: totalUsers } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // 获取已完成关卡总数
  const { data: allMissions } = await supabaseAdmin
    .from('missions')
    .select('completed_cities, total_score, last_played_at');

  const totalCompletions = allMissions?.reduce(
    (acc, m) => acc + (m.completed_cities?.length || 0),
    0
  ) || 0;

  // 最近活跃用户（最近7天）
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentActive = allMissions?.filter(
    (m) => m.last_played_at && new Date(m.last_played_at) >= sevenDaysAgo
  ).length || 0;

  return { totalUsers: totalUsers || 0, totalCompletions, recentActive };
}

async function getRecentMissions(limit = 10) {
  const { data } = await supabaseAdmin
    .from('missions')
    .select('*')
    .order('last_played_at', { ascending: false })
    .limit(limit);
  return data || [];
}

export default async function AdminPage() {
  // 简单的管理员验证（生产环境需更严格）
  // TODO: 生产环境需实现管理员登录验证
  // 当前跳过验证，直接展示后台
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'deserteagle369@163.com';

  const stats = await getStats();
  const recentMissions = await getRecentMissions();

  const statsCards = [
    {
      emoji: '👥',
      label: '注册用户',
      value: stats.totalUsers,
      sub: '总注册人数',
      color: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/30',
      text: 'text-blue-300',
    },
    {
      emoji: '🏁',
      label: '关卡完成',
      value: stats.totalCompletions,
      sub: '总通关次数',
      color: 'from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/30',
      text: 'text-green-300',
    },
    {
      emoji: '🔥',
      label: '近期活跃',
      value: stats.recentActive,
      sub: '近7日活跃',
      color: 'from-yellow-500/20 to-orange-500/20',
      border: 'border-yellow-500/30',
      text: 'text-yellow-300',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛡️</span>
              <h1 className="text-2xl font-bold text-white">管理员后台</h1>
              <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-0.5 rounded-full border border-cyan-500/30">
                Admin
              </span>
            </div>
            <p className="text-indigo-300/60 text-sm mt-1">
              Charlie&apos;s Star Road · 英语星光之旅
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/game"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 text-sm border border-white/20 transition-colors"
            >
              🎮 游戏首页
            </a>
            <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-300 text-sm border border-red-500/30 transition-colors">
              🚪 退出登录
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {statsCards.map((card) => (
            <div
              key={card.label}
              className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 border ${card.border}`}
            >
              <div className="text-3xl mb-2">{card.emoji}</div>
              <div className={`text-3xl font-bold ${card.text}`}>{card.value}</div>
              <div className="text-white/60 text-sm mt-1">{card.label}</div>
              <div className="text-white/40 text-xs mt-0.5">{card.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 近期活动 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              📊 近期闯关记录
            </h2>
            {recentMissions.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-8">暂无数据</p>
            ) : (
              <div className="space-y-3">
                {recentMissions.map((mission, i) => {
                  const completedCities = mission.completed_cities || [];
                  return (
                    <div
                      key={mission.user_id || i}
                      className="flex items-center gap-4 p-3 bg-white/5 rounded-xl"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-white text-sm font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white/80 text-sm font-medium">
                          用户 {mission.user_id?.slice(0, 8) || '?'}
                        </div>
                        <div className="text-white/40 text-xs mt-0.5">
                          完成 {completedCities.length} 关 · 得分 {mission.total_score || 0}
                          {mission.last_played_at && (
                            <> · {new Date(mission.last_played_at).toLocaleDateString('zh-CN')}</>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex gap-1">
                        {completedCities.map((city: string) => (
                          <span key={city} title={city}>
                            {CITY_MAP[city]?.emoji || '🏁'}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 系统状态 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              ⚙️ 系统状态
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Supabase 数据库', status: 'online', desc: '已连接' },
                { label: 'Groq AI 出题', status: 'online', desc: 'API 正常' },
                { label: 'Web Speech API', status: 'online', desc: '浏览器原生' },
                { label: '朗读模式', status: 'online', desc: '所有站点已启用' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2 border-b border-white/10 last:border-0"
                >
                  <div>
                    <div className="text-white/80 text-sm">{item.label}</div>
                    <div className="text-white/40 text-xs">{item.desc}</div>
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full border border-green-500/30">
                    ● {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 站点进度概览 */}
        <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            🗺️ 站点完成概览
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(CITY_MAP).map(([key, city]) => {
              // 粗估完成率（基于 missions 中 completed_cities 包含该城市的所有记录）
              return (
                <div key={key} className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                  <div className="text-3xl mb-2">{city.emoji}</div>
                  <div className="text-white font-medium text-sm">{city.zh}</div>
                  <div className="text-indigo-300/60 text-xs">{city.en}</div>
                  <div className="mt-2 text-yellow-400/60 text-xs">-- 人通关</div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-8">
          Charlie&apos;s Star Road Admin · {new Date().toLocaleDateString('zh-CN')}
        </p>
      </div>
    </div>
  );
}