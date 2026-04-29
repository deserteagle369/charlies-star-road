/**
 * 游戏布局 - 带星空背景
 */
import StarBackground from '@/components/layout/StarBackground';

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <StarBackground />
      <div className="relative z-10">{children}</div>
    </main>
  );
}
