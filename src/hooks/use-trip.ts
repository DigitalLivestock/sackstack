import { useCallback, useEffect, useState } from 'react';
import type { Bag, CustomTravelType, Item, Person, Trip, TravelType } from '@/lib/bag-planner/types';
import { buildPresetBags, PERSON_COLORS } from '@/lib/bag-planner/presets';

const STORAGE_KEY = 'bagplanner:trips';

function normalizeItem(raw: Partial<Item> & { name: string; weightG: number }): Item {
  return {
    id: raw.id ?? crypto.randomUUID(),
    name: raw.name,
    weightG: raw.weightG,
    bagId: raw.bagId,
    allowedBagTypes: raw.allowedBagTypes,
    quantity: typeof raw.quantity === 'number' && raw.quantity > 0 ? raw.quantity : 1,
    packed: !!raw.packed,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
  };
}

function normalizeTrip(raw: Trip): Trip {
  return {
    ...raw,
    customTags: Array.isArray(raw.customTags) ? raw.customTags : [],
    customTravelTypes: Array.isArray(raw.customTravelTypes) ? raw.customTravelTypes : [],
    items: (raw.items ?? []).map((i) => normalizeItem(i as Item)),
  };
}

function loadAll(): Trip[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as Trip[]).map(normalizeTrip);
  } catch {
    return [];
  }
}

function saveAll(trips: Trip[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

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
      customTags: [],
      customTravelTypes: [],
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

  const importTrips = useCallback((incoming: Trip[]): number => {
    if (!incoming.length) return 0;
    const all = loadAll();
    const existing = new Set(all.map((t) => t.id));
    const merged = incoming.filter((t) => !existing.has(t.id)).map(normalizeTrip);
    saveAll([...all, ...merged]);
    emit();
    return merged.length;
  }, []);

  return { trips, createTrip, deleteTrip, importTrips };
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
    (item: Partial<Item> & { name: string; weightG: number }) =>
      update((t) => ({
        ...t,
        items: [...t.items, normalizeItem({ ...item, id: crypto.randomUUID() })],
      })),
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

  const toggleItemPacked = useCallback(
    (id: string, packed?: boolean) =>
      update((t) => ({
        ...t,
        items: t.items.map((i) =>
          i.id === id ? { ...i, packed: packed ?? !i.packed } : i,
        ),
      })),
    [update],
  );

  const setItemQuantity = useCallback(
    (id: string, quantity: number) =>
      update((t) => ({
        ...t,
        items: t.items.map((i) =>
          i.id === id ? { ...i, quantity: Math.max(1, Math.floor(quantity)) } : i,
        ),
      })),
    [update],
  );

  const setItemTags = useCallback(
    (id: string, tags: string[]) =>
      update((t) => ({
        ...t,
        items: t.items.map((i) => (i.id === id ? { ...i, tags } : i)),
      })),
    [update],
  );

  const addCustomTag = useCallback(
    (tag: string) =>
      update((t) => {
        const trimmed = tag.trim();
        if (!trimmed || t.customTags.includes(trimmed)) return t;
        return { ...t, customTags: [...t.customTags, trimmed] };
      }),
    [update],
  );

  const removeCustomTag = useCallback(
    (tag: string) =>
      update((t) => ({
        ...t,
        customTags: t.customTags.filter((x) => x !== tag),
        items: t.items.map((i) => ({ ...i, tags: i.tags.filter((x) => x !== tag) })),
      })),
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

  const updatePerson = useCallback(
    (id: string, patch: Partial<Person>) =>
      update((t) => ({
        ...t,
        people: t.people.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      })),
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

  const addCustomTravelType = useCallback(
    (ct: Omit<CustomTravelType, 'id'>) =>
      update((t) => ({
        ...t,
        customTravelTypes: [
          ...t.customTravelTypes,
          { ...ct, id: crypto.randomUUID() },
        ],
      })),
    [update],
  );

  const updateCustomTravelType = useCallback(
    (id: string, patch: Partial<CustomTravelType>) =>
      update((t) => ({
        ...t,
        customTravelTypes: t.customTravelTypes.map((c) =>
          c.id === id ? { ...c, ...patch } : c,
        ),
      })),
    [update],
  );

  const removeCustomTravelType = useCallback(
    (id: string) =>
      update((t) => ({
        ...t,
        customTravelTypes: t.customTravelTypes.filter((c) => c.id !== id),
      })),
    [update],
  );

  const setTravelType = useCallback(
    (travelType: string) => update((t) => ({ ...t, travelType })),
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
    toggleItemPacked,
    setItemQuantity,
    setItemTags,
    addCustomTag,
    removeCustomTag,
    addPerson,
    updatePerson,
    removePerson,
    assignCarrier,
    addCustomTravelType,
    updateCustomTravelType,
    removeCustomTravelType,
    setTravelType,
  };
}
