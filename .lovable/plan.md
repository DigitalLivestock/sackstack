# Bag Planner — Phase 1 Plan

Build a responsive **web app** for planning bag weights on a trip. Desktop gets rich drag-and-drop; mobile gets touch-friendly menus. No backend, no auth yet — all data in `localStorage`. Code is structured so a future Capacitor wrap (Android/iOS) is a drop-in step.

## Scope (Phase 1, web only)

- Create trips, pick a travel type, get a starter set of bags.
- Add people, assign each bag to a person (carrier).
- Add items with weight; move them between bags or "unpacked".
- Live total weight per bag with a weight bar + soft limit.
- Bag-type restrictions (e.g. hand luggage disallows certain items).
- Works offline via `localStorage`.

## Interaction model

- **Desktop (≥768px):** drag items between bags and the "Unpacked" tray. Drop zones highlight; disallowed bags show a red "not allowed" state during drag. Drag a bag onto a person chip to assign carrier.
- **Mobile / touch:** tap an item → "Move to…" menu listing allowed bags. Tap a bag → "Assign to…" menu listing people. (Drag-and-drop libs we use also support touch, but menus stay as the primary mobile path so it never feels fiddly.)
- Library: `@dnd-kit/core` + `@dnd-kit/sortable` (works for mouse, touch, keyboard; accessible).

## Portability strategy

- Pure React + TypeScript, storage isolated behind one `useTrip` hook.
- Responsive down to 360px; menu-based mobile path means no desktop-only blockers when wrapped with Capacitor later.
- No browser-only APIs beyond `localStorage` (later swappable for `@capacitor/preferences` or cloud).

## Data model

```ts
type TravelType = 'hiking' | 'normal' | 'camping' | 'business' | 'beach';
type BagType = 'backpack' | 'daypack' | 'suitcase' | 'hand_luggage'
             | 'personal' | 'roof_box' | 'cooler' | 'tent_bag'
             | 'laptop_bag' | 'beach_bag' | 'hip_belt';

type Person = { id: string; name: string; color: string };
type Bag = {
  id: string; name: string; type: BagType;
  carrierId?: string;
  weightLimitG?: number;
};
type Item = {
  id: string; name: string; weightG: number;
  bagId?: string;              // undefined = unpacked
  allowedBagTypes?: BagType[];
};
type Trip = {
  id: string; name: string; travelType: TravelType;
  people: Person[]; bags: Bag[]; items: Item[];
  createdAt: number;
};
```

## State

`useTrip(tripId)` hook, persisted to `localStorage` key `bagplanner:trips`.
Actions: `addBag`, `updateBag`, `removeBag`, `addItem`, `updateItem`, `moveItem`, `removeItem`, `addPerson`, `removePerson`, `assignCarrier`.

## Travel-type presets

- Hiking: Backpack, Daypack, Hip belt
- Normal: Suitcase, Hand luggage, Personal item
- Camping: Roof box, Cooler, Tent bag, Backpack
- Business: Carry-on, Laptop bag
- Beach: Suitcase, Beach bag, Hand luggage

## Routes

- `/` — list trips + "New trip" CTA
- `/trips/new` — name + travel type picker
- `/trips/$tripId` — main planner

## Planner layout

- Mobile: single column — People strip → Bags → Unpacked tray.
- ≥768px: two columns — Bags grid left, Unpacked tray right (sticky); People strip on top. Drag enabled.

## Components

`TripCard`, `TravelTypePicker`, `PersonChip` (drop target for bag assignment), `AddPersonDialog`, `BagCard` (droppable), `WeightBar`, `ItemRow` (draggable), `AddItemForm`, `AddBagDialog`, `UnpackedTray` (droppable), `AssignCarrierMenu`, `MoveToBagMenu`.

## Design

Clean, app-like, restrained. Color-coded people. Weight bars turn amber/red near/over limit. 44px tap targets. Visible drop-zone highlights, disallowed-target shake on desktop drop.

## Later phases (not now)

- Phase 2: Enable Lovable Cloud, email auth, migrate `useTrip` to server functions + DB with RLS, real multi-user collaboration.
- Phase 3: Wrap with Capacitor for Android + iOS.
