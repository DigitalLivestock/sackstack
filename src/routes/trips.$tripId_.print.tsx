import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrip } from '@/hooks/use-trip';
import { bagEmptyWeight, itemWeight, travelTypeLabel } from '@/lib/bag-planner/types';
import { useDisplayUnit } from '@/hooks/use-display-unit';
import logoSvg from '@/assets/logo.svg';

export const Route = createFileRoute('/trips/$tripId_/print')({
  component: PrintView,
});

function PrintView() {
  const { tripId } = Route.useParams();
  const { trip } = useTrip(tripId);
  const { format } = useDisplayUnit();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const carriers = useMemo(() => {
    if (!trip) return [];
    return trip.people.map((p) => {
      const bags = trip.bags.filter((b) => b.carrierId === p.id);
      const w = bags.reduce(
        (s, b) =>
          s +
          bagEmptyWeight(b) +
          trip.items
            .filter((i) => i.bagId === b.id)
            .reduce((ss, i) => ss + itemWeight(i), 0),
        0,
      );
      return { ...p, bags, weight: w };
    });
  }, [trip]);

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

  const maxCarrierWeight = Math.max(...carriers.map((c) => c.weight), 1);


  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>{`
        @page { size: A4; margin: 12mm; }
        .print-running-header { display: none; }
        @media print {
          @page { margin: 26mm 12mm 12mm 12mm; }
          html, body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-hide-on-print { display: none !important; }
          main { max-width: none !important; padding: 0 !important; }
          .page-break-avoid { break-inside: avoid; page-break-inside: avoid; }
          .print-box { border: 1px solid #999 !important; }
          .print-muted { color: #444 !important; }
          .print-bar-bg { background: #e5e5e5 !important; }
          .print-bar-fill { background: #333 !important; }
          .print-running-header {
            display: flex !important;
            position: fixed;
            top: -18mm;
            left: 0;
            right: 0;
            height: 14mm;
            align-items: center;
            gap: 8px;
            padding: 0 0 4px 0;
            border-bottom: 1px solid #999;
            color: #000;
            font-size: 10pt;
          }
          .print-running-header img { height: 12mm; width: auto; }
        }
      `}</style>

      <div className="print-running-header">
        <img src={logoSvg} alt="Sack Stack" />
        <span style={{ fontWeight: 600 }}>Sack Stack</span>
        <span style={{ marginLeft: 'auto', color: '#444' }}>{trip.name}</span>
      </div>


      <header className="no-print sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/trips/$tripId" params={{ tripId }} aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="flex-1 truncate text-base font-semibold">Print — {trip.name}</h1>
          <Button onClick={() => window.print()} size="sm" className="gap-1.5">
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Print / PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-6 py-6 print:px-0 print:py-0">
        <div className="flex items-center gap-4 border-b border-border pb-3">
          <img src={logoSvg} alt="Sack Stack" className="h-16 w-auto shrink-0 object-contain" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold print:text-2xl">Packing list — {trip.name}</h1>
            <p className="text-sm text-muted-foreground print:text-black print-muted">
              {travelTypeLabel(trip)} · {trip.bags.length} bags · {trip.items.length} items · Total {format(totalAll)}
            </p>
          </div>
        </div>

        {carriers.length > 0 && (
          <section className="page-break-avoid print-box rounded-lg border border-border p-3">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground print:text-black">
              Weight by carrier
            </h2>
            <div className="space-y-2">
              {carriers.map((c) => {
                const pct = Math.round((c.weight / maxCarrierWeight) * 100);
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 truncate text-sm font-medium">{c.name}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-sm print-bar-bg bg-muted">
                      <div
                        className="h-full rounded-sm bg-primary print-bar-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-20 shrink-0 text-right text-sm tabular-nums font-medium">
                      {format(c.weight)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {trip.bags.map((bag) => {
          const items = trip.items.filter((i) => i.bagId === bag.id);
          const itemsTotal = items.reduce((s, i) => s + itemWeight(i), 0);
          const total = itemsTotal + bagEmptyWeight(bag);
          const carrier = trip.people.find((p) => p.id === bag.carrierId);
          return (
            <section
              key={bag.id}
              className="page-break-avoid print-box rounded-lg border border-border p-3"
            >
              <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-1 border-b border-border pb-1">
                <h2 className="text-base font-semibold">
                  {bag.name}
                  {!carrier ? (
                    <span className="ml-2 rounded border border-orange-500/60 px-1.5 py-0.5 text-[10px] font-medium text-orange-700 print:border-gray-600 print:text-gray-700">
                      No carrier
                    </span>
                  ) : null}
                </h2>
                <div className="text-xs text-muted-foreground print:text-black print-muted">
                  {carrier ? `Carried by ${carrier.name} · ` : ''}
                  {format(total)}
                  {bag.weightLimitG ? ` / ${format(bag.weightLimitG)}` : ''}
                  {bag.emptyWeightG ? ` · bag ${format(bag.emptyWeightG)}` : ''}
                </div>
              </div>
              {items.length === 0 ? (
                <p className="text-sm italic text-muted-foreground">Empty</p>
              ) : (
                <ul className="space-y-0.5">
                  {items.map((i) => (
                    <li key={i.id} className="flex items-center gap-2 py-0.5 text-sm">
                      <span className="inline-block h-3.5 w-3.5 shrink-0 border border-current text-center text-[10px] leading-3">
                        {i.packed ? '✓' : ''}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {i.name}
                        {i.quantity > 1 ? (
                          <span className="text-muted-foreground print:text-gray-600"> × {i.quantity}</span>
                        ) : null}
                      </span>
                      {i.tags.length ? (
                        <span className="hidden shrink-0 text-[10px] text-muted-foreground print:inline print:text-gray-500">
                          {i.tags.join(' · ')}
                        </span>
                      ) : null}
                      <span className="w-16 shrink-0 text-right tabular-nums text-muted-foreground print:text-black">
                        {format(itemWeight(i))}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}

        {unpacked.length ? (
          <section className="page-break-avoid print-box rounded-lg border border-dashed border-border p-3">
            <h2 className="mb-1.5 text-base font-semibold">Unpacked</h2>
            <ul className="space-y-0.5">
              {unpacked.map((i) => (
                <li key={i.id} className="flex items-center gap-2 py-0.5 text-sm">
                  <span className="inline-block h-3.5 w-3.5 shrink-0 border border-current text-center text-[10px] leading-3">
                    {i.packed ? '✓' : ''}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {i.name}
                    {i.quantity > 1 ? (
                      <span className="text-muted-foreground print:text-gray-600"> × {i.quantity}</span>
                    ) : null}
                  </span>
                  <span className="w-16 shrink-0 text-right tabular-nums text-muted-foreground print:text-black">
                    {format(itemWeight(i))}
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
