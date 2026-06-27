import { useState } from 'react';
import { Plus } from 'lucide-react';
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
import { BAG_TYPE_LABELS, type BagType, type Bag } from '@/lib/bag-planner/types';
import { parseWeightInput } from '@/lib/bag-planner/format';

const BAG_TYPES = Object.keys(BAG_TYPE_LABELS) as BagType[];

export function AddBagDialog({ onAdd }: { onAdd: (bag: Omit<Bag, 'id'>) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<BagType>('backpack');
  const [limit, setLimit] = useState('');
  const [empty, setEmpty] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    const limitG = limit ? parseWeightInput(limit, 'kg') : undefined;
    const emptyG = empty ? parseWeightInput(empty, 'kg') : undefined;
    onAdd({ name: name.trim(), type, weightLimitG: limitG, emptyWeightG: emptyG });
    setName('');
    setLimit('');
    setEmpty('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4" />
          Add bag
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a bag</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bag-name">Name</Label>
            <Input
              id="bag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My carry-on"
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
            <Label htmlFor="bag-limit">Weight limit (kg, optional)</Label>
            <Input
              id="bag-limit"
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="e.g. 8"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bag-empty">Bag's own weight (kg, optional)</Label>
            <Input
              id="bag-empty"
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={empty}
              onChange={(e) => setEmpty(e.target.value)}
              placeholder="e.g. 1.2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Add bag</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
