import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import type { Trip } from '@/lib/bag-planner/types';
import { bagEmptyWeight, itemWeight } from '@/lib/bag-planner/types';
import { toChartValue, chartUnitLabel } from '@/lib/bag-planner/format';
import type { DisplayUnit } from '@/lib/bag-planner/format';

export function CarrierWeightChart({
  trip,
  unit,
  format,
}: {
  trip: Trip;
  unit: DisplayUnit;
  format: (grams: number) => string;
}) {
  const data = useMemo(() => {
    const rows: { name: string; weightG: number; color: string }[] = [];

    trip.people.forEach((p) => {
      const bags = trip.bags.filter((b) => b.carrierId === p.id);
      const weightG = bags.reduce((sum, b) => {
        const itemsWeight = trip.items
          .filter((i) => i.bagId === b.id)
          .reduce((s, i) => s + itemWeight(i), 0);
        return sum + bagEmptyWeight(b) + itemsWeight;
      }, 0);
      rows.push({ name: p.name, weightG, color: p.color });
    });

    const unassigned = trip.bags.filter((b) => !b.carrierId);
    if (unassigned.length > 0) {
      const weightG = unassigned.reduce((sum, b) => {
        const itemsWeight = trip.items
          .filter((i) => i.bagId === b.id)
          .reduce((s, i) => s + itemWeight(i), 0);
        return sum + bagEmptyWeight(b) + itemsWeight;
      }, 0);
      rows.push({ name: 'Unassigned', weightG, color: '#9ca3af' });
    }

    // Sort by weight descending
    rows.sort((a, b) => b.weightG - a.weightG);
    return rows;
  }, [trip]);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold">Weight per carrier</h3>
        <p className="mt-3 text-xs text-muted-foreground">No carriers to display.</p>
      </div>
    );
  }

  const maxWeight = Math.max(...data.map((d) => d.weightG), 1);
  const unitLabel = unit === 'auto' ? (maxWeight >= 1000 ? 'kg' : 'g') : chartUnitLabel(unit);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">Weight per carrier</h3>
      <div className="mt-3" style={{ height: Math.max(160, data.length * 40 + 40) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 4, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              tickFormatter={(v: number) =>
                `${toChartValue(v, unit).toFixed(unit === 'g' || (unit === 'auto' && maxWeight < 1000) ? 0 : 1)} ${unitLabel}`
              }
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0]?.payload as { name: string; weightG: number } | undefined;
                if (!p) return null;
                return (
                  <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
                    <div className="font-medium">{p.name}</div>
                    <div className="mt-0.5 tabular-nums text-muted-foreground">
                      {format(p.weightG)}
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="weightG" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
