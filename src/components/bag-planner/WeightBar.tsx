import { useDisplayUnit } from '@/hooks/use-display-unit';

export function WeightBar({ current, limit }: { current: number; limit?: number }) {
  const { format } = useDisplayUnit();
  const pct = limit ? Math.min(100, (current / limit) * 100) : 0;
  const over = limit ? current > limit : false;
  const near = limit ? current / limit > 0.85 : false;

  const color = over
    ? 'bg-destructive'
    : near
      ? 'bg-amber-500'
      : 'bg-primary';

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-foreground tabular-nums">
          {format(current)}
        </span>
        {limit ? (
          <span className={over ? 'text-destructive' : 'text-muted-foreground'}>
            / {format(limit)}
          </span>
        ) : (
          <span className="text-muted-foreground">no limit</span>
        )}
      </div>
      {limit ? (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
