import { useMemo } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Item, ItemSuggestion, Trip, TravelType } from '@/lib/bag-planner/types';
import { TRAVEL_SUGGESTIONS } from '@/lib/bag-planner/presets';
import { formatWeight } from '@/lib/bag-planner/format';
import { loadCustomTravelTypes } from '@/hooks/use-custom-travel-types';

const BUILTIN: TravelType[] = ['hiking', 'normal', 'camping', 'business', 'beach'];

export function SuggestionsPopover({
  trip,
  onAdd,
}: {
  trip: Trip;
  onAdd: (item: Partial<Item> & { name: string; weightG: number }) => void;
}) {
  const suggestions = useMemo<ItemSuggestion[]>(() => {
    const t = trip.travelType as TravelType;
    if (BUILTIN.includes(t)) return TRAVEL_SUGGESTIONS[t] ?? [];
    const fromTrip = trip.customTravelTypes.find((c) => c.id === trip.travelType);
    if (fromTrip?.itemSuggestions?.length) return fromTrip.itemSuggestions;
    const fromGlobal = loadCustomTravelTypes().find((c) => c.id === trip.travelType);
    return fromGlobal?.itemSuggestions ?? [];
  }, [trip]);


  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Suggestions
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <div className="mb-1 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Suggestions for this travel type
        </div>
        {suggestions.length === 0 ? (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            No suggestions for this travel type.
          </div>
        ) : (
          <div className="space-y-0.5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  onAdd({
                    name: s.name,
                    weightG: s.weightG,
                    tags: s.tags ?? [],
                    allowedBagTypes: s.allowedBagTypes,
                  })
                }
                className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{s.name}</div>
                  {s.tags?.length ? (
                    <div className="truncate text-[10px] text-muted-foreground">
                      {s.tags.join(' · ')}
                    </div>
                  ) : null}
                </div>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {formatWeight(s.weightG)}
                </span>
                <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
