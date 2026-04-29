/**
 * 进度条组件
 */
interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export default function ProgressBar({ current, total, label = '进度' }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between text-sm text-blue-200 mb-2">
        <span>{label}</span>
        <span>{current} / {total}</span>
      </div>
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-center mt-2">
        <span className="text-yellow-300 text-lg">
          {'⭐'.repeat(Math.min(current, 5))}
          {'☆'.repeat(Math.max(0, 5 - current))}
        </span>
      </div>
    </div>
  );
}
