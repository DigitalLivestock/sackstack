import { useCallback, useEffect, useState } from 'react';
import type { Bag, Item, Person, Trip, TravelType } from '@/lib/bag-planner/types';
import { buildPresetBags, PERSON_COLORS } from '@/lib/bag-planner/presets';

const STORAGE_KEY = 'bagplanner:trips';

function loadAll(): Trip[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Trip[];
  } catch {
    return [];
  }
}

function saveAll(trips: Trip[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

// Tiny pub/sub so multiple hook instances stay in sync.
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>(() => loadAll());

  useEffect(() => {
    const l = () => setTrips(loadAll());
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const createTrip = useCallback((name: string, travelType: TravelType): Trip => {
    const trip: Trip = {
      id: crypto.randomUUID(),
      name,
      travelType,
      people: [],
      bags: buildPresetBags(travelType),
      items: [],
      createdAt: Date.now(),
    };
    const all = loadAll();
    all.push(trip);
    saveAll(all);
    emit();
    return trip;
  }, []);

  const deleteTrip = useCallback((id: string) => {
    saveAll(loadAll().filter((t) => t.id !== id));
    emit();
  }, []);

  return { trips, createTrip, deleteTrip };
}

export function useTrip(tripId: string) {
  const [trip, setTrip] = useState<Trip | undefined>(() =>
    loadAll().find((t) => t.id === tripId),
  );

  useEffect(() => {
    const l = () => setTrip(loadAll().find((t) => t.id === tripId));
    listeners.add(l);
    l();
    return () => {
      listeners.delete(l);
    };
  }, [tripId]);

  const update = useCallback(
    (mutator: (t: Trip) => Trip) => {
      const all = loadAll();
      const idx = all.findIndex((t) => t.id === tripId);
      if (idx === -1) return;
      all[idx] = mutator(all[idx]);
      saveAll(all);
      emit();
    },
    [tripId],
  );

  const addBag = useCallback(
    (bag: Omit<Bag, 'id'>) =>
      update((t) => ({ ...t, bags: [...t.bags, { ...bag, id: crypto.randomUUID() }] })),
    [update],
  );

  const updateBag = useCallback(
    (id: string, patch: Partial<Bag>) =>
      update((t) => ({
        ...t,
        bags: t.bags.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      })),
    [update],
  );

  const removeBag = useCallback(
    (id: string) =>
      update((t) => ({
        ...t,
        bags: t.bags.filter((b) => b.id !== id),
        items: t.items.map((it) => (it.bagId === id ? { ...it, bagId: undefined } : it)),
      })),
    [update],
  );

  const addItem = useCallback(
    (item: Omit<Item, 'id'>) =>
      update((t) => ({ ...t, items: [...t.items, { ...item, id: crypto.randomUUID() }] })),
    [update],
  );

  const updateItem = useCallback(
    (id: string, patch: Partial<Item>) =>
      update((t) => ({
        ...t,
        items: t.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      })),
    [update],
  );

  const moveItem = useCallback(
    (itemId: string, bagId: string | undefined) =>
      update((t) => ({
        ...t,
        items: t.items.map((i) => (i.id === itemId ? { ...i, bagId } : i)),
      })),
    [update],
  );

  const removeItem = useCallback(
    (id: string) =>
      update((t) => ({ ...t, items: t.items.filter((i) => i.id !== id) })),
    [update],
  );

  const addPerson = useCallback(
    (name: string) =>
      update((t) => {
        const color = PERSON_COLORS[t.people.length % PERSON_COLORS.length];
        const person: Person = { id: crypto.randomUUID(), name, color };
        return { ...t, people: [...t.people, person] };
      }),
    [update],
  );

  const removePerson = useCallback(
    (id: string) =>
      update((t) => ({
        ...t,
        people: t.people.filter((p) => p.id !== id),
        bags: t.bags.map((b) => (b.carrierId === id ? { ...b, carrierId: undefined } : b)),
      })),
    [update],
  );

  const assignCarrier = useCallback(
    (bagId: string, personId: string | undefined) =>
      update((t) => ({
        ...t,
        bags: t.bags.map((b) => (b.id === bagId ? { ...b, carrierId: personId } : b)),
      })),
    [update],
  );

  return {
    trip,
    addBag,
    updateBag,
    removeBag,
    addItem,
    updateItem,
    moveItem,
    removeItem,
    addPerson,
    removePerson,
    assignCarrier,
  };
}
