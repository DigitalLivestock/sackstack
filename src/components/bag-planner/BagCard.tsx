import { useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical, Trash2, User, Pencil, AlertTriangle } from 'lucide-react';
import type { Bag, Item, Person } from '@/lib/bag-planner/types';
import { BAG_TYPE_LABELS, bagEmptyWeight, itemWeight } from '@/lib/bag-planner/types';
import { useDisplayUnit } from '@/hooks/use-display-unit';
import { WeightBar } from './WeightBar';
import { ItemRow } from './ItemRow';
import { EditBagDialog } from './EditBagDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CompactItemFilterBar,
  applyItemFilterSort,
  type ItemFilter,
  type ItemSort,
} from './ItemFilterBar';

export function BagCard({
  bag,
  items,
  bags,
  people,
  customTags,
  activeDragItemId,
  onMoveItem,
  onRemoveItem,
  onEditItem,
  onTogglePacked,
  onSetQuantity,
  onAddCustomTag,
  onAssignCarrier,
  onEditBag,
  onRemoveBag,
}: {
  bag: Bag;
  items: Item[];
  bags: Bag[];
  people: Person[];
  customTags: string[];
  activeDragItemId?: string;
  onMoveItem: (itemId: string, bagId: string | undefined) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItem: (itemId: string, patch: Partial<Item>) => void;
  onTogglePacked: (itemId: string) => void;
  onSetQuantity: (itemId: string, quantity: number) => void;
  onAddCustomTag: (tag: string) => void;
  onAssignCarrier: (personId: string | undefined) => void;
  onEditBag: (patch: Partial<Bag>) => void;
  onRemoveBag: () => void;
}) {
  const { setNodeRef: setItemDropRef, isOver: itemOver } = useDroppable({
    id: `bag:${bag.id}`,
    data: { kind: 'bag', bagId: bag.id, bagType: bag.type },
  });

  const {
    setNodeRef: setBagDragRef,
    listeners,
    attributes,
    transform,
    isDragging,
  } = useDraggable({
    id: `bagdrag:${bag.id}`,
    data: { kind: 'bag-drag', bagId: bag.id },
  });

  const [editOpen, setEditOpen] = useState(false);
  const [filter, setFilter] = useState<ItemFilter>('all');
  const [sort, setSort] = useState<ItemSort>('manual');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const availableTags = Array.from(
    new Set([...customTags, ...items.flatMap((i) => i.tags)]),
  ).sort();
  const visible = applyItemFilterSort(items, filter, sort, tagFilter);
  const { format } = useDisplayUnit();


  void activeDragItemId;
  const itemsTotal = items.reduce((sum, i) => sum + itemWeight(i), 0);
  const empty = bagEmptyWeight(bag);
  const currentTotal = itemsTotal + empty;
  const carrier = people.find((p) => p.id === bag.carrierId);
  const noCarrier = !carrier;

  return (
    <div
      ref={setItemDropRef}
      className={`flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all ${
        itemOver
          ? 'border-foreground ring-2 ring-foreground/10'
          : noCarrier
            ? 'border-orange-500/60 ring-1 ring-orange-500/20'
            : 'border-border'
      }`}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <div className="flex items-start gap-2">
        <div
          ref={setBagDragRef}
          {...listeners}
          {...attributes}
          className="min-w-0 flex-1 cursor-grab touch-none select-none active:cursor-grabbing"
        >
          <div className="flex items-center gap-1.5">
            <span className="truncate text-base font-semibold">{bag.name}</span>
            {noCarrier ? (
              <span className="inline-flex items-center gap-0.5 rounded bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-medium text-orange-600">
                <AlertTriangle className="h-3 w-3" />
                No carrier
              </span>
            ) : null}
          </div>
          <div className="text-xs text-muted-foreground">{BAG_TYPE_LABELS[bag.type]}</div>
        </div>

        <CompactItemFilterBar
          filter={filter}
          sort={sort}
          onFilter={setFilter}
          onSort={setSort}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={carrier ? 'secondary' : 'outline'}
              size="sm"
              className={`h-8 shrink-0 gap-1.5 px-2 text-xs ${noCarrier ? 'border-orange-500/60 text-orange-600' : ''}`}
            >
              {carrier ? (
                <>
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: carrier.color }}
                  />
                  <span className="max-w-20 truncate">{carrier.name}</span>
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5" />
                  Assign
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Carry this bag</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onAssignCarrier(undefined)}>
              No one
            </DropdownMenuItem>
            {people.length === 0 ? (
              <DropdownMenuItem disabled>No carriers yet</DropdownMenuItem>
            ) : (
              people.map((p) => (
                <DropdownMenuItem key={p.id} onClick={() => onAssignCarrier(p.id)}>
                  <span
                    className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.name}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit bag
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onRemoveBag} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Remove bag
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <WeightBar current={currentTotal} limit={bag.weightLimitG} />
      {empty > 0 ? (
        <div className="-mt-1 text-[11px] tabular-nums text-muted-foreground">
          Bag own weight: {format(empty)}
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
            Drop items here, or use Move
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
            No items match the current filter.
          </div>
        ) : (
          visible.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              bags={bags}
              customTags={customTags}
              onMove={(bagId) => onMoveItem(item.id, bagId)}
              onEdit={(patch) => onEditItem(item.id, patch)}
              onRemove={() => onRemoveItem(item.id)}
              onTogglePacked={() => onTogglePacked(item.id)}
              onSetQuantity={(q) => onSetQuantity(item.id, q)}
              onAddCustomTag={onAddCustomTag}
            />
          ))
        )}
      </div>
      <EditBagDialog
        bag={bag}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={onEditBag}
      />
    </div>
  );
}
