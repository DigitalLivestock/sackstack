import { useEffect, useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ItemImport } from '@/lib/bag-planner/trip-io';
import { parseWeightInput } from '@/lib/bag-planner/format';
import { TagPicker, TagBadges } from './TagPicker';

type Row = ItemImport & { _key: string };

export function ImportItemsDialog({
  items,
  customTags,
  onClose,
  onConfirm,
  onAddCustomTag,
}: {
  items: ItemImport[] | null;
  customTags: string[];
  onClose: () => void;
  onConfirm: (items: ItemImport[]) => void;
  onAddCustomTag?: (tag: string) => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (items) {
      setRows(items.map((it, i) => ({ ...it, _key: `${i}-${it.name}` })));
    }
  }, [items]);

  const open = items !== null;
  const missing = rows.filter((r) => r.weightG === 0).length;

  const update = (key: string, patch: Partial<Row>) => {
    setRows((r) => r.map((row) => (row._key === key ? { ...row, ...patch } : row)));
  };
  const remove = (key: string) => setRows((r) => r.filter((row) => row._key !== key));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Preview import</DialogTitle>
        </DialogHeader>
        <div className="text-xs text-muted-foreground">
          {rows.length} item{rows.length === 1 ? '' : 's'}
          {missing > 0 ? (
            <span className="ml-2 inline-flex items-center gap-1 rounded bg-orange-500/15 px-1.5 py-0.5 text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              {missing} missing weight
            </span>
          ) : null}
        </div>
        <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
          {rows.map((row) => {
            const missingWeight = row.weightG === 0;
            return (
              <div
                key={row._key}
                className={`flex flex-col gap-2 rounded-md border p-2 ${missingWeight ? 'border-orange-500/50 bg-orange-500/5' : 'border-border'}`}
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={row.name}
                    onChange={(e) => update(row._key, { name: e.target.value })}
                    className="h-8 flex-1 text-sm"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={row.weightG}
                    onChange={(e) =>
                      update(row._key, {
                        weightG: parseWeightInput(e.target.value || '0', 'g'),
                        hasWeight: !!e.target.value,
                      })
                    }
                    placeholder="g"
                    className="h-8 w-24 text-sm"
                  />
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={row.quantity}
                    onChange={(e) =>
                      update(row._key, {
                        quantity: Math.max(1, parseInt(e.target.value || '1', 10)),
                      })
                    }
                    className="h-8 w-14 text-sm"
                    aria-label="Quantity"
                    title="Quantity"
                  />
                  <button
                    type="button"
                    onClick={() => remove(row._key)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {missingWeight ? (
                    <span className="inline-flex items-center gap-1 rounded bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-medium text-orange-600">
                      <AlertTriangle className="h-3 w-3" />
                      Missing weight
                    </span>
                  ) : null}
                  <TagPicker
                    selected={row.tags}
                    customTags={customTags}
                    onChange={(tags) => update(row._key, { tags })}
                    onAddCustomTag={onAddCustomTag}
                  />
                  <TagBadges
                    tags={row.tags}
                    onRemove={(t) =>
                      update(row._key, { tags: row.tags.filter((x) => x !== t) })
                    }
                  />
                </div>
              </div>
            );
          })}
          {rows.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              No items to import.
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!rows.length}
            onClick={() => onConfirm(rows.map(({ _key, ...rest }) => rest))}
          >
            Import ({rows.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
