import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTrips } from '@/hooks/use-trip';
import { useCustomTravelTypes } from '@/hooks/use-custom-travel-types';
import {
  TRAVEL_TYPE_EMOJI,
  TRAVEL_TYPE_LABELS,
  type TravelType,
} from '@/lib/bag-planner/types';
import { TRAVEL_PRESETS } from '@/lib/bag-planner/presets';
import { ManageCustomTravelTypesDialog } from '@/components/bag-planner/ManageCustomTravelTypesDialog';

const TRAVEL_TYPES = Object.keys(TRAVEL_TYPE_LABELS) as TravelType[];

export const Route = createFileRoute('/trips/new')({
  head: () => ({
    meta: [
      { title: 'New trip — Sack Stack' },
      { name: 'description', content: 'Start a new packing plan: pick a travel type, name your trip, and begin balancing the weight of each bag.' },
      { property: 'og:title', content: 'New trip — Sack Stack' },
      { property: 'og:description', content: 'Start a new packing plan: pick a travel type, name your trip, and begin balancing the weight of each bag.' },
      { property: 'og:url', content: 'https://sackstack.app/trips/new' },
    ],
    links: [{ rel: 'canonical', href: 'https://sackstack.app/trips/new' }],
  }),
  component: NewTrip,
});

function NewTrip() {
  const navigate = useNavigate();
  const { createTrip } = useTrips();
  const { types: customTypes } = useCustomTravelTypes();
  const [name, setName] = useState('');
  const [travelType, setTravelType] = useState<string>('normal');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const trip = createTrip(name.trim(), travelType as TravelType);
    navigate({ to: '/trips/$tripId', params: { tripId: trip.id } });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-4">
          <Button asChild variant="ghost" size="icon">
            <Link to="/" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="flex-1 text-lg font-semibold">New trip</h1>
          <ManageCustomTravelTypesDialog />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <form onSubmit={submit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="trip-name">Trip name</Label>
            <Input
              id="trip-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Norway hiking, July"
            />
          </div>

          <div className="space-y-3">
            <Label>Travel type</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TRAVEL_TYPES.map((t) => {
                const selected = travelType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTravelType(t)}
                    className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all ${
                      selected
                        ? 'border-foreground bg-accent ring-2 ring-foreground/10'
                        : 'border-border bg-card hover:border-foreground/30'
                    }`}
                  >
                    <span className="text-2xl">{TRAVEL_TYPE_EMOJI[t]}</span>
                    <span className="font-medium">{TRAVEL_TYPE_LABELS[t]}</span>
                    <span className="text-xs text-muted-foreground">
                      {TRAVEL_PRESETS[t].length} starter bags
                    </span>
                  </button>
                );
              })}
              {customTypes.map((c) => {
                const selected = travelType === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setTravelType(c.id)}
                    className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all ${
                      selected
                        ? 'border-foreground bg-accent ring-2 ring-foreground/10'
                        : 'border-border bg-card hover:border-foreground/30'
                    }`}
                  >
                    <span className="text-2xl">{c.emoji ?? '🎒'}</span>
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {c.bagPresets?.length ?? 0} starter bags · custom
                    </span>
                  </button>
                );
              })}
            </div>
            {customTypes.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Need a different setup? Define your own travel type from the button above.
              </p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" asChild>
              <Link to="/">Cancel</Link>
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create trip
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
