import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Luggage, Plus, Trash2 } from 'lucide-react';
import { useTrips } from '@/hooks/use-trip';
import { Button } from '@/components/ui/button';
import { TRAVEL_TYPE_EMOJI, TRAVEL_TYPE_LABELS } from '@/lib/bag-planner/types';
import { formatWeight } from '@/lib/bag-planner/format';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Bag Planner — plan and balance your packing' },
      {
        name: 'description',
        content:
          'Plan bag weights for any trip. Split items across bags, assign carriers, and never overpack again.',
      },
      { property: 'og:title', content: 'Bag Planner' },
      {
        property: 'og:description',
        content: 'Plan bag weights for any trip with people, bags, and item weights.',
      },
    ],
  }),
  component: TripsIndex,
});

function TripsIndex() {
  const { trips, deleteTrip } = useTrips();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-foreground text-background">
            <Luggage className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold">Bag Planner</h1>
            <p className="truncate text-xs text-muted-foreground">
              Plan and balance the weight of your bags before a trip.
            </p>
          </div>
          <Button onClick={() => navigate({ to: '/trips/new' })}>
            <Plus className="h-4 w-4" />
            New trip
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {trips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-muted text-2xl">
              🧳
            </div>
            <h2 className="text-lg font-semibold">No trips yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first trip to start planning bags and items.
            </p>
            <Button className="mt-6" onClick={() => navigate({ to: '/trips/new' })}>
              <Plus className="h-4 w-4" />
              Create a trip
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trips
              .slice()
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((trip) => {
                const total = trip.items.reduce((s, i) => s + i.weightG, 0);
                return (
                  <div
                    key={trip.id}
                    className="group relative rounded-xl border border-border bg-card p-5 transition-all hover:shadow-sm"
                  >
                    <Link
                      to="/trips/$tripId"
                      params={{ tripId: trip.id }}
                      className="block"
                    >
                      <div className="text-2xl">{TRAVEL_TYPE_EMOJI[trip.travelType]}</div>
                      <div className="mt-3 truncate text-base font-semibold">
                        {trip.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {TRAVEL_TYPE_LABELS[trip.travelType]}
                      </div>
                      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{trip.bags.length} bags</span>
                        <span>·</span>
                        <span>{trip.items.length} items</span>
                        <span>·</span>
                        <span className="tabular-nums">{formatWeight(total)}</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Delete trip "${trip.name}"?`)) deleteTrip(trip.id);
                      }}
                      className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-destructive group-hover:opacity-100"
                      aria-label="Delete trip"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </main>
    </div>
  );
}
