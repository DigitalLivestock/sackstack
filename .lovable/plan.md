
## Scope
Make the "Add carrier" control match the "Add bag" button in both placement and appearance.

## Details
1. Create `AddPersonDialog` component (new file or replace `AddPersonInline`) that uses a `<Dialog>` + `<DialogTrigger>` pattern, identical to `AddBagDialog`.
   - Trigger: `<Button variant="outline" size="sm"><Plus className="h-4 w-4" /> Add carrier</Button>`
   - Dialog content: name input + color picker (reuse existing color logic from `PersonChip` if any).
2. In `src/routes/trips.$tripId.tsx`, move the trigger into the Carriers section header row, replacing the inline `AddPersonInline` element and removing the hint text that occupies that space.
3. Remove or deprecate `src/components/bag-planner/AddPersonInline.tsx` (no longer used).

## Files touched
- `src/components/bag-planner/AddPersonDialog.tsx` — new dialog component.
- `src/routes/trips.$tripId.tsx` — swap `AddPersonInline` for `AddPersonDialog` trigger in the header row.
- `src/components/bag-planner/AddPersonInline.tsx` — delete (optional, can orphan).

## Out of scope
- No changes to person data model, colors, or editing behavior.
- No other UI changes.
