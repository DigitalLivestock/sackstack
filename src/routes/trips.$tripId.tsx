import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { ArrowLeft } from 'lucide-react';
import { toast, Toaster } from 'sonner';

import { Button } from '@/components/ui/button';
import { useTrip } from '@/hooks/use-trip';
import { TRAVEL_TYPE_EMOJI, TRAVEL_TYPE_LABELS } from '@/lib/bag-planner/types';
import { formatWeight } from '@/lib/bag-planner/format';
import { BagCard } from '@/components/bag-planner/BagCard';
import { UnpackedTray } from '@/components/bag-planner/UnpackedTray';
import { PersonChip } from '@/components/bag-planner/PersonChip';
import { AddPersonInline } from '@/components/bag-planner/AddPersonInline';
import { AddBagDialog } from '@/components/bag-planner/AddBagDialog';

export const Route = createFileRoute('/trips/$tripId')({
  component: TripPlanner,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="text-xl font-semibold">Trip not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been deleted on this device.
        </p>
        <Button asChild className="mt-4">
          <Link to="/">Back to trips</Link>
        </Button>
      </div>
    </div>
  ),
});

function TripPlanner() {
  const { tripId } = Route.useParams();
  const {
    trip,
    addBag,
    removeBag,
    addItem,
    moveItem,
    removeItem,
    addPerson,
    removePerson,
    assignCarrier,
  } = useTrip(tripId);

  const [activeDrag, setActiveDrag] = useState<
    | { kind: 'item'; itemId: string }
    | { kind: 'bag-drag'; bagId: string }
    | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const itemsByBag = useMemo(() => {
    const map = new Map<string | undefined, typeof trip extends undefined ? never : NonNullable<typeof trip>['items']>();
    if (!trip) return map;
    map.set(undefined, []);
    trip.bags.forEach((b) => map.set(b.id, []));
    trip.items.forEach((it) => {
      const key = it.bagId && trip.bags.some((b) => b.id === it.bagId) ? it.bagId : undefined;
      const arr = map.get(key) ?? [];
      arr.push(it);
      map.set(key, arr);
    });
    return map;
  }, [trip]);

  if (trip === undefined) {
    // Could be still hydrating from localStorage
    throw notFound();
  }

  const totalWeight = trip.items.reduce((s, i) => s + i.weightG, 0);

  const handleDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current as
      | { kind: 'item'; itemId: string }
      | { kind: 'bag-drag'; bagId: string }
      | undefined;
    if (data) setActiveDrag(data);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = e;
    if (!over) return;
    const aData = active.data.current as
      | { kind: 'item'; itemId: string }
      | { kind: 'bag-drag'; bagId: string }
      | undefined;
    const oData = over.data.current as
      | { kind: 'bag'; bagId: string; bagType: string }
      | { kind: 'unpacked' }
      | { kind: 'person'; personId: string }
      | undefined;
    if (!aData || !oData) return;

    if (aData.kind === 'item') {
      const item = trip.items.find((i) => i.id === aData.itemId);
      if (!item) return;
      if (oData.kind === 'unpacked') {
        moveItem(item.id, undefined);
      } else if (oData.kind === 'bag') {
        const bag = trip.bags.find((b) => b.id === oData.bagId);
        if (!bag) return;
        if (item.allowedBagTypes && !item.allowedBagTypes.includes(bag.type)) {
          toast.error(`"${item.name}" can't go in ${bag.name}`);
          return;
        }
        moveItem(item.id, bag.id);
      }
    } else if (aData.kind === 'bag-drag') {
      if (oData.kind === 'person') {
        assignCarrier(aData.bagId, oData.personId);
        const p = trip.people.find((x) => x.id === oData.personId);
        const b = trip.bags.find((x) => x.id === aData.bagId);
        if (p && b) toast.success(`${p.name} carries ${b.name}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/" aria-label="Back to trips">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">{TRAVEL_TYPE_EMOJI[trip.travelType]}</span>
              <h1 className="truncate text-base font-semibold sm:text-lg">{trip.name}</h1>
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {TRAVEL_TYPE_LABELS[trip.travelType]} · {trip.bags.length} bags ·{' '}
              {trip.items.length} items
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Total
            </div>
            <div className="text-sm font-semibold tabular-nums">
              {formatWeight(totalWeight)}
            </div>
          </div>
        </div>
      </header>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
          {/* People */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                People
              </h2>
              <span className="hidden text-xs text-muted-foreground md:block">
                Drag a bag onto a person to assign carrier
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {trip.people.map((p) => {
                const carries = trip.bags.filter((b) => b.carrierId === p.id);
                const w = carries.reduce(
                  (s, b) =>
                    s +
                    trip.items
                      .filter((i) => i.bagId === b.id)
                      .reduce((ss, i) => ss + i.weightG, 0),
                  0,
                );
                return (
                  <div key={p.id} className="flex flex-col items-start gap-0.5">
                    <PersonChip
                      person={p}
                      droppable={activeDrag?.kind === 'bag-drag'}
                      onRemove={() => removePerson(p.id)}
                    />
                    <span className="pl-3 text-[11px] tabular-nums text-muted-foreground">
                      {carries.length} bag{carries.length === 1 ? '' : 's'} · {formatWeight(w)}
                    </span>
                  </div>
                );
              })}
              <AddPersonInline onAdd={addPerson} />
            </div>
          </section>

          {/* Bags + Unpacked */}
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Bags
                </h2>
                <AddBagDialog onAdd={addBag} />
              </div>
              {trip.bags.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
                  No bags yet. Add one to start packing.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {trip.bags.map((bag) => (
                    <BagCard
                      key={bag.id}
                      bag={bag}
                      items={itemsByBag.get(bag.id) ?? []}
                      bags={trip.bags}
                      people={trip.people}
                      activeDragItemId={
                        activeDrag?.kind === 'item' ? activeDrag.itemId : undefined
                      }
                      onMoveItem={moveItem}
                      onRemoveItem={removeItem}
                      onAssignCarrier={(pid) => assignCarrier(bag.id, pid)}
                      onRemoveBag={() => removeBag(bag.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            <aside className="md:sticky md:top-20 md:self-start">
              <UnpackedTray
                items={itemsByBag.get(undefined) ?? []}
                bags={trip.bags}
                onAdd={(name, weightG) => addItem({ name, weightG })}
                onMove={moveItem}
                onRemove={removeItem}
              />
            </aside>
          </div>
        </main>

        <DragOverlay dropAnimation={null}>
          {activeDrag?.kind === 'item'
            ? (() => {
                const item = trip.items.find((i) => i.id === activeDrag.itemId);
                if (!item) return null;
                return (
                  <div className="rounded-md border border-foreground bg-card px-3 py-2 text-sm shadow-lg">
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2 text-muted-foreground tabular-nums">
                      {formatWeight(item.weightG)}
                    </span>
                  </div>
                );
              })()
            : activeDrag?.kind === 'bag-drag'
              ? (() => {
                  const bag = trip.bags.find((b) => b.id === activeDrag.bagId);
                  if (!bag) return null;
                  return (
                    <div className="rounded-md border border-foreground bg-card px-3 py-2 text-sm font-medium shadow-lg">
                      {bag.name}
                    </div>
                  );
                })()
              : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
