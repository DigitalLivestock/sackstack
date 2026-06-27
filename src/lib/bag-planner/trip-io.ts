import type { Trip, TravelType, BagType, Item } from './types';

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
  version: 2;
  exportedAt: number;
  trips: Trip[];
};

export function buildExport(trips: Trip[]): TripExport {
  return {
    format: 'bagplanner.trip',
    version: 2,
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

function parseTags(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string' && !!x.trim()).map((s) => s.trim());
}

function parseTrip(raw: unknown, opts: { regenerateIds: boolean }): Trip {
  if (!isObj(raw)) throw new Error('Trip is not an object');
  const name = typeof raw.name === 'string' ? raw.name : 'Imported trip';
  const travelType =
    typeof raw.travelType === 'string' ? raw.travelType : 'normal';
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
            emptyWeightG:
              typeof b.emptyWeightG === 'number' ? b.emptyWeightG : undefined,
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
        const quantity =
          typeof it.quantity === 'number' && it.quantity > 0 ? Math.floor(it.quantity) : 1;
        const packed = !!it.packed;
        const tags = parseTags(it.tags);
        return [
          {
            id,
            name: it.name,
            weightG,
            bagId,
            allowedBagTypes: allowed && allowed.length ? allowed : undefined,
            quantity,
            packed,
            tags,
          } satisfies Item,
        ];
      })
    : [];

  const customTags = parseTags(raw.customTags);
  const customTravelTypes = Array.isArray(raw.customTravelTypes)
    ? raw.customTravelTypes.flatMap((c) => {
        if (!isObj(c) || typeof c.name !== 'string') return [];
        const bagPresets = Array.isArray(c.bagPresets)
          ? c.bagPresets.flatMap((bp) => {
              if (!isObj(bp) || typeof bp.name !== 'string') return [];
              const type = BAG_TYPES.includes(bp.type as BagType)
                ? (bp.type as BagType)
                : 'backpack';
              return [
                {
                  name: bp.name,
                  type,
                  weightLimitG:
                    typeof bp.weightLimitG === 'number' ? bp.weightLimitG : undefined,
                },
              ];
            })
          : [];
        const itemSuggestions = Array.isArray(c.itemSuggestions)
          ? c.itemSuggestions.flatMap((s) => {
              if (!isObj(s) || typeof s.name !== 'string') return [];
              const w = typeof s.weightG === 'number' ? s.weightG : 0;
              return [
                {
                  name: s.name,
                  weightG: w,
                  tags: parseTags(s.tags),
                  allowedBagTypes: Array.isArray(s.allowedBagTypes)
                    ? (s.allowedBagTypes.filter((t) =>
                        BAG_TYPES.includes(t as BagType),
                      ) as BagType[])
                    : undefined,
                },
              ];
            })
          : [];
        return [
          {
            id: opts.regenerateIds || typeof c.id !== 'string' ? newId() : c.id,
            name: c.name,
            emoji: typeof c.emoji === 'string' ? c.emoji : undefined,
            bagPresets,
            itemSuggestions,
          },
        ];
      })
    : [];

  // Validate built-in travelType or fall back to keeping the custom string id;
  // if neither matches we accept the string anyway (custom types may have been imported).
  const finalTravelType =
    TRAVEL_TYPES.includes(travelType as TravelType) ||
    customTravelTypes.some((c) => c.id === travelType)
      ? travelType
      : 'normal';

  return {
    id: opts.regenerateIds || typeof raw.id !== 'string' ? newId() : (raw.id as string),
    name,
    travelType: finalTravelType,
    createdAt,
    people,
    bags,
    items,
    customTags,
    customTravelTypes,
  };
}

export function parseImport(
  text: string,
  opts: { regenerateIds?: boolean } = {},
): Trip[] {
  const data = JSON.parse(text);
  const regenerateIds = opts.regenerateIds ?? true;

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

export type ItemImport = {
  name: string;
  weightG: number;
  hasWeight: boolean;
  quantity: number;
  packed: boolean;
  tags: string[];
  allowedBagTypes?: BagType[];
};

function parseWeight(v: unknown): number | null {
  if (typeof v === 'number' && isFinite(v) && v >= 0) return v;
  if (typeof v === 'string') {
    const m = v.trim().match(/^(-?\d+(?:[.,]\d+)?)\s*(kg|g)?$/i);
    if (m) {
      const n = parseFloat(m[1].replace(',', '.'));
      if (!isFinite(n) || n < 0) return null;
      return m[2]?.toLowerCase() === 'kg' ? n * 1000 : n;
    }
  }
  return null;
}

export const ITEMS_IMPORT_TEMPLATE = [
  { name: 'Sleeping bag', weightG: 1200, quantity: 1, tags: ['Sovsaker'] },
  { name: 'Tent', weightG: '2.5kg', tags: ['Sovsaker'] },
  { name: 'Cooking kit', weightG: '450g' },
  { name: 'Socks', weightG: 80, quantity: 3, tags: ['Clothing'] },
  { name: 'Item without weight' },
  {
    name: 'Toiletries bag',
    weightG: 380,
    tags: ['Hygien'],
    allowedBagTypes: ['hand_luggage', 'personal'],
  },
];

export function downloadTemplate() {
  downloadJson('bagplanner-items-template', ITEMS_IMPORT_TEMPLATE);
}

export function parseItemsImport(text: string): ItemImport[] {
  const data = JSON.parse(text);
  let rawItems: unknown[];
  if (Array.isArray(data)) rawItems = data;
  else if (isObj(data) && Array.isArray((data as Record<string, unknown>).items)) {
    rawItems = (data as { items: unknown[] }).items;
  } else if (
    isObj(data) &&
    Array.isArray((data as Record<string, unknown>).trips)
  ) {
    rawItems = (data as { trips: unknown[] }).trips.flatMap((t) =>
      isObj(t) && Array.isArray((t as Record<string, unknown>).items)
        ? (t as { items: unknown[] }).items
        : [],
    );
  } else {
    throw new Error('Expected an array of items or { items: [...] }');
  }

  const out: ItemImport[] = [];
  for (const raw of rawItems) {
    if (!isObj(raw)) continue;
    const name = typeof raw.name === 'string' ? raw.name.trim() : '';
    if (!name) continue;
    const parsed = parseWeight(raw.weightG ?? raw.weight);
    const allowed = Array.isArray(raw.allowedBagTypes)
      ? (raw.allowedBagTypes.filter((t) => BAG_TYPES.includes(t as BagType)) as BagType[])
      : undefined;
    const quantity =
      typeof raw.quantity === 'number' && raw.quantity > 0 ? Math.floor(raw.quantity) : 1;
    out.push({
      name,
      weightG: parsed ?? 0,
      hasWeight: parsed !== null,
      quantity,
      packed: !!raw.packed,
      tags: parseTags(raw.tags),
      allowedBagTypes: allowed && allowed.length ? allowed : undefined,
    });
  }
  if (!out.length) throw new Error('No valid items found');
  return out;
}
