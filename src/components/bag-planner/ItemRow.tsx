import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Pencil,
  Minus,
  Plus,
  AlertTriangle,
  ChevronDown,
  Check,
  MoreVertical,
  Trash2,
  ArrowRightLeft,
} from 'lucide-react';
import type { Item, Bag } from '@/lib/bag-planner/types';
import { BAG_TYPE_LABELS, itemWeight } from '@/lib/bag-planner/types';
import { useDisplayUnit } from '@/hooks/use-display-unit';
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  const { format } = useDisplayUnit();

  const allowed = (b: Bag) =>
    !item.allowedBagTypes || item.allowedBagTypes.includes(b.type);

  void onTogglePacked;

  return (
    <div
      ref={draggable ? setNodeRef : undefined}
      style={{
        transform: draggable ? CSS.Translate.toString(transform) : undefined,
        opacity: isDragging ? 0.4 : 1,
      }}
      className={`group rounded-md border bg-card transition-colors hover:border-foreground/40 ${
        missingWeight ? 'border-orange-500/50' : 'border-border'
      } ${item.packed ? 'opacity-70' : ''}`}
    >
      {/* Single row: name · drag · tags · qty · weight · menu */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5">
        {draggable ? (
          <button
            {...listeners}
            {...attributes}
            className="hidden shrink-0 touch-none cursor-grab text-muted-foreground/60 hover:text-foreground active:cursor-grabbing md:block"
            aria-label="Drag"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
          aria-label={`Edit ${item.name}`}
        >
          {item.packed ? (
            <Check
              className="h-3.5 w-3.5 shrink-0 text-green-600"
              aria-label="Packed"
            />
          ) : null}
          {missingWeight ? (
            <AlertTriangle
              className="h-3.5 w-3.5 shrink-0 text-orange-500"
              aria-label="Missing weight"
            />
          ) : null}
          <span
            className={`block min-w-0 flex-1 truncate text-sm font-semibold leading-tight ${
              item.packed ? 'line-through' : ''
            }`}
            title={item.name}
          >
            {item.name}
          </span>
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          {item.tags.length ? <TagBadges tags={item.tags} /> : null}
          {item.allowedBagTypes ? (
            <span
              className="truncate text-[10px] text-muted-foreground"
              title={`Only: ${item.allowedBagTypes.map((t) => BAG_TYPE_LABELS[t]).join(', ')}`}
            >
              only {item.allowedBagTypes.map((t) => BAG_TYPE_LABELS[t]).join(', ')}
            </span>
          ) : null}
        </div>

        {onSetQuantity ? (
          <Popover open={qtyOpen} onOpenChange={setQtyOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-xs tabular-nums text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Change quantity"
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
                  aria-label="Decrease"
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
                  aria-label="Increase"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : null}

        <div className="shrink-0 text-right text-sm font-medium tabular-nums">
          {format(itemWeight(item))}
          {item.quantity > 1 ? (
            <div className="text-[10px] font-normal leading-none text-muted-foreground/70">
              {format(item.weightG)} × {item.quantity}
            </div>
          ) : null}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-muted-foreground"
              onClick={(e) => e.stopPropagation()}
              aria-label="Item actions"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit item
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Move to…
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
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
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onRemove} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
