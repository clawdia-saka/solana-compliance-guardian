import { Badge } from '@/components/ui/badge';
import { AuditStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: AuditStatus;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/50',
    icon: Loader2,
  },
  complete: {
    label: 'Complete',
    className: 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/50',
    icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50',
    icon: XCircle,
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge className={cn(config.className, 'text-white flex items-center gap-1', className)}>
      <Icon className={cn('w-3 h-3', status === 'pending' && 'animate-spin')} />
      {config.label}
    </Badge>
  );
}
