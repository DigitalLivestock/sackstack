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
};

export type Trip = {
  id: string;
  name: string;
  travelType: TravelType;
  people: Person[];
  bags: Bag[];
  items: Item[];
  createdAt: number;
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
