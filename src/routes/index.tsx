import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Download, Plus, Trash2, Upload } from 'lucide-react';
import logoSvg from '@/assets/logo.svg';
import { useEffect, useRef, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { useTrips } from '@/hooks/use-trip';
import { Button } from '@/components/ui/button';
import { bagEmptyWeight, itemWeight, travelTypeEmoji, travelTypeLabel } from '@/lib/bag-planner/types';
import { useDisplayUnit } from '@/hooks/use-display-unit';
import { buildExport, downloadJson, parseImport } from '@/lib/bag-planner/trip-io';
import { ManageCustomTravelTypesDialog } from '@/components/bag-planner/ManageCustomTravelTypesDialog';


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
        content: 'Plan bag weights for any trip with carriers, bags, and item weights.',
      },
    ],
  }),
  component: TripsIndex,
});

function TripsIndex() {
  const { trips, deleteTrip, importTrips, addDemoTrip } = useTrips();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const { format } = useDisplayUnit();

  useEffect(() => {
    const onErr = (e: Event) => {
      const detail = (e as CustomEvent<{ message: string }>).detail;
      toast.error(detail?.message ?? 'Storage error');
    };
    window.addEventListener('bagplanner:storage-error', onErr);
    return () => window.removeEventListener('bagplanner:storage-error', onErr);
  }, []);

  const handleExportAll = () => {
    if (!trips.length) {
      toast.error('No trips to export');
      return;
    }
    downloadJson('bag-planner-trips', buildExport(trips));
    toast.success(`Exported ${trips.length} trip${trips.length === 1 ? '' : 's'}`);
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parseImport(text, { regenerateIds: true });
      const added = importTrips(parsed);
      if (added === 0) toast.message('No new trips to import');
      else toast.success(`Imported ${added} trip${added === 1 ? '' : 's'}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid JSON file');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
      <Toaster position="top-center" richColors />
      <header className="border-b border-border bg-gradient-to-r from-primary/10 via-accent/20 to-chart-3/15 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
          <img src={logoSvg} alt="" className="h-12 w-auto shrink-0 object-contain drop-shadow-sm sm:h-16" />
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold tracking-tight text-primary leading-[0.95] text-lg sm:text-2xl">
              <span className="block">Bag</span>
              <span className="block">Planner</span>
            </h1>
            <p className="mt-1 hidden truncate text-xs text-muted-foreground sm:block">
              Plan and balance the weight of your bags before a trip.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleImportFile(f);
              e.target.value = '';
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Import trips from JSON"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <ManageCustomTravelTypesDialog />
          <Button

            variant="outline"
            size="sm"
            onClick={handleExportAll}
            aria-label="Export all trips to JSON"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm" onClick={() => navigate({ to: '/trips/new' })}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New trip</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {!hydrated ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
        ) : trips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-card px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary/20 to-accent/40 text-2xl">
              🧳
            </div>
            <h2 className="text-lg font-semibold">No trips yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first trip to start planning bags and items.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button onClick={() => navigate({ to: '/trips/new' })}>
                <Plus className="h-4 w-4" />
                Create a trip
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const t = addDemoTrip();
                  toast.success('Demo trip loaded');
                  navigate({ to: '/trips/$tripId', params: { tripId: t.id } });
                }}
              >
                Try a demo trip
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trips
              .slice()
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((trip, idx) => {
                const total =
                  trip.items.reduce((s, i) => s + itemWeight(i), 0) +
                  trip.bags.reduce((s, b) => s + bagEmptyWeight(b), 0);
                const accents = [
                  'from-primary/15 to-primary/5 ring-primary/30',
                  'from-accent/30 to-accent/5 ring-accent/40',
                  'from-chart-3/20 to-chart-3/5 ring-chart-3/30',
                  'from-chart-4/20 to-chart-4/5 ring-chart-4/30',
                  'from-chart-5/20 to-chart-5/5 ring-chart-5/30',
                ];
                const accent = accents[idx % accents.length];
                return (
                  <div
                    key={trip.id}
                    className={`group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br ${accent} p-5 ring-1 ring-inset transition-all hover:-translate-y-0.5 hover:shadow-md`}
                  >
                    <Link
                      to="/trips/$tripId"
                      params={{ tripId: trip.id }}
                      className="block"
                    >
                      <div className="text-3xl drop-shadow-sm">{travelTypeEmoji(trip)}</div>
                      <div className="mt-3 truncate text-base font-semibold">
                        {trip.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {travelTypeLabel(trip)}
                      </div>
                      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{trip.bags.length} bags</span>
                        <span>·</span>
                        <span>{trip.items.length} items</span>
                        <span>·</span>
                        <span className="tabular-nums font-medium text-foreground">{format(total)}</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Delete trip "${trip.name}"?`)) deleteTrip(trip.id);
                      }}
                      className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-destructive group-hover:opacity-100"
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
