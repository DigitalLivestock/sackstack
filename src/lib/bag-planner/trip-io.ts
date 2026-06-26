import type { Trip, TravelType, BagType } from './types';

const TRAVEL_TYPES: TravelType[] = ['hiking', 'normal', 'camping', 'business', 'beach'];
const BAG_TYPES: BagType[] = [
  'backpack',
  'daypack',
  'suitcase',
  'hand_luggage',
  'personal',
  'roof_box',
  'cooler',
  'tent_bag',
  'laptop_bag',
  'beach_bag',
  'hip_belt',
];

export type TripExport = {
  format: 'bagplanner.trip';
  version: 1;
  exportedAt: number;
  trips: Trip[];
};

export function buildExport(trips: Trip[]): TripExport {
  return {
    format: 'bagplanner.trip',
    version: 1,
    exportedAt: Date.now(),
    trips,
  };
}

export function downloadJson(filename: string, data: unknown) {
  const safe = filename.replace(/[^a-z0-9-_]+/gi, '_');
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safe}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function parseTrip(raw: unknown, opts: { regenerateIds: boolean }): Trip {
  if (!isObj(raw)) throw new Error('Trip is not an object');
  const name = typeof raw.name === 'string' ? raw.name : 'Imported trip';
  const travelType = TRAVEL_TYPES.includes(raw.travelType as TravelType)
    ? (raw.travelType as TravelType)
    : 'normal';
  const createdAt = typeof raw.createdAt === 'number' ? raw.createdAt : Date.now();

  const peopleIdMap = new Map<string, string>();
  const people = Array.isArray(raw.people)
    ? raw.people.flatMap((p) => {
        if (!isObj(p) || typeof p.name !== 'string') return [];
        const oldId = typeof p.id === 'string' ? p.id : newId();
        const id = opts.regenerateIds ? newId() : oldId;
        peopleIdMap.set(oldId, id);
        return [{ id, name: p.name, color: typeof p.color === 'string' ? p.color : '#888' }];
      })
    : [];

  const bagIdMap = new Map<string, string>();
  const bags = Array.isArray(raw.bags)
    ? raw.bags.flatMap((b) => {
        if (!isObj(b) || typeof b.name !== 'string') return [];
        const type = BAG_TYPES.includes(b.type as BagType) ? (b.type as BagType) : 'backpack';
        const oldId = typeof b.id === 'string' ? b.id : newId();
        const id = opts.regenerateIds ? newId() : oldId;
        bagIdMap.set(oldId, id);
        const carrierOld = typeof b.carrierId === 'string' ? b.carrierId : undefined;
        const carrierId = carrierOld ? peopleIdMap.get(carrierOld) ?? carrierOld : undefined;
        return [
          {
            id,
            name: b.name,
            type,
            carrierId,
            weightLimitG:
              typeof b.weightLimitG === 'number' ? b.weightLimitG : undefined,
          },
        ];
      })
    : [];

  const items = Array.isArray(raw.items)
    ? raw.items.flatMap((it) => {
        if (!isObj(it) || typeof it.name !== 'string') return [];
        const weightG = typeof it.weightG === 'number' ? it.weightG : 0;
        const oldId = typeof it.id === 'string' ? it.id : newId();
        const id = opts.regenerateIds ? newId() : oldId;
        const bagOld = typeof it.bagId === 'string' ? it.bagId : undefined;
        const bagId = bagOld ? bagIdMap.get(bagOld) ?? bagOld : undefined;
        const allowed = Array.isArray(it.allowedBagTypes)
          ? (it.allowedBagTypes.filter((t) => BAG_TYPES.includes(t as BagType)) as BagType[])
          : undefined;
        return [
          {
            id,
            name: it.name,
            weightG,
            bagId,
            allowedBagTypes: allowed && allowed.length ? allowed : undefined,
          },
        ];
      })
    : [];

  return {
    id: opts.regenerateIds || typeof raw.id !== 'string' ? newId() : (raw.id as string),
    name,
    travelType,
    createdAt,
    people,
    bags,
    items,
  };
}

export function parseImport(
  text: string,
  opts: { regenerateIds?: boolean } = {},
): Trip[] {
  const data = JSON.parse(text);
  const regenerateIds = opts.regenerateIds ?? true;

  // Accept: { trips: [...] }, single Trip, or array of Trip
  let rawTrips: unknown[];
  if (isObj(data) && Array.isArray((data as Record<string, unknown>).trips)) {
    rawTrips = (data as { trips: unknown[] }).trips;
  } else if (Array.isArray(data)) {
    rawTrips = data;
  } else if (isObj(data) && 'name' in data && 'bags' in data) {
    rawTrips = [data];
  } else {
    throw new Error('Unrecognized file format');
  }

  return rawTrips.map((t) => parseTrip(t, { regenerateIds }));
}
