import { cn } from '@/lib/utils';

export function UnitToggle({
  unit,
  onChange,
  className,
}: {
  unit: 'g' | 'kg';
  onChange: (u: 'g' | 'kg') => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex shrink-0 overflow-hidden rounded-md border border-input',
        className,
      )}
      role="group"
      aria-label="Weight unit"
    >
      {(['g', 'kg'] as const).map((u, i) => (
        <button
          key={u}
          type="button"
          onClick={() => onChange(u)}
          aria-pressed={unit === u}
          className={cn(
            'px-2 py-1 text-xs font-medium transition-colors',
            i > 0 && 'border-l border-input',
            unit === u
              ? 'bg-foreground text-background'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          {u}
        </button>
      ))}
    </div>
  );
}
