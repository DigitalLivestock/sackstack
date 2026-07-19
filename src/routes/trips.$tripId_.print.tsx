import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrip } from '@/hooks/use-trip';
import { bagEmptyWeight, itemWeight, travelTypeLabel } from '@/lib/bag-planner/types';
import { useDisplayUnit } from '@/hooks/use-display-unit';
import logoSvg from '@/assets/logo.svg';

export const Route = createFileRoute('/trips/$tripId_/print')({
  head: ({ params }) => ({
    meta: [
      { title: `Print ${params.tripId.slice(0, 6)} — Sack Stack` },
      { name: 'description', content: 'Printable packing list with carriers, bags, and per-bag weight totals — ready for PDF export.' },
      { property: 'og:title', content: `Print ${params.tripId.slice(0, 6)} — Sack Stack` },
      { property: 'og:description', content: `Printable packing list for trip ${params.tripId.slice(0, 6)} — carriers, bags, and per-bag weight totals.` },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ auto: s.auto === '1' || s.auto === 1 || s.auto === true }),
  component: PrintView,
});

function PrintView() {
  const { tripId } = Route.useParams();
  const { auto } = Route.useSearch();
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

  // Auto-trigger the browser's print dialog once the page has hydrated and rendered.
  useEffect(() => {
    if (!auto || !hydrated || !trip) return;
    const t = setTimeout(() => {
      try {
        window.print();
      } catch {
        /* noop */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [auto, hydrated, trip]);

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
  const packedCount = trip.items.filter((i) => i.packed).length;
  const maxCarrierWeight = Math.max(...carriers.map((c) => c.weight), 1);
  const generated = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-muted/40 text-foreground print:bg-white">
      <style>{`
        @page { size: A4; margin: 14mm; }
        @media print {
          html, body {
            background: #fff !important;
            color: #111 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          .print-sheet {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
            background: #fff !important;
          }
          .print-page-break { break-before: page; page-break-before: always; }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
          .print-bar-track { background: #e6e6e6 !important; }
          .print-bar-fill { background: #111 !important; }
          .print-hairline { border-color: #bbb !important; }
          .print-dim { color: #555 !important; }
          a { color: inherit !important; text-decoration: none !important; }
        }
      `}</style>

      {/* Toolbar (screen only) */}
      <header className="no-print sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/trips/$tripId" params={{ tripId }} aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="flex-1 truncate text-sm text-muted-foreground">
            Print preview — {trip.name}
          </span>
          <Button onClick={() => window.print()} size="sm" className="gap-1.5">
            <Printer className="h-4 w-4" />
            <span>Print / Save as PDF</span>
          </Button>
        </div>
      </header>

      {/* Paper sheet */}
      <main className="mx-auto my-6 max-w-3xl bg-white text-black shadow-sm ring-1 ring-border print-sheet print:my-0 print:ring-0">
        <div className="space-y-6 px-10 py-10 print:px-0 print:py-0">
          {/* Document header */}
          <header className="flex items-start justify-between gap-6 border-b border-neutral-300 pb-4 print-hairline">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500 print-dim">
                Packing list
              </div>
              <h1 className="mt-1 truncate text-2xl font-semibold leading-tight text-neutral-900">
                {trip.name}
              </h1>
              <div className="mt-1 text-sm text-neutral-600 print-dim">
                {travelTypeLabel(trip)} · Generated {generated}
              </div>
            </div>
            <img src={logoSvg} alt="Sack Stack" className="h-14 w-auto shrink-0 object-contain" />
          </header>

          {/* Summary stats */}
          <section className="avoid-break grid grid-cols-4 gap-3 text-center">
            {[
              { label: 'Total weight', value: format(totalAll) },
              { label: 'Bags', value: String(trip.bags.length) },
              { label: 'Items', value: String(trip.items.length) },
              { label: 'Packed', value: `${packedCount}/${trip.items.length}` },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded border border-neutral-300 px-2 py-2 print-hairline"
              >
                <div className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500 print-dim">
                  {s.label}
                </div>
                <div className="mt-0.5 text-base font-semibold tabular-nums text-neutral-900">
                  {s.value}
                </div>
              </div>
            ))}
          </section>

          {/* Weight by carrier */}
          {carriers.length > 0 && (
            <section className="avoid-break">
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500 print-dim">
                Weight by carrier
              </h2>
              <div className="space-y-1.5">
                {carriers.map((c) => {
                  const pct = Math.round((c.weight / maxCarrierWeight) * 100);
                  return (
                    <div key={c.id} className="flex items-center gap-3 text-[13px]">
                      <span className="w-32 shrink-0 truncate font-medium text-neutral-900">
                        {c.name}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-sm bg-neutral-200 print-bar-track">
                        <div
                          className="h-full bg-neutral-900 print-bar-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-20 shrink-0 text-right tabular-nums text-neutral-900">
                        {format(c.weight)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Bags */}
          <div className="space-y-4">
            {trip.bags.map((bag) => {
              const items = trip.items.filter((i) => i.bagId === bag.id);
              const itemsTotal = items.reduce((s, i) => s + itemWeight(i), 0);
              const total = itemsTotal + bagEmptyWeight(bag);
              const carrier = trip.people.find((p) => p.id === bag.carrierId);
              const over = bag.weightLimitG && total > bag.weightLimitG;
              return (
                <section key={bag.id} className="avoid-break">
                  <div className="flex items-baseline justify-between gap-3 border-b border-neutral-400 pb-1 print-hairline">
                    <h2 className="text-[15px] font-semibold text-neutral-900">
                      {bag.name}
                      {!carrier ? (
                        <span className="ml-2 rounded-sm border border-neutral-500 px-1 py-px text-[9px] font-medium uppercase tracking-wider text-neutral-600">
                          No carrier
                        </span>
                      ) : null}
                      {over ? (
                        <span className="ml-2 rounded-sm border border-neutral-900 px-1 py-px text-[9px] font-medium uppercase tracking-wider text-neutral-900">
                          Over limit
                        </span>
                      ) : null}
                    </h2>
                    <div className="text-[11px] tabular-nums text-neutral-600 print-dim">
                      {carrier ? `${carrier.name} · ` : ''}
                      <span className="font-semibold text-neutral-900">{format(total)}</span>
                      {bag.weightLimitG ? ` / ${format(bag.weightLimitG)}` : ''}
                      {bag.emptyWeightG ? ` · bag ${format(bag.emptyWeightG)}` : ''}
                    </div>
                  </div>
                  {items.length === 0 ? (
                    <p className="mt-1 text-[12px] italic text-neutral-500 print-dim">
                      No items in this bag.
                    </p>
                  ) : (
                    <ul>
                      {items.map((i, idx) => (
                        <li
                          key={i.id}
                          className={`flex items-center gap-2 py-1 text-[12.5px] ${
                            idx > 0 ? 'border-t border-neutral-200 print-hairline' : ''
                          }`}
                        >
                          <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center border border-neutral-500 text-[9px] leading-none">
                            {i.packed ? '✓' : ''}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-neutral-900">
                            {i.name}
                            {i.quantity > 1 ? (
                              <span className="text-neutral-500 print-dim"> × {i.quantity}</span>
                            ) : null}
                          </span>
                          {i.tags.length ? (
                            <span className="hidden shrink-0 text-[10px] text-neutral-500 print:inline print-dim">
                              {i.tags.join(' · ')}
                            </span>
                          ) : null}
                          <span className="w-16 shrink-0 text-right tabular-nums text-neutral-800">
                            {format(itemWeight(i))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>

          {/* Unpacked */}
          {unpacked.length ? (
            <section className="avoid-break">
              <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-neutral-400 pb-1 print-hairline">
                <h2 className="text-[15px] font-semibold text-neutral-900">Unpacked</h2>
                <div className="text-[11px] text-neutral-600 print-dim">
                  {unpacked.length} item{unpacked.length === 1 ? '' : 's'} without a bag
                </div>
              </div>
              <ul>
                {unpacked.map((i, idx) => (
                  <li
                    key={i.id}
                    className={`flex items-center gap-2 py-1 text-[12.5px] ${
                      idx > 0 ? 'border-t border-neutral-200 print-hairline' : ''
                    }`}
                  >
                    <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center border border-neutral-500 text-[9px] leading-none">
                      {i.packed ? '✓' : ''}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-neutral-900">
                      {i.name}
                      {i.quantity > 1 ? (
                        <span className="text-neutral-500 print-dim"> × {i.quantity}</span>
                      ) : null}
                    </span>
                    <span className="w-16 shrink-0 text-right tabular-nums text-neutral-800">
                      {format(itemWeight(i))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Footer */}
          <footer className="border-t border-neutral-300 pt-3 text-[10px] text-neutral-500 print-hairline print-dim">
            <div className="flex items-center justify-between">
              <span>Sack Stack · sackstack.app</span>
              <span>{generated}</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
