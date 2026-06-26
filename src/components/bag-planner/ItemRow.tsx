import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Pencil, Minus, Plus, AlertTriangle } from 'lucide-react';
import type { Item, Bag } from '@/lib/bag-planner/types';
import { BAG_TYPE_LABELS, itemWeight } from '@/lib/bag-planner/types';
import { formatWeight } from '@/lib/bag-planner/format';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditItemDialog } from './EditItemDialog';
import { TagBadges } from './TagPicker';

export function ItemRow({
  item,
  bags,
  customTags,
  onMove,
  onEdit,
  onRemove,
  onTogglePacked,
  onSetQuantity,
  onAddCustomTag,
  draggable = true,
}: {
  item: Item;
  bags: Bag[];
  customTags?: string[];
  onMove: (bagId: string | undefined) => void;
  onEdit: (patch: Partial<Item>) => void;
  onRemove: () => void;
  onTogglePacked?: () => void;
  onSetQuantity?: (q: number) => void;
  onAddCustomTag?: (tag: string) => void;
  draggable?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `item:${item.id}`,
    data: { kind: 'item', itemId: item.id },
    disabled: !draggable,
  });

  const [editOpen, setEditOpen] = useState(false);
  const missingWeight = item.weightG === 0;

  const allowed = (b: Bag) =>
    !item.allowedBagTypes || item.allowedBagTypes.includes(b.type);

  return (
    <div
      ref={draggable ? setNodeRef : undefined}
      style={{
        transform: draggable ? CSS.Translate.toString(transform) : undefined,
        opacity: isDragging ? 0.4 : 1,
      }}
      className={`group flex items-center gap-2 rounded-md border bg-card px-2 py-2 ${
        missingWeight ? 'border-orange-500/50' : 'border-border'
      } ${item.packed ? 'opacity-60' : ''}`}
    >
      {onTogglePacked ? (
        <Checkbox
          checked={item.packed}
          onCheckedChange={() => onTogglePacked()}
          aria-label={`Mark ${item.name} as packed`}
        />
      ) : null}
      {draggable ? (
        <button
          {...listeners}
          {...attributes}
          className="hidden touch-none cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing md:block"
          aria-label="Drag"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`truncate text-sm font-medium ${item.packed ? 'line-through' : ''}`}>
            {item.name}
          </span>
          {missingWeight ? (
            <span className="inline-flex items-center gap-0.5 rounded bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-medium text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              Vikt saknas
            </span>
          ) : null}
        </div>
        {item.tags.length ? (
          <div className="mt-0.5">
            <TagBadges tags={item.tags} />
          </div>
        ) : null}
        {item.allowedBagTypes ? (
          <div className="truncate text-[11px] text-muted-foreground">
            only: {item.allowedBagTypes.map((t) => BAG_TYPE_LABELS[t]).join(', ')}
          </div>
        ) : null}
      </div>

      {onSetQuantity ? (
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => onSetQuantity(Math.max(1, item.quantity - 1))}
            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Decrease quantity"
            disabled={item.quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-5 text-center text-xs font-medium tabular-nums">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onSetQuantity(item.quantity + 1)}
            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      ) : null}

      <div className="shrink-0 text-right text-sm tabular-nums text-muted-foreground">
        {formatWeight(itemWeight(item))}
        {item.quantity > 1 ? (
          <div className="text-[10px] leading-none text-muted-foreground/70">
            {formatWeight(item.weightG)} × {item.quantity}
          </div>
        ) : null}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
            Move
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit item
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Move to…</DropdownMenuLabel>
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
        customTags={customTags ?? []}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={onEdit}
        onAddCustomTag={onAddCustomTag}
      />
    </div>
  );
}
