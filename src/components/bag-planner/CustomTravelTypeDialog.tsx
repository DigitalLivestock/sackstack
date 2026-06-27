import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BAG_TYPE_LABELS,
  type BagType,
  type CustomTravelType,
  type Trip,
} from '@/lib/bag-planner/types';

const ALL_BAG_TYPES = Object.keys(BAG_TYPE_LABELS) as BagType[];

export function CustomTravelTypeDialog({
  trip,
  onAdd,
  onRemove,
  onSelect,
}: {
  trip: Trip;
  onAdd: (ct: Omit<CustomTravelType, 'id'>) => void;
  onRemove: (id: string) => void;
  onSelect: (travelType: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎒');
  const [bags, setBags] = useState<{ name: string; type: BagType }[]>([
    { name: 'Bag', type: 'backpack' },
  ]);
  const [sugs, setSugs] = useState<{ name: string; weightG: number }[]>([
    { name: '', weightG: 0 },
    { name: '', weightG: 0 },
    { name: '', weightG: 0 },
  ]);

  const reset = () => {
    setName('');
    setEmoji('🎒');
    setBags([{ name: 'Bag', type: 'backpack' }]);
    setSugs([
      { name: '', weightG: 0 },
      { name: '', weightG: 0 },
      { name: '', weightG: 0 },
    ]);
  };

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      emoji,
      bagPresets: bags.filter((b) => b.name.trim()),
      itemSuggestions: sugs
        .filter((s) => s.name.trim())
        .map((s) => ({ name: s.name.trim(), weightG: s.weightG })),
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Custom travel types
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Custom travel types</DialogTitle>
        </DialogHeader>

        {trip.customTravelTypes.length > 0 ? (
          <div className="space-y-1">
            <Label className="text-xs uppercase">Existing</Label>
            <div className="space-y-1">
              {trip.customTravelTypes.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5"
                >
                  <span>{c.emoji ?? '🎒'}</span>
                  <span className="flex-1 truncate text-sm">{c.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      onSelect(c.id);
                      setOpen(false);
                    }}
                  >
                    Use
                  </Button>
                  <button
                    type="button"
                    onClick={() => onRemove(c.id)}
                    className="rounded p-1 text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-3 border-t border-border pt-3">
          <Label className="text-xs uppercase">New travel type</Label>
          <div className="grid grid-cols-[60px_1fr] gap-2">
            <Input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={4}
              aria-label="Emoji"
            />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name (e.g. Winter trip)"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Preset bags</Label>
            {bags.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={b.name}
                  onChange={(e) =>
                    setBags(bags.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                  }
                  placeholder="Name"
                  className="h-8"
                />
                <Select
                  value={b.type}
                  onValueChange={(v) =>
                    setBags(
                      bags.map((x, j) => (j === i ? { ...x, type: v as BagType } : x)),
                    )
                  }
                >
                  <SelectTrigger className="h-8 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_BAG_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {BAG_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  type="button"
                  onClick={() => setBags(bags.filter((_, j) => j !== i))}
                  className="rounded p-1 text-muted-foreground hover:text-destructive"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setBags([...bags, { name: '', type: 'backpack' }])}
            >
              <Plus className="h-4 w-4" />
              Add bag
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Item suggestions (shown in Suggestions)</Label>
            {sugs.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={s.name}
                  onChange={(e) =>
                    setSugs(sugs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                  }
                  placeholder="Name"
                  className="h-8 flex-1"
                />
                <Input
                  type="number"
                  min="0"
                  value={s.weightG}
                  onChange={(e) =>
                    setSugs(
                      sugs.map((x, j) =>
                        j === i ? { ...x, weightG: parseInt(e.target.value || '0', 10) } : x,
                      ),
                    )
                  }
                  placeholder="g"
                  className="h-8 w-24"
                />
                <button
                  type="button"
                  onClick={() => setSugs(sugs.filter((_, j) => j !== i))}
                  className="rounded p-1 text-muted-foreground hover:text-destructive"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSugs([...sugs, { name: '', weightG: 0 }])}
            >
              <Plus className="h-4 w-4" />
              Add suggestion
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={submit} disabled={!name.trim()}>
            Save travel type
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
