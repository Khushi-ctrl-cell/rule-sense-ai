import { getSeverityBg, getStatusBg } from '@/data/mockData';

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span className={`status-badge border ${getSeverityBg(severity)}`}>
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge border ${getStatusBg(status)}`}>
      {status}
    </span>
  );
}

export function ConfidenceBadge({ value }: { value: number }) {
  const color = value >= 85 ? 'text-primary' : value >= 65 ? 'text-warning' : 'text-muted-foreground';
  return <span className={`font-mono text-sm font-semibold ${color}`}>{value}%</span>;
}

export function RiskScoreBar({ score }: { score: number }) {
  const color = score > 80 ? 'bg-destructive' : score > 60 ? 'bg-warning' : score > 30 ? 'bg-accent' : 'bg-primary';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="font-mono text-xs font-semibold w-8 text-right">{score}</span>
    </div>
  );
}
