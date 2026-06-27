import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Download, Plus, Trash2, Upload } from 'lucide-react';
import logoSvg from '@/assets/logo.svg';
import { useRef } from 'react';
import { toast, Toaster } from 'sonner';
import { useTrips } from '@/hooks/use-trip';
import { Button } from '@/components/ui/button';
import { bagEmptyWeight, itemWeight, travelTypeEmoji, travelTypeLabel } from '@/lib/bag-planner/types';
import { formatWeight } from '@/lib/bag-planner/format';
import { buildExport, downloadJson, parseImport } from '@/lib/bag-planner/trip-io';

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
  const { trips, deleteTrip, importTrips } = useTrips();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-4">
          <img src={logoSvg} alt="Bag Planner" className="h-9 w-9 shrink-0 rounded-lg object-contain bg-foreground" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold">Bag Planner</h1>
            <p className="truncate text-xs text-muted-foreground">
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
                const total =
                  trip.items.reduce((s, i) => s + itemWeight(i), 0) +
                  trip.bags.reduce((s, b) => s + bagEmptyWeight(b), 0);
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
                      <div className="text-2xl">{travelTypeEmoji(trip)}</div>
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
