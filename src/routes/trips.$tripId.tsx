import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
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
import { ArrowLeft, Download, ListChecks, Printer } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { buildExport, downloadJson } from '@/lib/bag-planner/trip-io';

import { Button } from '@/components/ui/button';
import { useTrip } from '@/hooks/use-trip';
import { bagEmptyWeight, itemWeight, travelTypeEmoji, travelTypeLabel } from '@/lib/bag-planner/types';
import { formatWeight } from '@/lib/bag-planner/format';
import { BagCard } from '@/components/bag-planner/BagCard';
import { UnpackedTray } from '@/components/bag-planner/UnpackedTray';
import { PersonChip } from '@/components/bag-planner/PersonChip';
import { AddPersonInline } from '@/components/bag-planner/AddPersonInline';
import { AddBagDialog } from '@/components/bag-planner/AddBagDialog';
import { CustomTravelTypeDialog } from '@/components/bag-planner/CustomTravelTypeDialog';
import {
  ItemFilterBar,
  applyItemFilterSort,
  type ItemFilter,
  type ItemSort,
} from '@/components/bag-planner/ItemFilterBar';

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
    updateBag,
    removeBag,
    addItem,
    updateItem,
    moveItem,
    removeItem,
    toggleItemPacked,
    setItemQuantity,
    addCustomTag,
    addPerson,
    updatePerson,
    removePerson,
    assignCarrier,
    addCustomTravelType,
    removeCustomTravelType,
    setTravelType,
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

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const [itemFilter, setItemFilter] = useState<ItemFilter>('all');
  const [itemSort, setItemSort] = useState<ItemSort>('manual');

  const itemsByBag = useMemo(() => {
    const map = new Map<string | undefined, NonNullable<typeof trip>['items']>();
    if (!trip) return map;
    map.set(undefined, []);
    trip.bags.forEach((b) => map.set(b.id, []));
    trip.items.forEach((it) => {
      const key =
        it.bagId && trip.bags.some((b) => b.id === it.bagId) ? it.bagId : undefined;
      const arr = map.get(key) ?? [];
      arr.push(it);
      map.set(key, arr);
    });
    for (const [k, arr] of map) {
      map.set(k, applyItemFilterSort(arr, itemFilter, itemSort));
    }
    return map;
  }, [trip, itemFilter, itemSort]);

  if (!trip) {
    if (!hydrated) {
      return (
        <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
          Loading…
        </div>
      );
    }
    return (
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
    );
  }

  const totalWeight =
    trip.items.reduce((s, i) => s + itemWeight(i), 0) +
    trip.bags.reduce((s, b) => s + bagEmptyWeight(b), 0);
  const unassignedBags = trip.bags.filter((b) => !b.carrierId).length;

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
              <span className="text-lg">{travelTypeEmoji(trip)}</span>
              <h1 className="truncate text-base font-semibold sm:text-lg">{trip.name}</h1>
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {travelTypeLabel(trip)} · {trip.bags.length} bags · {trip.items.length} items
              {unassignedBags > 0 ? (
                <span className="ml-2 text-orange-600">
                  · {unassignedBags} utan bärare
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/trips/$tripId/checklist" params={{ tripId: trip.id }}>
                <ListChecks className="h-4 w-4" />
                <span className="hidden sm:inline">Packlista</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/trips/$tripId/print" params={{ tripId: trip.id }}>
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Skriv ut</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                downloadJson(`trip-${trip.name}`, buildExport([trip]));
                toast.success('Trip exported');
              }}
              aria-label="Export trip to JSON"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Total
              </div>
              <div className="text-sm font-semibold tabular-nums">
                {formatWeight(totalWeight)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
          {/* People */}
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                People
              </h2>
              <div className="flex items-center gap-2">
                <CustomTravelTypeDialog
                  trip={trip}
                  onAdd={addCustomTravelType}
                  onRemove={removeCustomTravelType}
                  onSelect={setTravelType}
                />
                <span className="hidden text-xs text-muted-foreground md:block">
                  Drag a bag onto a person
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {trip.people.map((p) => {
                const carries = trip.bags.filter((b) => b.carrierId === p.id);
                const w = carries.reduce(
                  (s, b) =>
                    s +
                    bagEmptyWeight(b) +
                    trip.items
                      .filter((i) => i.bagId === b.id)
                      .reduce((ss, i) => ss + itemWeight(i), 0),
                  0,
                );
                return (
                  <div key={p.id} className="flex flex-col items-start gap-0.5">
                    <PersonChip
                      person={p}
                      droppable={activeDrag?.kind === 'bag-drag'}
                      onEdit={(patch) => updatePerson(p.id, patch)}
                      onRemove={() => removePerson(p.id)}
                    />
                    <span className="pl-3 text-[11px] tabular-nums text-muted-foreground">
                      {carries.length} bag{carries.length === 1 ? '' : 's'} ·{' '}
                      <span className="font-semibold text-foreground">{formatWeight(w)}</span>
                    </span>
                  </div>
                );
              })}
              <AddPersonInline onAdd={addPerson} />
            </div>
          </section>

          <ItemFilterBar
            filter={itemFilter}
            sort={itemSort}
            onFilter={setItemFilter}
            onSort={setItemSort}
          />

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
                      customTags={trip.customTags}
                      activeDragItemId={
                        activeDrag?.kind === 'item' ? activeDrag.itemId : undefined
                      }
                      onMoveItem={moveItem}
                      onRemoveItem={removeItem}
                      onEditItem={updateItem}
                      onTogglePacked={(id) => toggleItemPacked(id)}
                      onSetQuantity={setItemQuantity}
                      onAddCustomTag={addCustomTag}
                      onAssignCarrier={(pid) => assignCarrier(bag.id, pid)}
                      onEditBag={(patch) => updateBag(bag.id, patch)}
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
                trip={trip}
                onAdd={addItem}
                onMove={moveItem}
                onEdit={updateItem}
                onRemove={removeItem}
                onTogglePacked={(id) => toggleItemPacked(id)}
                onSetQuantity={setItemQuantity}
                onAddCustomTag={addCustomTag}
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
                      {formatWeight(itemWeight(item))}
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
