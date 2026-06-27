## Plan: Packlista, taggar, antal, förslag, utskrift

### 1. Datamodell (`src/lib/bag-planner/types.ts`)
- `Item`: lägg till `quantity: number` (default 1), `packed: boolean` (default false), `tags: string[]`.
- `Trip`: lägg till `customTags: string[]` (egna taggar per trip) och `customTravelTypes: CustomTravelType[]`.
- Ny typ `CustomTravelType { id, name, bagPresets: BagType[], itemSuggestions: ItemSuggestion[] }`.
- Ny typ `ItemSuggestion { name, weightG, tags?, allowedBagTypes? }`.
- All viktsummering (bagg-vikt, weight bar, totalvikt per person) använder `weightG * quantity`.

### 2. Presets (`src/lib/bag-planner/presets.ts`)
- `GLOBAL_TAGS`: Kläder, Elektronik, Hygien, Mat, Sovsaker, Dokument, Verktyg, Första hjälpen.
- `TRAVEL_SUGGESTIONS`: 3 förslag per inbyggd resetyp (Hiking, Normal, Camping, Business, Beach) med namn, vikt, taggar.

### 3. Hook (`src/hooks/use-trip.ts`)
- Nya actions: `setItemQuantity`, `toggleItemPacked`, `setItemTags`, `addCustomTag`, `removeCustomTag`, `addCustomTravelType`, `updateCustomTravelType`, `removeCustomTravelType`.
- Hjälpare: `getPersonTotalWeight(tripId, personId)`, `getBagWeight(bag)` (båda kvantitetsmedvetna).

### 4. UI-komponenter
- **`ItemRow.tsx`**: kryssruta (packed), quantity stepper (− 1 +), tagg-badges, "Vikt saknas"-badge (orange) när `weightG === 0`. Edit-dialogen får quantity-fält och tagg-väljare.
- **`BagCard.tsx`**: tydlig varningsbadge ("Ingen bärare") på bag utan `carrierId` — orange ram + ikon i header.
- **`TagPicker.tsx`** (ny): multi-select över globala + trip-egna taggar, "+ Skapa tagg" inline.
- **`SuggestionsPopover.tsx`** (ny): knapp "Förslag" i UnpackedTray som öppnar popover med 3+ förslag per resetyp (inkl. egna). Klick → lägger till i Unpacked.
- **`CustomTravelTypeDialog.tsx`** (ny): hantera trip-egna resetyper (namn, bag-presets, item-förslag). Nås från trip-header.
- **`ImportItemsDialog.tsx`** (ny från tidigare plan): förhandsgranskning före import, "Vikt saknas"-badge på rader utan vikt, redigerbara fält + radera-knapp.

### 5. Packlista-vy
- **Inline checkboxar** i alla ItemRow (bag + Unpacked).
- **Ny route `/trips/$tripId/checklist`**: grupperad vy (per bag / per person / per tagg — togglebar), kryssrutor, progress-bar ("12/34 packat"), filter på tagg.
- **Utskriftsvy `/trips/$tripId/print`**: ren A4-layout, dolda kontroller, `@media print`-stilar, "Skriv ut"-knapp som triggar `window.print()`. Visar bagg, bärare, items med antal + vikt + taggar + kryssruta-glyf.

### 6. Trip-header (`src/routes/trips.$tripId.tsx`)
- Nya knappar: **Packlista**, **Skriv ut**, **Förslag**, **Egna resetyper**.
- Totalvikt per person visas i PersonChip (tooltip eller liten siffra under namnet).

### 7. Import/Export (`src/lib/bag-planner/trip-io.ts`)
- Trip-export inkluderar `customTags`, `customTravelTypes`, och per item: `quantity`, `packed`, `tags`.
- `parseItemsImport`: accepterar `tags`, `quantity`, `packed` i objekten; uppdatera template med exempel.
- Bakåtkompatibel parse: saknade fält får defaults.

### Filer
**Nya:** `src/components/bag-planner/TagPicker.tsx`, `SuggestionsPopover.tsx`, `CustomTravelTypeDialog.tsx`, `ImportItemsDialog.tsx`, `routes/trips.$tripId.checklist.tsx`, `routes/trips.$tripId.print.tsx`.
**Edit:** `types.ts`, `presets.ts`, `trip-io.ts`, `use-trip.ts`, `ItemRow.tsx`, `EditItemDialog.tsx`, `BagCard.tsx`, `UnpackedTray.tsx`, `PersonChip.tsx`, `routes/trips.$tripId.tsx`.
