import { DISPLAY_UNITS, useDisplayUnit } from '@/hooks/use-display-unit';
import type { DisplayUnit } from '@/lib/bag-planner/format';

export function DisplayUnitSelect({ className }: { className?: string }) {
  const { unit, setUnit } = useDisplayUnit();
  return (
    <label className={`inline-flex items-center gap-1.5 ${className ?? ''}`}>
      <span className="text-muted-foreground">Units</span>
      <select
        value={unit}
        onChange={(e) => setUnit(e.target.value as DisplayUnit)}
        className="rounded border border-input bg-background px-1.5 py-0.5 text-xs text-foreground"
        aria-label="Display unit"
      >
        {DISPLAY_UNITS.map((u) => (
          <option key={u.value} value={u.value}>
            {u.label}
          </option>
        ))}
      </select>
    </label>
  );
}
