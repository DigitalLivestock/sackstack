import type { Bag, BagType, TravelType } from './types';

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
  return TRAVEL_PRESETS[travelType].map((b) => ({
    id: crypto.randomUUID(),
    ...b,
  }));
}

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
