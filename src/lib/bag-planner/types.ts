export type TravelType = 'hiking' | 'normal' | 'camping' | 'business' | 'beach';

export type BagType =
  | 'backpack'
  | 'daypack'
  | 'suitcase'
  | 'hand_luggage'
  | 'personal'
  | 'roof_box'
  | 'cooler'
  | 'tent_bag'
  | 'laptop_bag'
  | 'beach_bag'
  | 'hip_belt';

export type Person = { id: string; name: string; color: string };

export type Bag = {
  id: string;
  name: string;
  type: BagType;
  carrierId?: string;
  weightLimitG?: number;
};

export type Item = {
  id: string;
  name: string;
  weightG: number;
  bagId?: string;
  allowedBagTypes?: BagType[];
  quantity: number;
  packed: boolean;
  tags: string[];
};

export type ItemSuggestion = {
  name: string;
  weightG: number;
  tags?: string[];
  allowedBagTypes?: BagType[];
};

export type CustomTravelType = {
  id: string;
  name: string;
  emoji?: string;
  bagPresets: { name: string; type: BagType; weightLimitG?: number }[];
  itemSuggestions: ItemSuggestion[];
};

export type Trip = {
  id: string;
  name: string;
  travelType: TravelType | string; // built-in id or custom id
  people: Person[];
  bags: Bag[];
  items: Item[];
  createdAt: number;
  customTags: string[];
  customTravelTypes: CustomTravelType[];
};

export const BAG_TYPE_LABELS: Record<BagType, string> = {
  backpack: 'Backpack',
  daypack: 'Daypack',
  suitcase: 'Suitcase',
  hand_luggage: 'Hand luggage',
  personal: 'Personal item',
  roof_box: 'Roof box',
  cooler: 'Cooler',
  tent_bag: 'Tent bag',
  laptop_bag: 'Laptop bag',
  beach_bag: 'Beach bag',
  hip_belt: 'Hip belt',
};

export const TRAVEL_TYPE_LABELS: Record<TravelType, string> = {
  hiking: 'Hiking',
  normal: 'Normal travel',
  camping: 'Camping',
  business: 'Business',
  beach: 'Beach',
};

export const TRAVEL_TYPE_EMOJI: Record<TravelType, string> = {
  hiking: '🥾',
  normal: '🧳',
  camping: '🏕️',
  business: '💼',
  beach: '🏖️',
};

export const GLOBAL_TAGS = [
  'Kläder',
  'Elektronik',
  'Hygien',
  'Mat',
  'Sovsaker',
  'Dokument',
  'Verktyg',
  'Första hjälpen',
];

export function itemWeight(i: Pick<Item, 'weightG' | 'quantity'>): number {
  return i.weightG * Math.max(1, i.quantity ?? 1);
}

export function travelTypeLabel(trip: Pick<Trip, 'travelType' | 'customTravelTypes'>): string {
  const t = trip.travelType as TravelType;
  if (t in TRAVEL_TYPE_LABELS) return TRAVEL_TYPE_LABELS[t];
  return trip.customTravelTypes?.find((c) => c.id === trip.travelType)?.name ?? 'Custom';
}

export function travelTypeEmoji(trip: Pick<Trip, 'travelType' | 'customTravelTypes'>): string {
  const t = trip.travelType as TravelType;
  if (t in TRAVEL_TYPE_EMOJI) return TRAVEL_TYPE_EMOJI[t];
  return trip.customTravelTypes?.find((c) => c.id === trip.travelType)?.emoji ?? '🎒';
}
