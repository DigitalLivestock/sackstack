import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  X,
  Pencil,
  Minus,
  Plus,
  AlertTriangle,
  ChevronDown,
  Check,
} from 'lucide-react';
import type { Item, Bag } from '@/lib/bag-planner/types';
import { BAG_TYPE_LABELS, itemWeight } from '@/lib/bag-planner/types';
import { formatWeight } from '@/lib/bag-planner/format';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  const [qtyOpen, setQtyOpen] = useState(false);
  const missingWeight = item.weightG === 0;

  const allowed = (b: Bag) =>
    !item.allowedBagTypes || item.allowedBagTypes.includes(b.type);

  // suppress unused warning – packed status is now toggled in the checklist view
  void onTogglePacked;

  return (
    <div
      ref={draggable ? setNodeRef : undefined}
      style={{
        transform: draggable ? CSS.Translate.toString(transform) : undefined,
        opacity: isDragging ? 0.4 : 1,
      }}
      className={`group rounded-lg border bg-card transition-colors hover:border-foreground/40 ${
        missingWeight ? 'border-orange-500/50' : 'border-border'
      } ${item.packed ? 'opacity-70' : ''}`}
    >
      {/* Header: name + status icons + actions */}
      <div className="flex items-start gap-1.5 px-3 pt-2.5">
        {draggable ? (
          <button
            {...listeners}
            {...attributes}
            className="mt-0.5 hidden touch-none cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing md:block"
            aria-label="Drag"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="min-w-0 flex-1 text-left"
          aria-label={`Edit ${item.name}`}
        >
          <div className="flex items-center gap-1.5">
            {item.packed ? (
              <Check
                className="h-3.5 w-3.5 shrink-0 text-green-600"
                aria-label="Packat"
              />
            ) : null}
            <span
              className={`block truncate text-base font-semibold leading-tight ${
                item.packed ? 'line-through' : ''
              }`}
              title={item.name}
            >
              {item.name}
            </span>
            {missingWeight ? (
              <AlertTriangle
                className="h-3.5 w-3.5 shrink-0 text-orange-500"
                aria-label="Vikt saknas"
              />
            ) : null}
          </div>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
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
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="mt-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          aria-label="Remove item"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Meta row: tags + restrictions + qty + weight */}
      <div className="flex items-end justify-between gap-2 px-3 pb-2 pt-1">
        <div className="min-w-0 flex-1">
          {item.tags.length ? <TagBadges tags={item.tags} /> : null}
          {item.allowedBagTypes ? (
            <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
              only: {item.allowedBagTypes.map((t) => BAG_TYPE_LABELS[t]).join(', ')}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onSetQuantity ? (
            <Popover open={qtyOpen} onOpenChange={setQtyOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-xs tabular-nums text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Ändra antal"
                >
                  ×{item.quantity}
                  <ChevronDown className="h-3 w-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onSetQuantity(Math.max(1, item.quantity - 1))}
                    disabled={item.quantity <= 1}
                    aria-label="Minska"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium tabular-nums">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onSetQuantity(item.quantity + 1)}
                    aria-label="Öka"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : null}

          <div className="text-right text-sm font-medium tabular-nums">
            {formatWeight(itemWeight(item))}
            {item.quantity > 1 ? (
              <div className="text-[10px] font-normal leading-none text-muted-foreground/70">
                {formatWeight(item.weightG)} × {item.quantity}
              </div>
            ) : null}
          </div>
        </div>
      </div>

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
