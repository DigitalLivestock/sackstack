import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AddPersonInline({ onAdd }: { onAdd: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  if (!open) {
    return (
      <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Add carrier</span>
      </Button>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName('');
    setOpen(false);
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => !name && setOpen(false)}
        placeholder="Name"
        className="h-9 w-32"
      />
      <Button type="submit" size="sm">
        Add
      </Button>
    </form>
  );
}
