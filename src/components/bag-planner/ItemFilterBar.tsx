import { ArrowDownAZ, ArrowDownWideNarrow, ListFilter, X } from 'lucide-react';

export type ItemFilter = 'all' | 'packed' | 'unpacked' | 'missing-weight';
export type ItemSort = 'manual' | 'name-asc' | 'weight-desc' | 'weight-asc';

const FILTERS: { value: ItemFilter; label: string }[] = [
  { value: 'all', label: 'Alla' },
  { value: 'unpacked', label: 'Ej packat' },
  { value: 'packed', label: 'Packat' },
  { value: 'missing-weight', label: 'Vikt saknas' },
];

const SORTS: { value: ItemSort; label: string; icon: React.ReactNode }[] = [
  { value: 'manual', label: 'Manuell', icon: <ListFilter className="h-3 w-3" /> },
  { value: 'name-asc', label: 'Namn (A–Ö)', icon: <ArrowDownAZ className="h-3 w-3" /> },
  { value: 'weight-desc', label: 'Vikt (tyngst)', icon: <ArrowDownWideNarrow className="h-3 w-3" /> },
  { value: 'weight-asc', label: 'Vikt (lättast)', icon: <ArrowDownWideNarrow className="h-3 w-3 rotate-180" /> },
];

export function ItemFilterBar({
  filter,
  sort,
  onFilter,
  onSort,
}: {
  filter: ItemFilter;
  sort: ItemSort;
  onFilter: (f: ItemFilter) => void;
  onSort: (s: ItemSort) => void;
}) {
  const active = filter !== 'all' || sort !== 'manual';
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs">
      <span className="font-medium uppercase tracking-wide text-muted-foreground">Filter</span>
      <div className="flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onFilter(f.value)}
            className={`rounded-md border px-2 py-0.5 transition-colors ${
              filter === f.value
                ? 'border-foreground bg-accent text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <span className="ml-2 font-medium uppercase tracking-wide text-muted-foreground">Sortera</span>
      <div className="flex flex-wrap gap-1">
        {SORTS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onSort(s.value)}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 transition-colors ${
              sort === s.value
                ? 'border-foreground bg-accent text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>
      {active ? (
        <button
          type="button"
          onClick={() => {
            onFilter('all');
            onSort('manual');
          }}
          className="ml-auto inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Rensa
        </button>
      ) : null}
    </div>
  );
}

export function applyItemFilterSort<T extends { name: string; weightG: number; quantity: number; packed: boolean }>(
  items: T[],
  filter: ItemFilter,
  sort: ItemSort,
): T[] {
  let out = items;
  if (filter === 'packed') out = out.filter((i) => i.packed);
  else if (filter === 'unpacked') out = out.filter((i) => !i.packed);
  else if (filter === 'missing-weight') out = out.filter((i) => i.weightG === 0);

  if (sort !== 'manual') {
    const arr = [...out];
    if (sort === 'name-asc') arr.sort((a, b) => a.name.localeCompare(b.name, 'sv'));
    else if (sort === 'weight-desc')
      arr.sort((a, b) => b.weightG * b.quantity - a.weightG * a.quantity);
    else if (sort === 'weight-asc')
      arr.sort((a, b) => a.weightG * a.quantity - b.weightG * b.quantity);
    out = arr;
  }
  return out;
}
