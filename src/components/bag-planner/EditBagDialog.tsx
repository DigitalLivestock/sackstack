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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BAG_TYPE_LABELS, type BagType, type Bag } from '@/lib/bag-planner/types';
import { parseWeightInput } from '@/lib/bag-planner/format';

const BAG_TYPES = Object.keys(BAG_TYPE_LABELS) as BagType[];

export function EditBagDialog({
  bag,
  open,
  onOpenChange,
  onSave,
}: {
  bag: Bag;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: Partial<Bag>) => void;
}) {
  const [name, setName] = useState(bag.name);
  const [type, setType] = useState<BagType>(bag.type);
  const fmtKg = (g?: number) =>
    g ? String((g / 1000).toFixed(2)).replace(/\.00$/, '') : '';
  const [limit, setLimit] = useState(fmtKg(bag.weightLimitG));
  const [empty, setEmpty] = useState(fmtKg(bag.emptyWeightG));

  useEffect(() => {
    if (open) {
      setName(bag.name);
      setType(bag.type);
      setLimit(fmtKg(bag.weightLimitG));
      setEmpty(fmtKg(bag.emptyWeightG));
    }
  }, [open, bag]);

  const submit = () => {
    if (!name.trim()) return;
    const limitG = limit ? parseWeightInput(limit, 'kg') : undefined;
    const emptyG = empty ? parseWeightInput(empty, 'kg') : undefined;
    onSave({ name: name.trim(), type, weightLimitG: limitG, emptyWeightG: emptyG });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit bag</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-bag-name">Name</Label>
            <Input
              id="edit-bag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as BagType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BAG_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {BAG_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-bag-limit">Weight limit (kg, optional)</Label>
            <Input
              id="edit-bag-limit"
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
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
