import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { decodeSharedTrips } from '@/lib/bag-planner/share-link';
import { useTrips } from '@/hooks/use-trip';
import { travelTypeEmoji, travelTypeLabel } from '@/lib/bag-planner/types';
import type { Trip } from '@/lib/bag-planner/types';

export const Route = createFileRoute('/share')({
  head: () => ({
    meta: [
      { title: 'Shared trip — Bag Planner' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: SharePage,
});

function SharePage() {
  const navigate = useNavigate();
  const { importTrips } = useTrips();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const importedRef = useRef(false);

  useEffect(() => {
    try {
      const parsed = decodeSharedTrips(window.location.hash || '');
      if (!parsed.length) throw new Error('Empty share link');
      setTrips(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid share link');
    }
  }, []);

  const accept = () => {
    if (!trips || importedRef.current) return;
    importedRef.current = true;
    importTrips(trips);
    const first = trips[0];
    if (first) navigate({ to: '/trips/$tripId', params: { tripId: first.id } });
    else navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/30">
      <main className="mx-auto max-w-xl px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Shared trip</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Someone shared a packing plan with you. Save it to this browser to
            view and edit it. Nothing is uploaded anywhere.
          </p>

          {error ? (
            <div className="mt-6 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : !trips ? (
            <div className="mt-6 text-sm text-muted-foreground">Decoding…</div>
          ) : (
            <>
              <ul className="mt-6 space-y-2">
                {trips.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 rounded-md border border-border bg-background p-3"
                  >
                    <span className="text-2xl">{travelTypeEmoji(t)}</span>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {travelTypeLabel(t)} · {t.bags.length} bags · {t.items.length} items
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-2">
                <Button onClick={accept}>Save to this browser</Button>
                <Button variant="outline" onClick={() => navigate({ to: '/' })}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
