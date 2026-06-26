import { useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Upload, FileDown } from 'lucide-react';
import { downloadTemplate } from '@/lib/bag-planner/trip-io';
import { toast } from 'sonner';
import type { Bag, Item } from '@/lib/bag-planner/types';
import { ItemRow } from './ItemRow';
import { AddItemForm } from './AddItemForm';
import { formatWeight } from '@/lib/bag-planner/format';
import { parseItemsImport } from '@/lib/bag-planner/trip-io';

export function UnpackedTray({
  items,
  bags,
  onAdd,
  onMove,
  onEdit,
  onRemove,
}: {
  items: Item[];
  bags: Bag[];
  onAdd: (name: string, weightG: number, allowedBagTypes?: Item['allowedBagTypes']) => void;
  onMove: (itemId: string, bagId: string | undefined) => void;
  onEdit: (itemId: string, patch: Partial<Item>) => void;
  onRemove: (itemId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unpacked',
    data: { kind: 'unpacked' },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const total = items.reduce((s, i) => s + i.weightG, 0);

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parseItemsImport(text);
      parsed.forEach((it) => onAdd(it.name, it.weightG, it.allowedBagTypes));
      toast.success(`Imported ${parsed.length} item${parsed.length === 1 ? '' : 's'}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid JSON file');
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all ${
        isOver ? 'border-foreground ring-2 ring-foreground/10' : 'border-border'
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold">Unpacked</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            {items.length} · {formatWeight(total)}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleImport(f);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Import items from JSON"
            title="Import items from JSON"
          >
            <Upload className="h-3.5 w-3.5" />
            Import
          </button>
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Download JSON import template"
            title="Download JSON import template"
          >
            <FileDown className="h-3.5 w-3.5" />
            Template
          </button>
        </div>
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
