import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrip } from '@/hooks/use-trip';
import { bagEmptyWeight, itemWeight, travelTypeLabel } from '@/lib/bag-planner/types';
import { formatWeight } from '@/lib/bag-planner/format';

export const Route = createFileRoute('/trips/$tripId/print')({
  component: PrintView,
});

function PrintView() {
  const { tripId } = Route.useParams();
  const { trip } = useTrip(tripId);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Button asChild>
          <Link to="/">Back</Link>
        </Button>
      </div>
    );
  }

  const unpacked = trip.items.filter(
    (i) => !i.bagId || !trip.bags.some((b) => b.id === i.bagId),
  );
  const totalAll =
    trip.items.reduce((s, i) => s + itemWeight(i), 0) +
    trip.bags.reduce((s, b) => s + bagEmptyWeight(b), 0);

  return (
    <div className="min-h-screen bg-white text-black">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .page-break-avoid { break-inside: avoid; }
        }
      `}</style>
      <header className="no-print sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/trips/$tripId" params={{ tripId }} aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="flex-1 truncate text-base font-semibold">Print — {trip.name}</h1>
          <Button onClick={() => window.print()} size="sm">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8 print:px-0 print:py-0">
        <div>
          <h1 className="text-2xl font-bold">Packing list — {trip.name}</h1>
          <p className="text-sm text-gray-700">
            {travelTypeLabel(trip)} · {trip.bags.length} bags · {trip.items.length} items ·{' '}
            Total weight {formatWeight(totalAll)}
          </p>
          {trip.people.length ? (
            <p className="mt-1 text-sm">
              <span className="font-semibold">People: </span>
              {trip.people
                .map((p) => {
                  const w = trip.bags
                    .filter((b) => b.carrierId === p.id)
                    .reduce(
                      (s, b) =>
                        s +
                        bagEmptyWeight(b) +
                        trip.items
                          .filter((i) => i.bagId === b.id)
                          .reduce((ss, i) => ss + itemWeight(i), 0),
                      0,
                    );
                  return `${p.name} (${formatWeight(w)})`;
                })
                .join(', ')}
            </p>
          ) : null}
        </div>

        {trip.bags.map((bag) => {
          const items = trip.items.filter((i) => i.bagId === bag.id);
          const itemsTotal = items.reduce((s, i) => s + itemWeight(i), 0);
          const total = itemsTotal + bagEmptyWeight(bag);
          const carrier = trip.people.find((p) => p.id === bag.carrierId);
          return (
            <section
              key={bag.id}
              className="page-break-avoid rounded-md border border-gray-300 p-4"
            >
              <div className="mb-2 flex items-baseline justify-between border-b border-gray-200 pb-1">
                <h2 className="text-lg font-semibold">
                  {bag.name}
                  {!carrier ? (
                    <span className="ml-2 rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700">
                      No carrier
                    </span>
                  ) : null}
                </h2>
                <div className="text-sm text-gray-600">
                  {carrier ? `Carried by ${carrier.name}` : ''} · {formatWeight(total)}
                  {bag.weightLimitG ? ` / ${formatWeight(bag.weightLimitG)}` : ''}
                  {bag.emptyWeightG ? ` (bag ${formatWeight(bag.emptyWeightG)})` : ''}
                </div>
              </div>
              {items.length === 0 ? (
                <p className="text-sm italic text-gray-500">Empty</p>
              ) : (
                <ul className="space-y-1">
                  {items.map((i) => (
                    <li key={i.id} className="flex items-center gap-2 text-sm">
                      <span className="inline-block h-4 w-4 shrink-0 border border-gray-500" />
                      <span className="flex-1">
                        {i.name}
                        {i.quantity > 1 ? (
                          <span className="text-gray-600"> × {i.quantity}</span>
                        ) : null}
                        {i.tags.length ? (
                          <span className="ml-2 text-xs text-gray-500">[{i.tags.join(', ')}]</span>
                        ) : null}
                      </span>
                      <span className="tabular-nums text-gray-700">
                        {formatWeight(itemWeight(i))}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}

        {unpacked.length ? (
          <section className="page-break-avoid rounded-md border border-dashed border-gray-400 p-4">
            <h2 className="mb-2 text-lg font-semibold">Unpacked</h2>
            <ul className="space-y-1">
              {unpacked.map((i) => (
                <li key={i.id} className="flex items-center gap-2 text-sm">
                  <span className="inline-block h-4 w-4 shrink-0 border border-gray-500" />
                  <span className="flex-1">
                    {i.name}
                    {i.quantity > 1 ? <span className="text-gray-600"> × {i.quantity}</span> : null}
                  </span>
                  <span className="tabular-nums text-gray-700">
                    {formatWeight(itemWeight(i))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}
