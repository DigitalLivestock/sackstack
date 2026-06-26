import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical, Trash2, User } from 'lucide-react';
import type { Bag, Item, Person } from '@/lib/bag-planner/types';
import { BAG_TYPE_LABELS } from '@/lib/bag-planner/types';
import { WeightBar } from './WeightBar';
import { ItemRow } from './ItemRow';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function BagCard({
  bag,
  items,
  bags,
  people,
  activeDragItemId,
  onMoveItem,
  onRemoveItem,
  onAssignCarrier,
  onRemoveBag,
}: {
  bag: Bag;
  items: Item[];
  bags: Bag[];
  people: Person[];
  activeDragItemId?: string;
  onMoveItem: (itemId: string, bagId: string | undefined) => void;
  onRemoveItem: (itemId: string) => void;
  onAssignCarrier: (personId: string | undefined) => void;
  onRemoveBag: () => void;
}) {
  // Droppable for items
  const { setNodeRef: setItemDropRef, isOver: itemOver } = useDroppable({
    id: `bag:${bag.id}`,
    data: { kind: 'bag', bagId: bag.id, bagType: bag.type },
  });

  // Draggable so user can drop the bag onto a person chip to assign carrier
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

  const activeItem =
    activeDragItemId ? items.concat().find(() => false) : undefined;
  void activeItem;

  // Determine if currently dragged item is allowed
  const currentTotal = items.reduce((sum, i) => sum + i.weightG, 0);
  const carrier = people.find((p) => p.id === bag.carrierId);

  // Visual feedback when drag is over: we don't know item allowance here directly;
  // BagPlanner passes allowed info via activeDragItemId. For simplicity highlight on hover.

  return (
    <div
      ref={setItemDropRef}
      className={`flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all ${
        itemOver ? 'border-foreground ring-2 ring-foreground/10' : 'border-border'
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
          <div className="truncate text-base font-semibold">{bag.name}</div>
          <div className="text-xs text-muted-foreground">{BAG_TYPE_LABELS[bag.type]}</div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={carrier ? 'secondary' : 'outline'}
              size="sm"
              className="h-8 shrink-0 gap-1.5 px-2 text-xs"
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
              Unassigned
            </DropdownMenuItem>
            {people.length === 0 ? (
              <DropdownMenuItem disabled>No people added yet</DropdownMenuItem>
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
            <DropdownMenuItem onClick={onRemoveBag} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Remove bag
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <WeightBar current={currentTotal} limit={bag.weightLimitG} />

      <div className="flex flex-col gap-1.5">
        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
            Drop items here, or use Move
          </div>
        ) : (
          items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              bags={bags}
              onMove={(bagId) => onMoveItem(item.id, bagId)}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
