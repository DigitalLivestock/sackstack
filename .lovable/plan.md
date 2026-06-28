## Add tag filter to item lists

Extend the existing item filter/sort controls (Unpacked tray and each Bag card) so items can be filtered by tag, in addition to the current packed/unpacked/missing-weight filters and name/weight sorts.

### Scope

- Tag filtering only on the main trip view (Unpacked + Bags). The Checklist view already has its own tag filter and stays as-is.
- No changes to data model, storage, or import/export — tags already exist on items.

### Changes

1. `src/components/bag-planner/ItemFilterBar.tsx`
   - Extend filter state: add an optional `tagFilter: string | null` plus `availableTags: string[]` props on both `ItemFilterBar` and `CompactItemFilterBar`.
   - In `CompactItemFilterBar` popover, add a "Tag" section listing available tags as toggle chips (single-select; click again to clear). Show the active-dot indicator when a tag is selected too.
   - In `applyItemFilterSort`, accept an optional `tagFilter` and filter items whose `tags` include it. Keep the existing status filter and sort behavior unchanged (status + tag combine with AND).

2. `src/components/bag-planner/UnpackedTray.tsx`
   - Add `tagFilter` state alongside `filter`/`sort`.
   - Compute the available tag list from `trip.customTags`, `GLOBAL_TAGS`, and tags actually present on the unpacked items (deduped).
   - Pass tag props to `CompactItemFilterBar` and `applyItemFilterSort`.

3. `src/components/bag-planner/BagCard.tsx` (uses the same compact filter bar)
   - Same treatment: add `tagFilter` state, compute available tags from that bag's items (plus trip tags), wire into the compact bar and `applyItemFilterSort`.

### Notes

- Tag list source per location: union of `GLOBAL_TAGS`, `trip.customTags`, and tags on the items in scope, so the popover doesn't show irrelevant tags.
- Clearing filters (existing "Clear" action) also clears `tagFilter`.
- No new dependencies; UI-only change in the bag-planner components.
