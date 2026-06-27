import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BAG_TYPE_LABELS, type BagType, type Item } from '@/lib/bag-planner/types';
import { formatWeight, parseWeightInput } from '@/lib/bag-planner/format';
import { TagPicker, TagBadges } from './TagPicker';

const ALL_BAG_TYPES = Object.keys(BAG_TYPE_LABELS) as BagType[];

export function EditItemDialog({
  item,
  customTags,
  open,
  onOpenChange,
  onSave,
  onAddCustomTag,
}: {
  item: Item;
  customTags: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: Partial<Item>) => void;
  onAddCustomTag?: (tag: string) => void;
}) {
  const [name, setName] = useState(item.name);
  const [weight, setWeight] = useState(String(item.weightG));
  const [unit, setUnit] = useState<'g' | 'kg'>('g');
  const [quantity, setQuantity] = useState(item.quantity);
  const [tags, setTags] = useState<string[]>(item.tags);
  const [allowed, setAllowed] = useState<BagType[]>(item.allowedBagTypes ?? []);
  const [packed, setPacked] = useState(item.packed);

  useEffect(() => {
    if (open) {
      setName(item.name);
      setWeight(String(item.weightG));
      setUnit('g');
      setQuantity(item.quantity);
      setTags(item.tags);
      setAllowed(item.allowedBagTypes ?? []);
      setPacked(item.packed);
    }
  }, [open, item]);

  const submit = () => {
    if (!name.trim()) return;
    const grams = parseWeightInput(weight || '0', unit);
    onSave({
      name: name.trim(),
      weightG: grams,
      quantity: Math.max(1, Math.floor(quantity)),
      tags,
      allowedBagTypes: allowed.length ? allowed : undefined,
      packed,
    });
    onOpenChange(false);
  };

  const toggleType = (type: BagType) => {
    setAllowed((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-item-name">Name</Label>
            <Input
              id="edit-item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Weight per item</Label>
              <div className="flex items-stretch overflow-hidden rounded-md border border-input">
                <Input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="rounded-none border-0 focus-visible:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setUnit((u) => (u === 'g' ? 'kg' : 'g'))}
                  className="border-l border-input bg-muted px-3 text-xs font-medium hover:bg-accent"
                >
                  {unit}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Current: {formatWeight(item.weightG)}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-item-qty">Quantity</Label>
              <Input
                id="edit-item-qty"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value || '1', 10))}
              />
              <p className="text-xs text-muted-foreground">
                Total: {formatWeight(parseWeightInput(weight || '0', unit) * Math.max(1, quantity))}
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <Checkbox
              checked={packed}
              onCheckedChange={(v) => setPacked(v === true)}
            />
            <span>Packed</span>
          </label>
          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="flex items-center gap-2">
              <TagPicker
                selected={tags}
                customTags={customTags}
                onChange={setTags}
                onAddCustomTag={onAddCustomTag}
              />
              <TagBadges tags={tags} onRemove={(t) => setTags(tags.filter((x) => x !== t))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Allowed bag types</Label>
            <p className="text-xs text-muted-foreground">
              Leave all unchecked to allow any bag.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_BAG_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-sm"
                >
                  <Checkbox
                    checked={allowed.includes(type)}
                    onCheckedChange={() => toggleType(type)}
                  />
                  <span className="text-xs">{BAG_TYPE_LABELS[type]}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
