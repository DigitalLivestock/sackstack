import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTrip } from '@/hooks/use-trip';
import { itemWeight, travelTypeLabel, GLOBAL_TAGS } from '@/lib/bag-planner/types';
import { formatWeight } from '@/lib/bag-planner/format';

export const Route = createFileRoute('/trips/$tripId/checklist')({
  component: ChecklistView,
});

type GroupKey = 'bag' | 'person' | 'tag';

function ChecklistView() {
  const { tripId } = Route.useParams();
  const { trip, toggleItemPacked } = useTrip(tripId);
  const [groupBy, setGroupBy] = useState<GroupKey>('bag');
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const allTags = useMemo(() => {
    if (!trip) return [];
    const set = new Set<string>([...GLOBAL_TAGS, ...trip.customTags]);
    trip.items.forEach((i) => i.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [trip]);

  if (!trip) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Button asChild>
          <Link to="/">Tillbaka</Link>
        </Button>
      </div>
    );
  }

  const filteredItems = tagFilter
    ? trip.items.filter((i) => i.tags.includes(tagFilter))
    : trip.items;

  const packed = filteredItems.filter((i) => i.packed).length;
  const total = filteredItems.length;
  const pct = total ? (packed / total) * 100 : 0;

  type Group = { key: string; label: string; items: typeof trip.items };
  const groups: Group[] = (() => {
    if (groupBy === 'bag') {
      const list: Group[] = trip.bags.map((b) => ({
        key: b.id,
        label: b.name,
        items: filteredItems.filter((i) => i.bagId === b.id),
      }));
      list.push({
        key: 'unpacked',
        label: 'Ej packat',
        items: filteredItems.filter((i) => !i.bagId || !trip.bags.some((b) => b.id === i.bagId)),
      });
      return list;
    }
    if (groupBy === 'person') {
      const list: Group[] = trip.people.map((p) => {
        const bagIds = new Set(trip.bags.filter((b) => b.carrierId === p.id).map((b) => b.id));
        return {
          key: p.id,
          label: p.name,
          items: filteredItems.filter((i) => i.bagId && bagIds.has(i.bagId)),
        };
      });
      list.push({
        key: 'noperson',
        label: 'Ingen bärare / ej packat',
        items: filteredItems.filter((i) => {
          if (!i.bagId) return true;
          const bag = trip.bags.find((b) => b.id === i.bagId);
          return !bag || !bag.carrierId;
        }),
      });
      return list;
    }
    // tag
    const tags = Array.from(
      new Set(filteredItems.flatMap((i) => (i.tags.length ? i.tags : ['Otaggat']))),
    );
    return tags.map((t) => ({
      key: t,
      label: t,
      items: filteredItems.filter((i) =>
        t === 'Otaggat' ? i.tags.length === 0 : i.tags.includes(t),
      ),
    }));
  })();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/trips/$tripId" params={{ tripId }} aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold sm:text-lg">
              Packlista — {trip.name}
            </h1>
            <div className="truncate text-xs text-muted-foreground">
              {travelTypeLabel(trip)} · {packed}/{total} packat
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/trips/$tripId/print" params={{ tripId }}>
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Skriv ut</span>
            </Link>
          </Button>
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase text-muted-foreground">Gruppera:</span>
          {(['bag', 'person', 'tag'] as GroupKey[]).map((g) => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={`rounded-md border px-2 py-1 text-xs ${
                groupBy === g ? 'border-foreground bg-accent' : 'border-border'
              }`}
            >
              {g === 'bag' ? 'Väska' : g === 'person' ? 'Person' : 'Tagg'}
            </button>
          ))}
          <span className="ml-3 text-xs font-medium uppercase text-muted-foreground">Filter:</span>
          <button
            onClick={() => setTagFilter(null)}
            className={`rounded-md border px-2 py-1 text-xs ${
              tagFilter === null ? 'border-foreground bg-accent' : 'border-border'
            }`}
          >
            Alla
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setTagFilter(t)}
              className={`rounded-md border px-2 py-1 text-xs ${
                tagFilter === t ? 'border-foreground bg-accent' : 'border-border'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {groups.map((g) => {
          if (!g.items.length) return null;
          const gPacked = g.items.filter((i) => i.packed).length;
          const gWeight = g.items.reduce((s, i) => s + itemWeight(i), 0);
          return (
            <section
              key={g.key}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <header className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
                <div className="text-sm font-semibold">{g.label}</div>
                <div className="text-xs tabular-nums text-muted-foreground">
                  {gPacked}/{g.items.length} · {formatWeight(gWeight)}
                </div>
              </header>
              <ul className="divide-y divide-border">
                {g.items.map((i) => (
                  <li
                    key={i.id}
                    className={`flex items-center gap-3 px-3 py-2 ${i.packed ? 'opacity-60' : ''}`}
                  >
                    <Checkbox
                      checked={i.packed}
                      onCheckedChange={() => toggleItemPacked(i.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm ${i.packed ? 'line-through' : ''}`}>
                        {i.name}
                        {i.quantity > 1 ? (
                          <span className="ml-1 text-xs text-muted-foreground">× {i.quantity}</span>
                        ) : null}
                      </div>
                      {i.tags.length ? (
                        <div className="text-[10px] text-muted-foreground">
                          {i.tags.join(' · ')}
                        </div>
                      ) : null}
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {formatWeight(itemWeight(i))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
    </div>
  );
}
