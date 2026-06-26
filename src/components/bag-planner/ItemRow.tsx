import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Pencil } from 'lucide-react';
import type { Item, Bag } from '@/lib/bag-planner/types';
import { BAG_TYPE_LABELS } from '@/lib/bag-planner/types';
import { formatWeight } from '@/lib/bag-planner/format';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditItemDialog } from './EditItemDialog';

export function ItemRow({
  item,
  bags,
  onMove,
  onEdit,
  onRemove,
}: {
  item: Item;
  bags: Bag[];
  onMove: (bagId: string | undefined) => void;
  onEdit: (patch: Partial<Item>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `item:${item.id}`,
    data: { kind: 'item', itemId: item.id },
  });

  const [editOpen, setEditOpen] = useState(false);

  const allowed = (b: Bag) =>
    !item.allowedBagTypes || item.allowedBagTypes.includes(b.type);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
      }}
      className="group flex items-center gap-2 rounded-md border border-border bg-card px-2 py-2"
    >
      <button
        {...listeners}
        {...attributes}
        className="hidden touch-none cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing md:block"
        aria-label="Drag"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{item.name}</div>
        {item.allowedBagTypes ? (
          <div className="truncate text-[11px] text-muted-foreground">
            only: {item.allowedBagTypes.map((t) => BAG_TYPE_LABELS[t]).join(', ')}
          </div>
        ) : null}
      </div>
      <div className="shrink-0 text-sm tabular-nums text-muted-foreground">
        {formatWeight(item.weightG)}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
            Move
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Move to…</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onMove(undefined)}>
            Unpacked
          </DropdownMenuItem>
          {bags.map((b) => (
            <DropdownMenuItem
              key={b.id}
              disabled={!allowed(b) || b.id === item.bagId}
              onClick={() => onMove(b.id)}
            >
              {b.name}
              {!allowed(b) ? (
                <span className="ml-auto text-xs text-destructive">blocked</span>
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <button
        onClick={onRemove}
        className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
        aria-label="Remove item"
      >
        <X className="h-4 w-4" />
      </button>

      <EditItemDialog
        item={item}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={onEdit}
      />
    </div>
  );
}
