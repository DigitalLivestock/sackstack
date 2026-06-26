import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseWeightInput } from '@/lib/bag-planner/format';

export function AddItemForm({
  onAdd,
}: {
  onAdd: (name: string, weightG: number) => void;
}) {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'g' | 'kg'>('g');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const grams = parseWeightInput(weight || '0', unit);
    onAdd(name.trim(), grams);
    setName('');
    setWeight('');
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-stretch gap-2">
      <Input
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="min-w-0 flex-1"
      />
      <div className="flex shrink-0 items-stretch overflow-hidden rounded-md border border-input">
        <Input
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          placeholder="0"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-20 rounded-none border-0 focus-visible:ring-0"
        />
        <button
          type="button"
          onClick={() => setUnit((u) => (u === 'g' ? 'kg' : 'g'))}
          className="border-l border-input bg-muted px-2 text-xs font-medium hover:bg-accent"
        >
          {unit}
        </button>
      </div>
      <Button type="submit" size="sm" className="shrink-0">
        <Plus className="h-4 w-4" />
        Add
      </Button>
    </form>
  );
}
