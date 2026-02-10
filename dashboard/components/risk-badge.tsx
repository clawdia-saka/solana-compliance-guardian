import { Badge } from '@/components/ui/badge';
import { RiskLevel } from '@/lib/types';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

const riskConfig = {
  low: { label: 'Low Risk', className: 'bg-green-500 hover:bg-green-600' },
  medium: { label: 'Medium Risk', className: 'bg-yellow-500 hover:bg-yellow-600' },
  high: { label: 'High Risk', className: 'bg-orange-500 hover:bg-orange-600' },
  critical: { label: 'Critical Risk', className: 'bg-red-500 hover:bg-red-600' },
};

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const config = riskConfig[level];
  
  return (
    <Badge className={cn(config.className, 'text-white', className)}>
      {config.label}
    </Badge>
  );
}
