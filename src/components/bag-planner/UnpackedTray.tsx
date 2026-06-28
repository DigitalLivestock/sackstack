import { useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Upload, FileDown } from 'lucide-react';
import { downloadTemplate, parseItemsImport, type ItemImport } from '@/lib/bag-planner/trip-io';
import { toast } from 'sonner';
import type { Bag, Item, Trip } from '@/lib/bag-planner/types';
import { itemWeight } from '@/lib/bag-planner/types';
import { ItemRow } from './ItemRow';
import { AddItemForm } from './AddItemForm';
import { useDisplayUnit } from '@/hooks/use-display-unit';
import { ImportItemsDialog } from './ImportItemsDialog';
import { SuggestionsPopover } from './SuggestionsPopover';
import {
  CompactItemFilterBar,
  applyItemFilterSort,
  type ItemFilter,
  type ItemSort,
} from './ItemFilterBar';

export function UnpackedTray({
  items,
  bags,
  trip,
  onAdd,
  onMove,
  onEdit,
  onRemove,
  onTogglePacked,
  onSetQuantity,
  onAddCustomTag,
}: {
  items: Item[];
  bags: Bag[];
  trip: Trip;
  onAdd: (item: Partial<Item> & { name: string; weightG: number }) => void;
  onMove: (itemId: string, bagId: string | undefined) => void;
  onEdit: (itemId: string, patch: Partial<Item>) => void;
  onRemove: (itemId: string) => void;
  onTogglePacked: (itemId: string) => void;
  onSetQuantity: (itemId: string, quantity: number) => void;
  onAddCustomTag: (tag: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unpacked',
    data: { kind: 'unpacked' },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<ItemImport[] | null>(null);

  const [filter, setFilter] = useState<ItemFilter>('all');
  const [sort, setSort] = useState<ItemSort>('manual');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const availableTags = Array.from(
    new Set([...trip.customTags, ...items.flatMap((i) => i.tags)]),
  ).sort();
  const visible = applyItemFilterSort(items, filter, sort, tagFilter);
  const { format } = useDisplayUnit();


  const total = items.reduce((s, i) => s + itemWeight(i), 0);

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parseItemsImport(text);
      setImportPreview(parsed);
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
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Unpacked</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            {items.length} · {format(total)}
          </span>
          <CompactItemFilterBar
            filter={filter}
            sort={sort}
            tagFilter={tagFilter}
            availableTags={availableTags}
            onFilter={setFilter}
            onSort={setSort}
            onTagFilter={setTagFilter}
          />

        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <SuggestionsPopover trip={trip} onAdd={onAdd} />
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
        >
          <Upload className="h-3.5 w-3.5" />
          Import
        </button>
        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <FileDown className="h-3.5 w-3.5" />
          Template
        </button>
      </div>

      <AddItemForm
        customTags={trip.customTags}
        onAddCustomTag={onAddCustomTag}
        onAdd={(name, weightG, opts) =>
          onAdd({ name, weightG, quantity: opts?.quantity, tags: opts?.tags })
        }
      />

      <div className="flex flex-col gap-1.5">
        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
            Add items above — they appear here, then drag them to a bag.
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
            No items match the current filter.
          </div>
        ) : (
          visible.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              bags={bags}
              customTags={trip.customTags}
              onMove={(bagId) => onMove(item.id, bagId)}
              onEdit={(patch) => onEdit(item.id, patch)}
              onRemove={() => onRemove(item.id)}
              onTogglePacked={() => onTogglePacked(item.id)}
              onSetQuantity={(q) => onSetQuantity(item.id, q)}
              onAddCustomTag={onAddCustomTag}
            />
          ))
        )}
      </div>

      <ImportItemsDialog
        items={importPreview}
        customTags={trip.customTags}
        onAddCustomTag={onAddCustomTag}
        onClose={() => setImportPreview(null)}
        onConfirm={(toImport) => {
          toImport.forEach((it) =>
            onAdd({
              name: it.name,
              weightG: it.weightG,
              quantity: it.quantity,
              tags: it.tags,
              packed: it.packed,
              allowedBagTypes: it.allowedBagTypes,
            }),
          );
          toast.success(`Imported ${toImport.length} items`);
          setImportPreview(null);
        }}
      />
    </div>
  );
}
