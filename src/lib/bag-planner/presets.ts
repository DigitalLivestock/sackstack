import type { Bag, BagType, ItemSuggestion, TravelType } from './types';

type PresetBag = { name: string; type: BagType; weightLimitG?: number };

export const TRAVEL_PRESETS: Record<TravelType, PresetBag[]> = {
  hiking: [
    { name: 'Backpack', type: 'backpack', weightLimitG: 12000 },
    { name: 'Daypack', type: 'daypack', weightLimitG: 5000 },
    { name: 'Hip belt', type: 'hip_belt', weightLimitG: 1500 },
  ],
  normal: [
    { name: 'Suitcase', type: 'suitcase', weightLimitG: 23000 },
    { name: 'Hand luggage', type: 'hand_luggage', weightLimitG: 8000 },
    { name: 'Personal item', type: 'personal', weightLimitG: 3000 },
  ],
  camping: [
    { name: 'Roof box', type: 'roof_box', weightLimitG: 50000 },
    { name: 'Cooler', type: 'cooler', weightLimitG: 15000 },
    { name: 'Tent bag', type: 'tent_bag', weightLimitG: 10000 },
    { name: 'Backpack', type: 'backpack', weightLimitG: 12000 },
  ],
  business: [
    { name: 'Carry-on', type: 'hand_luggage', weightLimitG: 8000 },
    { name: 'Laptop bag', type: 'laptop_bag', weightLimitG: 4000 },
  ],
  beach: [
    { name: 'Suitcase', type: 'suitcase', weightLimitG: 23000 },
    { name: 'Beach bag', type: 'beach_bag', weightLimitG: 5000 },
    { name: 'Hand luggage', type: 'hand_luggage', weightLimitG: 8000 },
  ],
};

export function buildPresetBags(travelType: TravelType): Bag[] {
  const presets = TRAVEL_PRESETS[travelType] ?? [];
  return presets.map((b) => ({ id: crypto.randomUUID(), ...b }));
}

export function buildBagsFromPresets(presets: PresetBag[]): Bag[] {
  return presets.map((b) => ({ id: crypto.randomUUID(), ...b }));
}

export const TRAVEL_SUGGESTIONS: Record<TravelType, ItemSuggestion[]> = {
  hiking: [
    { name: 'Sovsäck', weightG: 1200, tags: ['Sovsaker'] },
    { name: 'Vattenflaska', weightG: 600, tags: ['Mat'] },
    { name: 'Pannlampa', weightG: 90, tags: ['Elektronik'] },
  ],
  normal: [
    { name: 'Pass', weightG: 50, tags: ['Dokument'], allowedBagTypes: ['hand_luggage', 'personal'] },
    { name: 'Laddare', weightG: 150, tags: ['Elektronik'] },
    { name: 'Tandborste', weightG: 20, tags: ['Hygien'] },
  ],
  camping: [
    { name: 'Tält', weightG: 3000, tags: ['Sovsaker'] },
    { name: 'Stormkök', weightG: 450, tags: ['Mat'] },
    { name: 'Sovkudde', weightG: 300, tags: ['Sovsaker'] },
  ],
  business: [
    { name: 'Laptop', weightG: 1400, tags: ['Elektronik'], allowedBagTypes: ['laptop_bag', 'hand_luggage'] },
    { name: 'Skjorta', weightG: 220, tags: ['Kläder'] },
    { name: 'Notisblock', weightG: 180, tags: ['Dokument'] },
  ],
  beach: [
    { name: 'Solkräm', weightG: 200, tags: ['Hygien'] },
    { name: 'Badhandduk', weightG: 350, tags: ['Kläder'] },
    { name: 'Solglasögon', weightG: 30, tags: ['Kläder'] },
  ],
};

export const PERSON_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];
