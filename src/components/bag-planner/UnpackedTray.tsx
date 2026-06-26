import { useDroppable } from '@dnd-kit/core';
import type { Bag, Item } from '@/lib/bag-planner/types';
import { ItemRow } from './ItemRow';
import { AddItemForm } from './AddItemForm';
import { formatWeight } from '@/lib/bag-planner/format';

export function UnpackedTray({
  items,
  bags,
  onAdd,
  onMove,
  onRemove,
}: {
  items: Item[];
  bags: Bag[];
  onAdd: (name: string, weightG: number) => void;
  onMove: (itemId: string, bagId: string | undefined) => void;
  onRemove: (itemId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unpacked',
    data: { kind: 'unpacked' },
  });

  const total = items.reduce((s, i) => s + i.weightG, 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all ${
        isOver ? 'border-foreground ring-2 ring-foreground/10' : 'border-border'
      }`}
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">Unpacked</h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {items.length} · {formatWeight(total)}
        </span>
      </div>

      <AddItemForm onAdd={onAdd} />

      <div className="flex flex-col gap-1.5">
        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
            Add items above — they start here, then drag to a bag.
          </div>
        ) : (
          items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              bags={bags}
              onMove={(bagId) => onMove(item.id, bagId)}
              onRemove={() => onRemove(item.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
