import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseWeightInput } from '@/lib/bag-planner/format';
import { TagPicker, TagBadges } from './TagPicker';
import { UnitToggle } from './UnitToggle';

export function AddItemForm({
  customTags,
  onAdd,
  onAddCustomTag,
}: {
  customTags: string[];
  onAdd: (name: string, weightG: number, opts?: { quantity?: number; tags?: string[] }) => void;
  onAddCustomTag?: (tag: string) => void;
}) {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'g' | 'kg'>('g');
  const [quantity, setQuantity] = useState('1');
  const [tags, setTags] = useState<string[]>([]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const grams = parseWeightInput(weight || '0', unit);
    const q = Math.max(1, parseInt(quantity || '1', 10));
    onAdd(name.trim(), grams, { quantity: q, tags });
    setName('');
    setWeight('');
    setQuantity('1');
    setTags([]);
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      {/* Row 1: name fills full width */}
      <Input
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full"
      />
      {/* Row 2: weight + unit + qty + submit */}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          placeholder="0"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="min-w-0 flex-1"
          aria-label="Weight"
        />
        <UnitToggle unit={unit} onChange={setUnit} />
        <span className="text-xs text-muted-foreground whitespace-nowrap">Qty</span>
        <Input
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-14 shrink-0"
          aria-label="Quantity"
          title="Quantity"
        />
        <Button type="submit" size="sm" className="shrink-0">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <TagPicker
          selected={tags}
          customTags={customTags}
          onChange={setTags}
          onAddCustomTag={onAddCustomTag}
        />
        <TagBadges tags={tags} onRemove={(t) => setTags(tags.filter((x) => x !== t))} />
      </div>
    </form>
  );
}
