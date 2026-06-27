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
    { name: 'Tent (2p)', weightG: 2200, tags: ['Sleep gear'] },
    { name: 'Sleeping bag', weightG: 1200, tags: ['Sleep gear'] },
    { name: 'Sleeping pad', weightG: 500, tags: ['Sleep gear'] },
    { name: 'Camp stove', weightG: 450, tags: ['Food'] },
    { name: 'Cookset & utensils', weightG: 500, tags: ['Food'] },
    { name: 'Water filter', weightG: 350, tags: ['Tools'] },
    { name: 'Water bottle (1L)', weightG: 600, tags: ['Food'] },
    { name: 'Rain jacket', weightG: 350, tags: ['Clothing'] },
    { name: 'Hiking boots', weightG: 1200, tags: ['Clothing'] },
    { name: 'Trekking poles', weightG: 500, tags: ['Tools'] },
    { name: 'Headlamp', weightG: 90, tags: ['Electronics'] },
    { name: 'First-aid kit', weightG: 250, tags: ['First aid'] },
    { name: 'Map & compass', weightG: 120, tags: ['Tools'] },
    { name: 'Trail snacks', weightG: 500, tags: ['Food'] },
    { name: 'Power bank', weightG: 220, tags: ['Electronics'] },
  ],
  normal: [
    { name: 'Passport', weightG: 50, tags: ['Documents'], allowedBagTypes: ['hand_luggage', 'personal'] },
    { name: 'Wallet', weightG: 120, tags: ['Documents'], allowedBagTypes: ['hand_luggage', 'personal'] },
    { name: 'Phone charger', weightG: 80, tags: ['Electronics'] },
    { name: 'Travel adapter', weightG: 90, tags: ['Electronics'] },
    { name: 'Power bank', weightG: 220, tags: ['Electronics'] },
    { name: 'Headphones', weightG: 250, tags: ['Electronics'] },
    { name: 'Toothbrush & paste', weightG: 90, tags: ['Hygiene'] },
    { name: 'Toiletries bag', weightG: 600, tags: ['Hygiene'] },
    { name: 'T-shirt', weightG: 180, tags: ['Clothing'] },
    { name: 'Jeans', weightG: 700, tags: ['Clothing'] },
    { name: 'Underwear', weightG: 60, tags: ['Clothing'] },
    { name: 'Socks', weightG: 60, tags: ['Clothing'] },
    { name: 'Sneakers', weightG: 800, tags: ['Clothing'] },
    { name: 'Sunglasses', weightG: 30, tags: ['Clothing'] },
    { name: 'Medication', weightG: 100, tags: ['First aid'], allowedBagTypes: ['hand_luggage', 'personal'] },
    { name: 'Book', weightG: 350, tags: [] },
  ],
  camping: [
    { name: 'Tent (4p)', weightG: 5500, tags: ['Sleep gear'] },
    { name: 'Sleeping bag', weightG: 1500, tags: ['Sleep gear'] },
    { name: 'Sleeping pad', weightG: 800, tags: ['Sleep gear'] },
    { name: 'Pillow', weightG: 300, tags: ['Sleep gear'] },
    { name: 'Camp stove', weightG: 1200, tags: ['Food'] },
    { name: 'Gas canister', weightG: 450, tags: ['Food'] },
    { name: 'Cookset', weightG: 900, tags: ['Food'] },
    { name: 'Cooler', weightG: 3000, tags: ['Food'] },
    { name: 'Camp chair', weightG: 1800, tags: ['Tools'] },
    { name: 'Lantern', weightG: 350, tags: ['Electronics'] },
    { name: 'Headlamp', weightG: 90, tags: ['Electronics'] },
    { name: 'Firestarter', weightG: 80, tags: ['Tools'] },
    { name: 'Axe / saw', weightG: 900, tags: ['Tools'] },
    { name: 'Tarp', weightG: 700, tags: ['Sleep gear'] },
    { name: 'First-aid kit', weightG: 350, tags: ['First aid'] },
  ],
  business: [
    { name: 'Laptop', weightG: 1400, tags: ['Electronics'], allowedBagTypes: ['laptop_bag', 'hand_luggage'] },
    { name: 'Laptop charger', weightG: 350, tags: ['Electronics'], allowedBagTypes: ['laptop_bag', 'hand_luggage'] },
    { name: 'Phone charger', weightG: 80, tags: ['Electronics'] },
    { name: 'Travel adapter', weightG: 90, tags: ['Electronics'] },
    { name: 'Dress shirt', weightG: 220, tags: ['Clothing'] },
    { name: 'Suit jacket', weightG: 700, tags: ['Clothing'] },
    { name: 'Dress trousers', weightG: 500, tags: ['Clothing'] },
    { name: 'Dress shoes', weightG: 900, tags: ['Clothing'] },
    { name: 'Tie', weightG: 50, tags: ['Clothing'] },
    { name: 'Belt', weightG: 200, tags: ['Clothing'] },
    { name: 'Notebook', weightG: 250, tags: ['Documents'] },
    { name: 'Pen', weightG: 15, tags: ['Documents'] },
    { name: 'Business cards', weightG: 50, tags: ['Documents'] },
    { name: 'Toiletries bag', weightG: 500, tags: ['Hygiene'] },
    { name: 'Passport', weightG: 50, tags: ['Documents'], allowedBagTypes: ['hand_luggage', 'laptop_bag', 'personal'] },
  ],
  beach: [
    { name: 'Swimsuit', weightG: 150, tags: ['Clothing'] },
    { name: 'Beach towel', weightG: 350, tags: ['Clothing'] },
    { name: 'Sunscreen', weightG: 200, tags: ['Hygiene'] },
    { name: 'Sunglasses', weightG: 30, tags: ['Clothing'] },
    { name: 'Flip-flops', weightG: 250, tags: ['Clothing'] },
    { name: 'Sun hat', weightG: 120, tags: ['Clothing'] },
    { name: 'Snorkel & mask', weightG: 400, tags: ['Tools'] },
    { name: 'Beach book', weightG: 350, tags: [] },
    { name: 'Water bottle', weightG: 600, tags: ['Food'] },
    { name: 'After-sun lotion', weightG: 200, tags: ['Hygiene'] },
    { name: 'Cover-up', weightG: 180, tags: ['Clothing'] },
    { name: 'Bluetooth speaker', weightG: 400, tags: ['Electronics'] },
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
