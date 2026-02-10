import { cn } from '@/lib/utils';

interface RiskScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function RiskScore({ score, size = 'md', showLabel = true }: RiskScoreProps) {
  const getColor = (score: number) => {
    if (score < 30) return 'text-green-500';
    if (score < 60) return 'text-yellow-500';
    if (score < 80) return 'text-orange-500';
    return 'text-red-500';
  };

  const getBarColor = (score: number) => {
    if (score < 30) return 'bg-green-500';
    if (score < 60) return 'bg-yellow-500';
    if (score < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  const barHeights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-baseline gap-2">
          <span className={cn('font-bold', sizeClasses[size], getColor(score))}>
            {score}
          </span>
          <span className="text-muted-foreground text-sm">/ 100</span>
        </div>
      )}
      <div className="w-full bg-secondary rounded-full overflow-hidden">
        <div
          className={cn('transition-all duration-500', barHeights[size], getBarColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
